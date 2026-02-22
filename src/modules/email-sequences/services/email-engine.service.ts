import { prisma } from '@/lib/prisma';
import { sendTemplateEmail } from '@/lib/email';
import type { FunnelStage, EmailLog } from '@prisma/client';
import type { SendTemplateEmailParams } from '../types';
import { EmailTemplateService } from './email-template.service';
import { EmailSequenceService } from './email-sequence.service';
import { addHours } from 'date-fns';

export class EmailEngineService {
    /**
     * Disparar secuencia cuando lead entra a una etapa
     */
    static async triggerSequence(prospectId: string, funnelStage: FunnelStage, tenantId: string): Promise<void> {
        // Buscar secuencias activas para esta etapa
        const sequences = await EmailSequenceService.getByTriggerStage(funnelStage, tenantId);

        if (sequences.length === 0) {
            console.log(`No active sequences for stage: ${funnelStage}`);
            return;
        }

        // Obtener prospect
        const prospect = await prisma.prospect.findUnique({
            where: { id: prospectId },
        });

        if (!prospect || !prospect.email) {
            console.log('Prospect not found or no email');
            return;
        }

        // Para cada secuencia, programar sus pasos
        for (const sequence of sequences) {
            for (const step of sequence.steps) {
                // Calcular cuándo enviar este email
                const scheduledFor = addHours(new Date(), step.delayHours);

                // Crear registro de log con estado PENDING
                await prisma.emailLog.create({
                    data: {
                        to: prospect.email,
                        subject: `Sequence: ${sequence.name} - Step ${step.orderIndex + 1}`,
                        templateId: step.templateId,
                        prospectId: prospect.id,
                        status: 'PENDING',
                        tenantId,
                        sentAt: scheduledFor,
                        metadata: {
                            sequenceId: sequence.id,
                            stepId: step.id,
                            scheduledFor: scheduledFor.toISOString(),
                        },
                    },
                });
            }
        }
    }

    /**
     * Procesar emails pendientes (llamado por cron job)
     */
    static async processScheduledEmails(): Promise<{ sent: number; failed: number }> {
        let sent = 0;
        let failed = 0;

        // Buscar emails PENDING que ya deberían enviarse
        const pendingEmails = await prisma.emailLog.findMany({
            where: {
                status: 'PENDING',
                sentAt: {
                    lte: new Date(),
                },
            },
            include: {
                template: true,
                prospect: true,
            },
            take: 50, // Procesar máximo 50 por ejecución
        });

        for (const emailLog of pendingEmails) {
            try {
                if (!emailLog.template) {
                    throw new Error('Template not found');
                }

                if (!emailLog.prospect) {
                    throw new Error('Prospect not found');
                }

                // Preparar variables para el template
                const variables: Record<string, string> = {
                    nombre: emailLog.prospect.name,
                    email: emailLog.prospect.email || '',
                    telefono: emailLog.prospect.phone,
                    // Agregar más variables según necesidad
                };

                // Renderizar template
                const htmlContent = EmailTemplateService.renderTemplate(
                    emailLog.template.htmlContent,
                    variables
                );

                // Enviar email
                const result = await sendTemplateEmail({
                    to: emailLog.to,
                    subject: emailLog.template.subject,
                    html: htmlContent,
                });

                // Actualizar log como SENT
                await prisma.emailLog.update({
                    where: { id: emailLog.id },
                    data: {
                        status: 'SENT',
                        resendId: result.id,
                        sentAt: new Date(),
                        metadata: {
                            ...((emailLog.metadata as any) || {}),
                            sentSuccess: true,
                        },
                    },
                });

                sent++;
            } catch (error) {
                console.error(`Error sending email ${emailLog.id}:`, error);

                // Actualizar log como FAILED
                await prisma.emailLog.update({
                    where: { id: emailLog.id },
                    data: {
                        status: 'FAILED',
                        metadata: {
                            ...((emailLog.metadata as any) || {}),
                            error: error instanceof Error ? error.message : 'Unknown error',
                        },
                    },
                });

                failed++;
            }
        }

        return { sent, failed };
    }

    /**
     * Enviar email individual con template
     */
    static async sendTemplateEmail(params: SendTemplateEmailParams): Promise<EmailLog> {
        const { to, templateId, variables, prospectId, tenantId } = params;

        // Obtener template
        const template = await EmailTemplateService.getById(templateId, tenantId);

        if (!template) {
            throw new Error('Template not found');
        }

        // Validar variables
        const isValid = EmailTemplateService.validateVariables(template, variables);
        if (!isValid) {
            throw new Error('Missing required variables');
        }

        // Renderizar template
        const htmlContent = EmailTemplateService.renderTemplate(template.htmlContent, variables);

        try {
            // Enviar email
            const result = await sendTemplateEmail({
                to,
                subject: template.subject,
                html: htmlContent,
            });

            // Crear log
            const emailLog = await prisma.emailLog.create({
                data: {
                    to,
                    subject: template.subject,
                    templateId,
                    prospectId,
                    status: 'SENT',
                    resendId: result.id,
                    tenantId,
                },
            });

            // Si hay prospectId, crear interacción
            if (prospectId) {
                await prisma.prospectInteraction.create({
                    data: {
                        type: 'EMAIL_ENVIADO',
                        content: `Email enviado: ${template.subject}`,
                        prospectId,
                        tenantId,
                    },
                });
            }

            return emailLog;
        } catch (error) {
            // Crear log de fallo
            const emailLog = await prisma.emailLog.create({
                data: {
                    to,
                    subject: template.subject,
                    templateId,
                    prospectId,
                    status: 'FAILED',
                    tenantId,
                    metadata: {
                        error: error instanceof Error ? error.message : 'Unknown error',
                    },
                },
            });

            throw error;
        }
    }

    /**
     * Cancelar emails pendientes de un prospect
     */
    static async cancelPendingEmails(prospectId: string, tenantId: string): Promise<number> {
        const result = await prisma.emailLog.updateMany({
            where: {
                prospectId,
                tenantId,
                status: 'PENDING',
            },
            data: {
                status: 'CANCELLED',
            },
        });

        return result.count;
    }
}

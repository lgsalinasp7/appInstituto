import { prisma } from '@/lib/prisma';
import type { FunnelStage } from '@prisma/client';
import { EmailEngineService } from '@/modules/email-sequences';
import { WhatsAppTemplateService } from '@/modules/whatsapp/services/whatsapp-template.service';
import { LeadScoringService } from './lead-scoring.service';

export class AutomationService {
    /**
     * Llamado cuando un lead cambia de etapa
     * Orquesta todas las automatizaciones: emails, WhatsApp, scoring, tareas
     */
    static async onStageChange(
        prospectId: string,
        fromStage: FunnelStage,
        toStage: FunnelStage,
        tenantId: string
    ): Promise<void> {
        try {
            // 1. Disparar secuencia de email para la nueva etapa
            await EmailEngineService.triggerSequence(prospectId, toStage, tenantId);

            // 2. Enviar WhatsApp según etapa
            await this.sendWhatsAppByStage(prospectId, toStage, tenantId);

            // 3. Recalcular score
            const newScore = await LeadScoringService.calculateScore(prospectId, tenantId);
            await LeadScoringService.updateTemperature(prospectId, newScore, tenantId);

            // 4. Crear tarea para agente IA si aplica (Fase 4)
            // await this.createAgentTask(prospectId, toStage, tenantId);

            console.log(`Automations triggered for prospect ${prospectId}: ${fromStage} -> ${toStage}`);
        } catch (error) {
            console.error('Error in automation service:', error);
            // No throw para evitar que el cambio de etapa falle si la automation falla
        }
    }

    /**
     * Enviar WhatsApp según la etapa del funnel
     */
    private static async sendWhatsAppByStage(
        prospectId: string,
        stage: FunnelStage,
        tenantId: string
    ): Promise<void> {
        try {
            switch (stage) {
                case 'NUEVO':
                    // Enviar bienvenida
                    await WhatsAppTemplateService.sendWelcome(prospectId, tenantId);
                    break;

                case 'MASTERCLASS_REGISTRADO':
                    // Programar recordatorios (24h y 1h antes)
                    // Esto debería hacerse con un cron job basado en la fecha de la masterclass
                    break;

                case 'MASTERCLASS_ASISTIO':
                    // Enviar seguimiento post-masterclass
                    await WhatsAppTemplateService.sendPostMasterclassFollowUp(prospectId, tenantId);
                    break;

                case 'APLICACION':
                    // Confirmar recepción de aplicación
                    await WhatsAppTemplateService.sendApplicationConfirmation(prospectId, tenantId);
                    break;

                case 'LLAMADA_AGENDADA':
                    // Enviar recordatorio de llamada
                    const prospect = await prisma.prospect.findUnique({
                        where: { id: prospectId },
                    });
                    if (prospect && prospect.nextFollowUpAt) {
                        await WhatsAppTemplateService.sendCallReminder(
                            prospectId,
                            prospect.nextFollowUpAt,
                            tenantId
                        );
                    }
                    break;

                default:
                    // No action for other stages
                    break;
            }
        } catch (error) {
            console.error(`Error sending WhatsApp for stage ${stage}:`, error);
        }
    }

    /**
     * Cancelar automatizaciones pendientes de un prospect
     * Útil cuando un lead se pierde o se matricula
     */
    static async cancelPendingAutomations(prospectId: string, tenantId: string): Promise<void> {
        // Cancelar emails pendientes
        await EmailEngineService.cancelPendingEmails(prospectId, tenantId);

        // Aquí se podrían cancelar otras automatizaciones si las hubiera
    }

    /**
     * Procesar recordatorios de masterclass
     * Llamado por cron job
     */
    static async processMasterclassReminders(): Promise<{ sent24h: number; sent1h: number }> {
        let sent24h = 0;
        let sent1h = 0;

        const { addHours, addDays } = await import('date-fns');
        const now = new Date();

        // Recordatorios 24h antes
        const masterclasses24h = await prisma.masterclass.findMany({
            where: {
                isActive: true,
                scheduledAt: {
                    gte: addHours(now, 23),
                    lte: addHours(now, 25),
                },
            },
        });

        for (const masterclass of masterclasses24h) {
            const prospects = await prisma.prospect.findMany({
                where: {
                    masterclassId: masterclass.id,
                    funnelStage: 'MASTERCLASS_REGISTRADO',
                    tenantId: masterclass.tenantId,
                },
            });

            for (const prospect of prospects) {
                try {
                    await WhatsAppTemplateService.sendMasterclassReminder24h(prospect.id, masterclass.tenantId);
                    sent24h++;
                } catch (error) {
                    console.error(`Error sending 24h reminder to ${prospect.id}:`, error);
                }
            }
        }

        // Recordatorios 1h antes
        const masterclasses1h = await prisma.masterclass.findMany({
            where: {
                isActive: true,
                scheduledAt: {
                    gte: now,
                    lte: addHours(now, 2),
                },
            },
        });

        for (const masterclass of masterclasses1h) {
            const prospects = await prisma.prospect.findMany({
                where: {
                    masterclassId: masterclass.id,
                    funnelStage: 'MASTERCLASS_REGISTRADO',
                    tenantId: masterclass.tenantId,
                },
            });

            for (const prospect of prospects) {
                try {
                    await WhatsAppTemplateService.sendMasterclassReminder1h(prospect.id, masterclass.tenantId);
                    sent1h++;
                } catch (error) {
                    console.error(`Error sending 1h reminder to ${prospect.id}:`, error);
                }
            }
        }

        return { sent24h, sent1h };
    }
}

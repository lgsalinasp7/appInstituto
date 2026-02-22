import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import type { WhatsAppMessage } from '@prisma/client';

export interface WhatsAppMessagePayload {
    to: string;
    message: string;
}

export interface WhatsAppTemplatePayload {
    to: string;
    templateName: string;
    language?: string;
    components?: Array<{
        type: string;
        parameters: Array<{
            type: string;
            text?: string;
        }>;
    }>;
}

export interface SendAndLogPayload {
    to: string;
    message: string;
    prospectId?: string;
    templateName?: string;
    tenantId: string;
}

export class WhatsAppService {
    private static API_URL = process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v22.0";
    private static PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    private static ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    private static VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
    private static APP_SECRET = process.env.WHATSAPP_APP_SECRET;

    /**
     * Enviar mensaje de texto libre (dentro de ventana 24h)
     */
    static async sendMessage(payload: WhatsAppMessagePayload): Promise<boolean> {
        const { to, message } = payload;

        if (!this.PHONE_NUMBER_ID || !this.ACCESS_TOKEN) {
            console.error("WhatsApp API not configured. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN");
            return false;
        }

        try {
            const cleanPhone = to.replace(/\D/g, "");
            const phoneWithCountry = cleanPhone.startsWith("57") ? cleanPhone : `57${cleanPhone}`;

            const response = await fetch(
                `${this.API_URL}/${this.PHONE_NUMBER_ID}/messages`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${this.ACCESS_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        messaging_product: "whatsapp",
                        to: phoneWithCountry,
                        type: "text",
                        text: { body: message },
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error("WhatsApp API Error:", errorData);
                return false;
            }

            return true;
        } catch (error) {
            console.error("Error sending WhatsApp message:", error);
            return false;
        }
    }

    /**
     * Enviar mensaje con plantilla aprobada por Meta
     */
    static async sendTemplateMessage(payload: WhatsAppTemplatePayload): Promise<{ success: boolean; waMessageId?: string }> {
        const { to, templateName, language = 'es', components = [] } = payload;

        if (!this.PHONE_NUMBER_ID || !this.ACCESS_TOKEN) {
            console.error("WhatsApp API not configured");
            return { success: false };
        }

        try {
            const cleanPhone = to.replace(/\D/g, "");
            const phoneWithCountry = cleanPhone.startsWith("57") ? cleanPhone : `57${cleanPhone}`;

            const response = await fetch(
                `${this.API_URL}/${this.PHONE_NUMBER_ID}/messages`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${this.ACCESS_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        messaging_product: "whatsapp",
                        to: phoneWithCountry,
                        type: "template",
                        template: {
                            name: templateName,
                            language: { code: language },
                            components,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error("WhatsApp Template API Error:", errorData);
                return { success: false };
            }

            const data = await response.json();
            return { success: true, waMessageId: data.messages?.[0]?.id };
        } catch (error) {
            console.error("Error sending WhatsApp template message:", error);
            return { success: false };
        }
    }

    /**
     * Procesar webhook entrante de Meta
     */
    static async processWebhook(body: any, tenantId: string): Promise<void> {
        try {
            // Extraer mensajes entrantes
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;

            if (!value) return;

            // Procesar mensajes
            const messages = value.messages || [];
            for (const message of messages) {
                const from = message.from;
                const messageText = message.text?.body || '';
                const waMessageId = message.id;

                // Buscar o crear Prospect por teléfono
                let prospect = await prisma.prospect.findFirst({
                    where: { phone: from, tenantId },
                });

                if (!prospect) {
                    // Crear nuevo prospect con stage NUEVO, source WHATSAPP
                    const defaultAdvisor = await this.getDefaultAdvisor(tenantId);
                    if (!defaultAdvisor) {
                        console.error("No default advisor found for tenant", tenantId);
                        continue;
                    }

                    prospect = await prisma.prospect.create({
                        data: {
                            name: from,
                            phone: from,
                            funnelStage: 'NUEVO',
                            source: 'WHATSAPP',
                            temperature: 'FRIO',
                            advisorId: defaultAdvisor.id,
                            tenantId,
                        },
                    });
                }

                // Crear WhatsAppMessage (INBOUND)
                await prisma.whatsAppMessage.create({
                    data: {
                        waMessageId,
                        direction: 'INBOUND',
                        phone: from,
                        content: messageText,
                        status: 'DELIVERED',
                        prospectId: prospect.id,
                        tenantId,
                    },
                });

                // Crear ProspectInteraction (WHATSAPP_RECIBIDO)
                await prisma.prospectInteraction.create({
                    data: {
                        type: 'WHATSAPP_RECIBIDO',
                        content: messageText,
                        prospectId: prospect.id,
                        tenantId,
                    },
                });

                // Actualizar lastContactAt
                await prisma.prospect.update({
                    where: { id: prospect.id },
                    data: { lastContactAt: new Date() },
                });

                // Auto-respuesta con Margy (solo si está habilitado)
                if (process.env.MARGY_AUTO_RESPONSE_ENABLED === 'true') {
                    try {
                        const { MargyService } = await import('@/modules/agents/services/margy.service');
                        const response = await MargyService.autoRespond(prospect.id, messageText, tenantId);

                        // Enviar respuesta por WhatsApp
                        if (response) {
                            await this.sendAndLog({
                                to: prospect.phone,
                                message: response,
                                prospectId: prospect.id,
                                tenantId,
                            });
                        }
                    } catch (error) {
                        console.error('Error in Margy auto-response:', error);
                        // No lanzar error para no bloquear el webhook
                    }
                }
            }

            // Procesar actualizaciones de estado
            const statuses = value.statuses || [];
            for (const status of statuses) {
                const waMessageId = status.id;
                const statusValue = status.status; // sent, delivered, read

                await prisma.whatsAppMessage.updateMany({
                    where: { waMessageId },
                    data: {
                        status: statusValue.toUpperCase() as any,
                        deliveredAt: statusValue === 'delivered' ? new Date() : undefined,
                        readAt: statusValue === 'read' ? new Date() : undefined,
                    },
                });
            }
        } catch (error) {
            console.error("Error processing WhatsApp webhook:", error);
            throw error;
        }
    }

    /**
     * Verificar firma del webhook
     */
    static verifyWebhookSignature(body: string, signature: string): boolean {
        if (!this.APP_SECRET) {
            console.warn("WHATSAPP_APP_SECRET not configured, skipping signature verification");
            return true; // En desarrollo, permitir sin verificación
        }

        try {
            const hash = crypto
                .createHmac('sha256', this.APP_SECRET)
                .update(body)
                .digest('hex');

            const expectedSignature = `sha256=${hash}`;
            return crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expectedSignature)
            );
        } catch (error) {
            console.error("Error verifying webhook signature:", error);
            return false;
        }
    }

    /**
     * Obtener historial de conversación por teléfono
     */
    static async getConversationHistory(phone: string, tenantId: string): Promise<WhatsAppMessage[]> {
        return prisma.whatsAppMessage.findMany({
            where: {
                phone,
                tenantId,
            },
            orderBy: { sentAt: 'asc' },
        });
    }

    /**
     * Enviar mensaje y registrar en BD
     */
    static async sendAndLog(payload: SendAndLogPayload): Promise<WhatsAppMessage> {
        const { to, message, prospectId, templateName, tenantId } = payload;

        // Enviar mensaje
        const sent = await this.sendMessage({ to, message });

        // Registrar en BD
        const whatsappMessage = await prisma.whatsAppMessage.create({
            data: {
                direction: 'OUTBOUND',
                phone: to,
                content: message,
                templateName,
                status: sent ? 'SENT' : 'FAILED',
                prospectId,
                tenantId,
            },
        });

        // Si hay prospectId, crear interacción
        if (prospectId) {
            await prisma.prospectInteraction.create({
                data: {
                    type: 'WHATSAPP_ENVIADO',
                    content: message,
                    prospectId,
                    tenantId,
                },
            });

            // Actualizar lastContactAt
            await prisma.prospect.update({
                where: { id: prospectId },
                data: { lastContactAt: new Date() },
            });
        }

        return whatsappMessage;
    }

    /**
     * Obtener asesor por defecto para asignar leads
     */
    private static async getDefaultAdvisor(tenantId: string) {
        return prisma.user.findFirst({
            where: {
                tenantId,
                role: { name: 'ASESOR' },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
}

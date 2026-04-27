/**
 * KaledLead Service
 * Gestión de leads directos de KaledSoft Tech
 */

import { prisma } from '@/lib/prisma';
import type { LeadRegistration } from '../types';
import { KaledInteractionService } from '@/modules/kaled-crm/services/kaled-interaction.service';
import type { KaledLead } from '@prisma/client';
import { triggerSequenceByStage } from '@/modules/kaled-crm/services/kaled-automation.service';

const KALED_FALLBACK_SLUG = 'kaledsoft';

/**
 * Resuelve tenantId para captura de leads. Si el caller no pasa uno válido,
 * cae a 'kaledsoft' (decisión Luis 2026-04-27 — Opción A: nunca perder leads).
 * Loggea cuando se aplica el fallback para detectar mal uso aguas arriba.
 */
async function resolveCaptureTenantId(input?: string): Promise<string> {
    if (input) return input;

    const fallback = await prisma.tenant.findUnique({
        where: { slug: KALED_FALLBACK_SLUG },
        select: { id: true },
    });

    if (!fallback) {
        throw new Error(
            `No se pudo resolver tenant fallback '${KALED_FALLBACK_SLUG}' para captura de lead.`
        );
    }

    console.warn(
        `[KaledLeadService] tenantId no provisto en captureLead — aplicando fallback a '${KALED_FALLBACK_SLUG}' (${fallback.id})`
    );

    return fallback.id;
}

export class KaledLeadService {
    /**
     * Capturar lead directo de KaledSoft.
     * tenantId puede ser undefined si el caller no logró resolverlo; en ese caso
     * se usa fallback duro a 'kaledsoft' para no perder el lead.
     */
    static async captureLead(data: LeadRegistration, tenantId?: string): Promise<{ leadId: string }> {
        const resolvedTenantId = await resolveCaptureTenantId(tenantId);

        // Buscar lead existente por email + tenantId (composite unique)
        let lead: KaledLead | null = await prisma.kaledLead.findUnique({
            where: { email_tenantId: { email: data.email, tenantId: resolvedTenantId } },
        });

        const filteringData = {
            city: data.city,
            studyStatus: data.studyStatus,
            programmingLevel: data.programmingLevel,
            saasInterest: data.saasInterest,
            investmentReady: data.investmentReady,
            masterclassSlug: data.masterclassSlug,
            attribution: {
                fbclid: data.fbclid || null,
                gclid: data.gclid || null,
                ttclid: data.ttclid || null,
            },
        };

        const observations = [
            data.city ? `Ciudad: ${data.city}` : null,
            data.studyStatus ? `Estudio: ${data.studyStatus}` : null,
            data.programmingLevel ? `Nivel: ${data.programmingLevel}` : null,
            data.saasInterest ? `Interés SaaS: ${data.saasInterest}` : null,
            data.investmentReady ? `Inversión: ${data.investmentReady}` : null,
            data.fbclid ? `fbclid: ${data.fbclid}` : null,
            data.gclid ? `gclid: ${data.gclid}` : null,
            data.ttclid ? `ttclid: ${data.ttclid}` : null,
        ].filter(Boolean).join(' | ');

        if (lead) {
            // Actualizar lead existente
            lead = await prisma.kaledLead.update({
                where: { id: lead.id },
                data: {
                    name: data.name || lead.name,
                    phone: data.phone || lead.phone,
                    city: data.city || lead.city,
                    utmSource: data.utmSource || lead.utmSource,
                    utmMedium: data.utmMedium || lead.utmMedium,
                    utmCampaign: data.utmCampaign || lead.utmCampaign,
                    utmContent: data.utmContent || lead.utmContent,
                    observations: observations ? `${lead.observations || ''}\n[RE-REGISTRO]: ${observations}`.trim() : lead.observations,
                    filteringData: filteringData as object,
                },
            });
        } else {
            // Crear nuevo lead
            lead = await prisma.kaledLead.create({
                data: {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    city: data.city,
                    status: 'NUEVO',
                    source: data.masterclassSlug ? `MASTERCLASS: ${data.masterclassSlug}` : 'LANDING',
                    observations: observations ? `[MASTERCLASS]: ${observations}` : null,
                    filteringData: filteringData as object,
                    utmSource: data.utmSource,
                    utmMedium: data.utmMedium,
                    utmCampaign: data.utmCampaign,
                    utmContent: data.utmContent,
                    tenantId: resolvedTenantId,
                },
            });

            // Dispara secuencias para el estado inicial del funnel.
            try {
                await triggerSequenceByStage(lead.id, lead.status, resolvedTenantId);
            } catch (sequenceError) {
                console.error('Error triggering initial lead sequence:', sequenceError);
            }
        }

        return { leadId: lead.id };
    }

    /**
     * Obtener todos los leads para el dashboard
     */
    static async getAllLeads(tenantId: string) {
        return prisma.kaledLead.findMany({
            where: { deletedAt: null, tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Actualizar estado del lead
     */
    static async updateLeadStatus(id: string, status: string) {
        return prisma.kaledLead.update({
            where: { id },
            data: { status },
        });
    }

    /**
     * Obtener un lead por ID con relaciones
     */
    static async getLeadById(id: string) {
        return prisma.kaledLead.findUnique({
            where: { id },
            include: {
                campaign: true,
                interactions: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                emailLogs: {
                    include: {
                        template: true,
                    },
                    orderBy: {
                        sentAt: 'desc',
                    },
                    take: 10,
                },
            },
        });
    }

    /**
     * Actualizar información completa del lead
     */
    static async updateLead(
        id: string,
        data: Partial<KaledLead>,
        userId?: string
    ) {
        const currentLead = await prisma.kaledLead.findUnique({
            where: { id },
        });

        if (!currentLead) {
            throw new Error('Lead no encontrado');
        }

        // Si el status cambió, registrar la interacción
        const statusChanged = data.status && data.status !== currentLead.status;

        // Convertir null a undefined para campos opcionales
        const updateData: Record<string, unknown> = {};
        Object.entries(data).forEach(([key, value]) => {
            updateData[key] = value === null ? undefined : value;
        });

        const updated = await prisma.kaledLead.update({
            where: { id },
            data: {
                ...updateData,
                updatedAt: new Date(),
            },
        });

        // Registrar cambio de estado automáticamente
        if (statusChanged && currentLead.status && data.status) {
            await KaledInteractionService.logStatusChange(
                id,
                currentLead.status,
                data.status,
                userId
            );

            try {
                await triggerSequenceByStage(id, data.status, currentLead.tenantId);
            } catch (sequenceError) {
                console.error('Error triggering sequence on status change:', sequenceError);
            }
        }

        return updated;
    }

    /**
     * Eliminar lead (soft delete)
     */
    static async deleteLead(id: string, userId: string) {
        const lead = await prisma.kaledLead.findUnique({
            where: { id },
        });

        if (!lead) {
            throw new Error('Lead no encontrado');
        }

        if (lead.deletedAt) {
            throw new Error('El lead ya está eliminado');
        }

        return prisma.kaledLead.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy: userId,
            },
        });
    }

    /**
     * Restaurar lead eliminado
     */
    static async restoreLead(id: string) {
        const lead = await prisma.kaledLead.findUnique({
            where: { id },
        });

        if (!lead) {
            throw new Error('Lead no encontrado');
        }

        if (!lead.deletedAt) {
            throw new Error('El lead no está eliminado');
        }

        return prisma.kaledLead.update({
            where: { id },
            data: {
                deletedAt: null,
                deletedBy: null,
            },
        });
    }

    /**
     * Obtener historial de interacciones
     */
    static async getLeadHistory(id: string) {
        return KaledInteractionService.getTimeline(id);
    }

    /**
     * Obtener métricas del lead
     */
    static async getLeadMetrics(id: string) {
        const [lead, interactions, emailLogs] = await Promise.all([
            prisma.kaledLead.findUnique({ where: { id } }),
            prisma.kaledLeadInteraction.count({ where: { kaledLeadId: id } }),
            prisma.kaledEmailLog.count({
                where: { kaledLeadId: id, status: 'SENT' },
            }),
        ]);

        if (!lead) {
            throw new Error('Lead no encontrado');
        }

        // Calcular tiempo desde creación
        const daysActive = Math.floor(
            (Date.now() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Obtener estadísticas de interacciones por tipo
        const interactionStats = await KaledInteractionService.getStats(id);

        return {
            id: lead.id,
            name: lead.name,
            email: lead.email,
            status: lead.status,
            daysActive,
            totalInteractions: interactions,
            emailsSent: emailLogs,
            interactionStats,
            createdAt: lead.createdAt,
            updatedAt: lead.updatedAt,
        };
    }

    /**
     * Buscar leads con filtros
     */
    static async searchLeads(tenantId: string, params: {
        search?: string;
        status?: string;
        campaignId?: string;
        includeDeleted?: boolean;
        limit?: number;
        offset?: number;
    }) {
        const {
            search,
            status,
            campaignId,
            includeDeleted = false,
            limit = 50,
            offset = 0,
        } = params;

        const where: Record<string, unknown> = { tenantId };

        if (!includeDeleted) {
            where.deletedAt = null;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (status) {
            where.status = status;
        }

        if (campaignId) {
            where.campaignId = campaignId;
        }

        const [leads, total] = await Promise.all([
            prisma.kaledLead.findMany({
                where,
                include: {
                    campaign: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    _count: {
                        select: {
                            interactions: true,
                            emailLogs: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.kaledLead.count({ where }),
        ]);

        return {
            leads,
            total,
            limit,
            offset,
            hasMore: offset + limit < total,
        };
    }
}

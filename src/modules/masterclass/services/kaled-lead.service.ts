/**
 * KaledLead Service
 * Gestión de leads directos de KaledSoft Tech
 */

import { prisma } from '@/lib/prisma';
import type { LeadRegistration } from '../types';
import { KaledInteractionService } from '@/modules/kaled-crm/services/kaled-interaction.service';
import type { KaledLead } from '@prisma/client';

export class KaledLeadService {
    /**
     * Capturar lead directo de KaledSoft
     */
    static async captureLead(data: LeadRegistration): Promise<{ leadId: string }> {
        // Verificar si ya existe el lead por email
        let lead = await prisma.kaledLead.findUnique({
            where: { email: data.email },
        });

        const filteringData = {
            studyStatus: data.studyStatus,
            programmingLevel: data.programmingLevel,
            saasInterest: data.saasInterest,
            investmentReady: data.investmentReady,
            masterclassSlug: data.masterclassSlug,
        };

        const observations = [
            data.studyStatus ? `Estudio: ${data.studyStatus}` : null,
            data.programmingLevel ? `Nivel: ${data.programmingLevel}` : null,
            data.saasInterest ? `Interés SaaS: ${data.saasInterest}` : null,
            data.investmentReady ? `Inversión: ${data.investmentReady}` : null,
        ].filter(Boolean).join(' | ');

        if (lead) {
            // Actualizar lead existente
            lead = await prisma.kaledLead.update({
                where: { id: lead.id },
                data: {
                    name: data.name || lead.name,
                    phone: data.phone || lead.phone,
                    utmSource: data.utmSource || lead.utmSource,
                    utmMedium: data.utmMedium || lead.utmMedium,
                    utmCampaign: data.utmCampaign || lead.utmCampaign,
                    utmContent: data.utmContent || lead.utmContent,
                    observations: observations ? `${lead.observations || ''}\n[RE-REGISTRO]: ${observations}`.trim() : lead.observations,
                    filteringData: filteringData as any,
                },
            });
        } else {
            // Crear nuevo lead
            lead = await prisma.kaledLead.create({
                data: {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    status: 'NUEVO',
                    source: data.masterclassSlug ? `MASTERCLASS: ${data.masterclassSlug}` : 'LANDING',
                    observations: observations ? `[MASTERCLASS]: ${observations}` : null,
                    filteringData: filteringData as any,
                    utmSource: data.utmSource,
                    utmMedium: data.utmMedium,
                    utmCampaign: data.utmCampaign,
                    utmContent: data.utmContent,
                },
            });
        }

        return { leadId: lead.id };
    }

    /**
     * Obtener todos los leads para el dashboard
     */
    static async getAllLeads() {
        return prisma.kaledLead.findMany({
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
        const updateData: any = {};
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
    static async searchLeads(params: {
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

        const where: any = {};

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

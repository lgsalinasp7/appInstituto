// ============================================
// Funnel Service
// Gestión del pipeline de ventas
// ============================================

import { prisma } from '@/lib/prisma';
import type { FunnelStage, Prospect } from '@prisma/client';
import type {
  PipelineView,
  PipelineStage,
  PipelineLead,
  TimelineItem,
} from '../types';
import { FUNNEL_STAGE_LABELS } from '../types';
import type { PipelineFiltersInput } from '../schemas';
import { LeadScoringService } from './lead-scoring.service';
import { AutomationService } from './automation.service';

export class FunnelService {
  /**
   * Obtener pipeline completo con todas las etapas y leads
   */
  static async getPipeline(
    tenantId: string,
    filters?: PipelineFiltersInput
  ): Promise<PipelineView> {
    const whereClause: any = { tenantId };

    if (filters?.stage) {
      whereClause.funnelStage = filters.stage;
    }

    if (filters?.temperature) {
      whereClause.temperature = filters.temperature;
    }

    if (filters?.source) {
      whereClause.source = filters.source;
    }

    if (filters?.advisorId) {
      whereClause.advisorId = filters.advisorId;
    }

    if (filters?.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.dateFrom || filters?.dateTo) {
      whereClause.createdAt = {};
      if (filters.dateFrom) {
        whereClause.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        whereClause.createdAt.lte = new Date(filters.dateTo);
      }
    }

    const prospects = await prisma.prospect.findMany({
      where: whereClause,
      include: {
        program: {
          select: { name: true },
        },
        advisor: {
          select: { name: true },
        },
      },
      orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
    });

    // Agrupar por etapa
    const allStages: FunnelStage[] = [
      'NUEVO',
      'CONTACTADO',
      'INTERESADO',
      'MASTERCLASS_REGISTRADO',
      'MASTERCLASS_ASISTIO',
      'APLICACION',
      'LLAMADA_AGENDADA',
      'LLAMADA_REALIZADA',
      'NEGOCIACION',
      'MATRICULADO',
      'PERDIDO',
    ];

    const stages: PipelineStage[] = allStages.map((stage) => {
      const stageProspects = prospects.filter(
        (p) => p.funnelStage === stage
      );

      const leads: PipelineLead[] = stageProspects.map((p) => ({
        id: p.id,
        name: p.name,
        phone: p.phone,
        email: p.email,
        funnelStage: p.funnelStage,
        temperature: p.temperature,
        score: p.score,
        source: p.source,
        programName: p.program?.name || null,
        advisorName: p.advisor?.name || null,
        lastContactAt: p.lastContactAt,
        nextFollowUpAt: p.nextFollowUpAt,
        createdAt: p.createdAt,
      }));

      return {
        stage,
        label: FUNNEL_STAGE_LABELS[stage],
        count: stageProspects.length,
        leads,
      };
    });

    // Calcular valor potencial (asumiendo precio promedio de programa)
    const avgProgramValue = 1500000; // COP (ajustar según negocio)
    const totalValue = prospects.length * avgProgramValue;

    return {
      stages,
      totalLeads: prospects.length,
      totalValue,
    };
  }

  /**
   * Mover lead a nueva etapa del funnel
   */
  static async moveLeadToStage(
    prospectId: string,
    newStage: FunnelStage,
    tenantId: string,
    reason?: string
  ): Promise<Prospect> {
    const prospect = await prisma.prospect.findUnique({
      where: { id: prospectId, tenantId },
    });

    if (!prospect) {
      throw new Error('Prospect not found');
    }

    const oldStage = prospect.funnelStage;

    // Actualizar etapa y campos relacionados
    const updateData: any = {
      funnelStage: newStage,
      updatedAt: new Date(),
    };

    // Si es PERDIDO, guardar razón
    if (newStage === 'PERDIDO' && reason) {
      updateData.lostReason = reason;
    }

    // Si es MASTERCLASS_REGISTRADO, guardar fecha
    if (newStage === 'MASTERCLASS_REGISTRADO' && !prospect.masterclassRegisteredAt) {
      updateData.masterclassRegisteredAt = new Date();
    }

    // Si es MASTERCLASS_ASISTIO, guardar fecha
    if (newStage === 'MASTERCLASS_ASISTIO' && !prospect.masterclassAttendedAt) {
      updateData.masterclassAttendedAt = new Date();
    }

    // Actualizar prospect
    const updatedProspect = await prisma.prospect.update({
      where: { id: prospectId },
      data: updateData,
    });

    // Crear interacción de cambio de etapa
    await prisma.prospectInteraction.create({
      data: {
        type: 'CAMBIO_ETAPA',
        content: `Movido de ${FUNNEL_STAGE_LABELS[oldStage]} a ${FUNNEL_STAGE_LABELS[newStage]}${reason ? `: ${reason}` : ''}`,
        metadata: {
          oldStage,
          newStage,
          reason,
        },
        prospectId,
        tenantId,
      },
    });

    // Recalcular score
    await LeadScoringService.recalculate(prospectId, tenantId);

    // Disparar automations (emails, WhatsApp, etc.)
    await AutomationService.onStageChange(prospectId, oldStage, newStage, tenantId);

    return updatedProspect;
  }

  /**
   * Obtener timeline de actividad de un lead
   */
  static async getLeadTimeline(
    prospectId: string,
    tenantId: string
  ): Promise<TimelineItem[]> {
    const interactions = await prisma.prospectInteraction.findMany({
      where: { prospectId, tenantId },
      include: {
        advisor: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return interactions.map((i) => ({
      id: i.id,
      type: i.type,
      content: i.content,
      metadata: i.metadata as Record<string, unknown> | null,
      advisorName: i.advisor?.name || null,
      agentType: i.agentType,
      createdAt: i.createdAt,
    }));
  }

  /**
   * Asignar lead a asesor
   */
  static async assignToAdvisor(
    prospectId: string,
    advisorId: string,
    tenantId: string
  ): Promise<Prospect> {
    const prospect = await prisma.prospect.findUnique({
      where: { id: prospectId, tenantId },
    });

    if (!prospect) {
      throw new Error('Prospect not found');
    }

    const advisor = await prisma.user.findUnique({
      where: { id: advisorId },
      select: { name: true },
    });

    const updatedProspect = await prisma.prospect.update({
      where: { id: prospectId },
      data: { advisorId },
    });

    // Crear interacción
    await prisma.prospectInteraction.create({
      data: {
        type: 'SISTEMA',
        content: `Asignado a ${advisor?.name || 'asesor'}`,
        metadata: { advisorId },
        prospectId,
        tenantId,
      },
    });

    return updatedProspect;
  }

  /**
   * Obtener siguiente asesor disponible (round-robin)
   */
  static async getNextAdvisor(tenantId: string): Promise<string> {
    // Obtener todos los asesores del tenant con rol de advisor
    const advisors = await prisma.user.findMany({
      where: {
        tenantId,
        isActive: true,
        role: {
          name: { in: ['advisor', 'asesor'] },
        },
      },
      select: {
        id: true,
        prospects: {
          select: { id: true },
        },
      },
    });

    if (advisors.length === 0) {
      throw new Error('No advisors available');
    }

    // Encontrar el asesor con menos leads asignados
    const advisorWithLeastLeads = advisors.reduce((prev, current) => {
      return prev.prospects.length < current.prospects.length ? prev : current;
    });

    return advisorWithLeastLeads.id;
  }

  /**
   * Bulk update de etapa
   */
  static async bulkUpdateStage(
    prospectIds: string[],
    newStage: FunnelStage,
    tenantId: string
  ): Promise<number> {
    // Validar que todos los prospects pertenecen al tenant
    const count = await prisma.prospect.count({
      where: {
        id: { in: prospectIds },
        tenantId,
      },
    });

    if (count !== prospectIds.length) {
      throw new Error('Some prospects do not belong to this tenant');
    }

    // Actualizar en batch
    const result = await prisma.prospect.updateMany({
      where: {
        id: { in: prospectIds },
        tenantId,
      },
      data: {
        funnelStage: newStage,
        updatedAt: new Date(),
      },
    });

    // Crear interacciones para cada uno (en paralelo)
    await Promise.all(
      prospectIds.map((prospectId) =>
        prisma.prospectInteraction.create({
          data: {
            type: 'CAMBIO_ETAPA',
            content: `Actualización masiva a ${FUNNEL_STAGE_LABELS[newStage]}`,
            metadata: { newStage, bulkUpdate: true },
            prospectId,
            tenantId,
          },
        })
      )
    );

    return result.count;
  }
}

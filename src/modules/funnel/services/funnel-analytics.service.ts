// ============================================
// Funnel Analytics Service
// Métricas y análisis del embudo de ventas
// ============================================

import { prisma } from '@/lib/prisma';
import type { FunnelStage } from '@prisma/client';
import { FUNNEL_STAGE_LABELS } from '../types';

export class FunnelAnalyticsService {
  /**
   * Obtener métricas generales del embudo
   */
  static async getFunnelMetrics(
    tenantId: string,
    period?: string
  ): Promise<any> {
    const startDate = period
      ? new Date(period)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 días por defecto

    const prospects = await prisma.prospect.findMany({
      where: {
        tenantId,
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        funnelStage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalLeads = prospects.length;
    const matriculados = prospects.filter(
      (p) => p.funnelStage === 'MATRICULADO'
    ).length;
    const perdidos = prospects.filter((p) => p.funnelStage === 'PERDIDO')
      .length;

    const overallConversionRate =
      totalLeads > 0 ? (matriculados / totalLeads) * 100 : 0;

    // Calcular días promedio para cerrar
    const matriculadosWithDates = prospects.filter(
      (p) => p.funnelStage === 'MATRICULADO'
    );
    const averageDaysToClose =
      matriculadosWithDates.length > 0
        ? matriculadosWithDates.reduce((acc, p) => {
            const days =
              (p.updatedAt.getTime() - p.createdAt.getTime()) /
              (1000 * 60 * 60 * 24);
            return acc + days;
          }, 0) / matriculadosWithDates.length
        : 0;

    // Calcular conversiones entre etapas
    const stageConversions = await this.getStageConversions(
      tenantId,
      startDate
    );

    return {
      period: period || 'last-30-days',
      totalLeads,
      matriculados,
      perdidos,
      enProceso: totalLeads - matriculados - perdidos,
      overallConversionRate: Math.round(overallConversionRate * 100) / 100,
      averageDaysToClose: Math.round(averageDaysToClose * 10) / 10,
      stageConversions,
      costPerLead: 0, // TODO: Calcular con datos de Meta Ads
      costPerSale: 0, // TODO: Calcular con datos de Meta Ads
    };
  }

  /**
   * Datos para gráfico de embudo (leads por etapa)
   */
  static async getConversionFunnel(
    tenantId: string
  ): Promise<{ stage: string; count: number }[]> {
    const prospects = await prisma.prospect.findMany({
      where: { tenantId },
      select: { funnelStage: true },
    });

    const stages: FunnelStage[] = [
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
    ];

    return stages.map((stage) => ({
      stage: FUNNEL_STAGE_LABELS[stage],
      count: prospects.filter((p) => p.funnelStage === stage).length,
    }));
  }

  /**
   * Rendimiento por asesor en el embudo
   */
  static async getAdvisorFunnelPerformance(tenantId: string): Promise<any[]> {
    const advisors = await prisma.user.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        prospects: {
          select: {
            funnelStage: true,
            score: true,
          },
        },
      },
    });

    return advisors.map((advisor) => {
      const totalLeads = advisor.prospects.length;
      const matriculados = advisor.prospects.filter(
        (p) => p.funnelStage === 'MATRICULADO'
      ).length;
      const avgScore =
        totalLeads > 0
          ? advisor.prospects.reduce((acc, p) => acc + p.score, 0) /
            totalLeads
          : 0;

      return {
        advisorId: advisor.id,
        advisorName: advisor.name || 'Sin nombre',
        totalLeads,
        matriculados,
        conversionRate:
          totalLeads > 0 ? (matriculados / totalLeads) * 100 : 0,
        averageScore: Math.round(avgScore * 10) / 10,
      };
    });
  }

  /**
   * De dónde vienen los mejores leads (por fuente)
   */
  static async getLeadSourceBreakdown(tenantId: string): Promise<any[]> {
    const prospects = await prisma.prospect.findMany({
      where: { tenantId },
      select: {
        source: true,
        funnelStage: true,
        score: true,
      },
    });

    const sources = [
      'LANDING_PAGE',
      'WHATSAPP',
      'REFERIDO',
      'REDES_SOCIALES',
      'LLAMADA',
      'EMAIL',
      'OTRO',
    ];

    return sources.map((source) => {
      const sourceProspects = prospects.filter((p) => p.source === source);
      const totalLeads = sourceProspects.length;
      const matriculados = sourceProspects.filter(
        (p) => p.funnelStage === 'MATRICULADO'
      ).length;
      const avgScore =
        totalLeads > 0
          ? sourceProspects.reduce((acc, p) => acc + p.score, 0) / totalLeads
          : 0;

      return {
        source,
        totalLeads,
        matriculados,
        conversionRate:
          totalLeads > 0 ? (matriculados / totalLeads) * 100 : 0,
        averageScore: Math.round(avgScore * 10) / 10,
      };
    });
  }

  /**
   * Tiempo promedio en cada etapa (identificar cuellos de botella)
   */
  static async getAverageTimeInStage(tenantId: string): Promise<any[]> {
    // TODO: Implementar con tracking de cambios de etapa en ProspectInteraction
    // Por ahora retornar datos mock
    return [
      { stage: 'NUEVO', averageDays: 1 },
      { stage: 'CONTACTADO', averageDays: 2 },
      { stage: 'INTERESADO', averageDays: 3 },
      { stage: 'MASTERCLASS_REGISTRADO', averageDays: 5 },
      { stage: 'MASTERCLASS_ASISTIO', averageDays: 2 },
      { stage: 'APLICACION', averageDays: 3 },
      { stage: 'LLAMADA_AGENDADA', averageDays: 1 },
      { stage: 'LLAMADA_REALIZADA', averageDays: 2 },
      { stage: 'NEGOCIACION', averageDays: 4 },
      { stage: 'MATRICULADO', averageDays: 0 },
    ];
  }

  /**
   * Calcular conversiones entre etapas consecutivas
   */
  private static async getStageConversions(
    tenantId: string,
    startDate: Date
  ): Promise<any[]> {
    const interactions = await prisma.prospectInteraction.findMany({
      where: {
        tenantId,
        type: 'CAMBIO_ETAPA',
        createdAt: { gte: startDate },
      },
      select: {
        metadata: true,
        createdAt: true,
      },
    });

    // Agrupar por transición (oldStage -> newStage)
    const transitions: Map<string, number> = new Map();

    interactions.forEach((i) => {
      const meta = i.metadata as any;
      if (meta?.oldStage && meta?.newStage) {
        const key = `${meta.oldStage}->${meta.newStage}`;
        transitions.set(key, (transitions.get(key) || 0) + 1);
      }
    });

    // Convertir a array
    return Array.from(transitions.entries()).map(([key, count]) => {
      const [fromStage, toStage] = key.split('->');
      return {
        fromStage,
        toStage,
        count,
        rate: 0, // TODO: Calcular rate real
        averageDays: 0, // TODO: Calcular
      };
    });
  }
}

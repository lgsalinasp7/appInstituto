import { prisma } from '@/lib/prisma';
import type {
  OverviewMetrics,
  ConversionMetrics,
  ActivityMetrics,
  FunnelValidationMetrics,
} from '../types';

export class KaledAnalyticsService {
  /**
   * Obtener métricas generales del CRM
   */
  static async getOverviewMetrics(): Promise<OverviewMetrics> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalLeads,
      newLeadsThisMonth,
      activeLeads,
      convertedLeads,
      lostLeads,
      emailsSentThisMonth,
    ] = await Promise.all([
      prisma.kaledLead.count({ where: { deletedAt: null } }),
      prisma.kaledLead.count({
        where: {
          deletedAt: null,
          createdAt: { gte: firstDayOfMonth },
        },
      }),
      prisma.kaledLead.count({
        where: {
          deletedAt: null,
          status: { in: ['NUEVO', 'CONTACTADO', 'DEMO'] },
        },
      }),
      prisma.kaledLead.count({
        where: { deletedAt: null, status: 'CONVERTIDO' },
      }),
      prisma.kaledLead.count({
        where: { deletedAt: null, status: 'PERDIDO' },
      }),
      prisma.kaledEmailLog.count({
        where: {
          status: 'SENT',
          sentAt: { gte: firstDayOfMonth },
        },
      }),
    ]);

    // Calcular tasa de conversión
    const conversionRate =
      totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Calcular tiempo promedio de conversión (en días)
    const convertedLeadsData = await prisma.kaledLead.findMany({
      where: { status: 'CONVERTIDO', deletedAt: null },
      select: { createdAt: true, updatedAt: true },
    });

    let averageTimeToConversion = 0;
    if (convertedLeadsData.length > 0) {
      const times = convertedLeadsData.map(
        (l) =>
          (l.updatedAt.getTime() - l.createdAt.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      averageTimeToConversion =
        times.reduce((acc, time) => acc + time, 0) / times.length;
    }

    // Calcular velocidad de respuesta promedio (en horas)
    const interactions = await prisma.kaledLeadInteraction.findMany({
      where: {
        type: { in: ['LLAMADA', 'CORREO', 'WHATSAPP'] },
        createdAt: { gte: firstDayOfMonth },
      },
      include: {
        kaledLead: {
          select: { createdAt: true },
        },
      },
    });

    let averageResponseTime = 0;
    if (interactions.length > 0) {
      const responseTimes = interactions.map(
        (i) =>
          (i.createdAt.getTime() - i.kaledLead.createdAt.getTime()) /
          (1000 * 60 * 60)
      );
      averageResponseTime =
        responseTimes.reduce((acc, time) => acc + time, 0) /
        responseTimes.length;
    }

    return {
      totalLeads,
      newLeadsThisMonth,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageTimeToConversion: Math.round(averageTimeToConversion * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      activeLeads,
      convertedLeads,
      lostLeads,
      emailsSentThisMonth,
      emailOpenRate: 0, // TODO: Implementar tracking de aperturas
    };
  }

  /**
   * Obtener métricas de conversión detalladas
   */
  static async getConversionMetrics(): Promise<ConversionMetrics> {
    const leads = await prisma.kaledLead.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        campaignId: true,
      },
    });

    const totalLeads = leads.length;
    const converted = leads.filter((l) => l.status === 'CONVERTIDO');
    const conversionRate =
      totalLeads > 0 ? (converted.length / totalLeads) * 100 : 0;

    // Calcular tiempos de conversión
    let averageTime = 0;
    let medianTime = 0;
    let minTime = 0;
    let maxTime = 0;

    if (converted.length > 0) {
      const times = converted
        .map(
          (l) =>
            (l.updatedAt.getTime() - l.createdAt.getTime()) /
            (1000 * 60 * 60 * 24)
        )
        .sort((a, b) => a - b);

      averageTime = times.reduce((acc, t) => acc + t, 0) / times.length;
      medianTime = times[Math.floor(times.length / 2)];
      minTime = times[0];
      maxTime = times[times.length - 1];
    }

    // Conversión por etapa
    const byStatus = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Conversión por campaña
    const campaigns = await prisma.kaledCampaign.findMany({
      include: {
        leads: {
          where: { deletedAt: null },
        },
      },
    });

    const conversionByCampaign = campaigns
      .map((campaign) => {
        const totalCampaignLeads = campaign.leads.length;
        const convertedCampaignLeads = campaign.leads.filter(
          (l) => l.status === 'CONVERTIDO'
        ).length;
        return {
          campaignId: campaign.id,
          campaignName: campaign.name,
          totalLeads: totalCampaignLeads,
          converted: convertedCampaignLeads,
          rate:
            totalCampaignLeads > 0
              ? (convertedCampaignLeads / totalCampaignLeads) * 100
              : 0,
        };
      })
      .filter((c) => c.totalLeads > 0);

    return {
      totalLeads,
      converted: converted.length,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageTimeToConversion: Math.round(averageTime * 100) / 100,
      medianTimeToConversion: Math.round(medianTime * 100) / 100,
      minTimeToConversion: Math.round(minTime * 100) / 100,
      maxTimeToConversion: Math.round(maxTime * 100) / 100,
      conversionByStage: byStatus,
      conversionByCampaign,
    };
  }

  /**
   * Obtener métricas de actividad
   */
  static async getActivityMetrics(userId?: string): Promise<ActivityMetrics> {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const interactions = await prisma.kaledLeadInteraction.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true },
        },
        kaledLead: true,
      },
    });

    const totalInteractions = interactions.length;

    // Interacciones por tipo
    const interactionsByType = interactions.reduce((acc, int) => {
      acc[int.type] = (acc[int.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Leads contactados (únicos)
    const leadsContacted = new Set(
      interactions
        .filter((i) => ['LLAMADA', 'CORREO', 'WHATSAPP', 'REUNION'].includes(i.type))
        .map((i) => i.kaledLeadId)
    ).size;

    // Leads convertidos (que tienen interacciones de este usuario)
    const leadIds = [...new Set(interactions.map((i) => i.kaledLeadId))];
    const leadsConverted = await prisma.kaledLead.count({
      where: {
        id: { in: leadIds },
        status: 'CONVERTIDO',
      },
    });

    // Tiempo promedio de respuesta
    let averageResponseTime = 0;
    const responseInteractions = interactions.filter((i) =>
      ['LLAMADA', 'CORREO', 'WHATSAPP'].includes(i.type)
    );

    if (responseInteractions.length > 0) {
      const times = responseInteractions.map(
        (i) =>
          (i.createdAt.getTime() - i.kaledLead.createdAt.getTime()) /
          (1000 * 60 * 60)
      );
      averageResponseTime =
        times.reduce((acc, t) => acc + t, 0) / times.length;
    }

    const lastActivity =
      interactions.length > 0
        ? interactions.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
          )[0].createdAt
        : undefined;

    return {
      userId,
      userName: interactions[0]?.user?.name ?? undefined,
      totalInteractions,
      interactionsByType: interactionsByType as any,
      leadsContacted,
      leadsConverted,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      lastActivity,
    };
  }

  /**
   * Obtener leads por estado (para gráficos)
   */
  static async getLeadsByStatus() {
    const leads = await prisma.kaledLead.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: true,
    });

    return leads.map((item) => ({
      status: item.status,
      count: item._count,
    }));
  }

  /**
   * Obtener leads por fuente (para gráficos)
   */
  static async getLeadsBySource() {
    const leads = await prisma.kaledLead.groupBy({
      by: ['source'],
      where: { deletedAt: null },
      _count: true,
    });

    return leads.map((item) => ({
      source: item.source,
      count: item._count,
    }));
  }

  /**
   * Obtener tendencia de leads (últimos 30 días)
   */
  static async getLeadsTrend() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const leads = await prisma.kaledLead.findMany({
      where: {
        deletedAt: null,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true },
    });

    // Agrupar por día
    const trendByDay: Record<string, number> = {};

    leads.forEach((lead) => {
      const day = lead.createdAt.toISOString().split('T')[0];
      trendByDay[day] = (trendByDay[day] || 0) + 1;
    });

    return Object.entries(trendByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  static async getFunnelValidationMetrics(): Promise<FunnelValidationMetrics> {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const leadsThisWeekData = await prisma.kaledLead.findMany({
      where: {
        deletedAt: null,
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    const leadIds = leadsThisWeekData.map((lead) => lead.id);

    const interactions = leadIds.length
      ? await prisma.kaledLeadInteraction.findMany({
          where: {
            kaledLeadId: { in: leadIds },
            type: { in: ['LLAMADA', 'WHATSAPP', 'CORREO', 'REUNION'] },
          },
          select: {
            kaledLeadId: true,
            type: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        })
      : [];

    const leadsById = new Map(leadsThisWeekData.map((lead) => [lead.id, lead]));
    const firstTouchByLead = new Map<string, Date>();
    const whatsappTouchesByLead = new Set<string>();

    interactions.forEach((interaction) => {
      if (!firstTouchByLead.has(interaction.kaledLeadId)) {
        firstTouchByLead.set(interaction.kaledLeadId, interaction.createdAt);
      }
      if (interaction.type === 'WHATSAPP') {
        whatsappTouchesByLead.add(interaction.kaledLeadId);
      }
    });

    const contactedIn24h = Array.from(firstTouchByLead.entries()).filter(
      ([leadId, firstTouchAt]) => {
        const lead = leadsById.get(leadId);
        if (!lead) return false;
        const hours = (firstTouchAt.getTime() - lead.createdAt.getTime()) / (1000 * 60 * 60);
        return hours <= 24;
      }
    ).length;

    const averageHoursToFirstContact =
      firstTouchByLead.size > 0
        ? Array.from(firstTouchByLead.entries()).reduce((acc, [leadId, firstTouchAt]) => {
            const lead = leadsById.get(leadId);
            if (!lead) return acc;
            const hours =
              (firstTouchAt.getTime() - lead.createdAt.getTime()) / (1000 * 60 * 60);
            return acc + hours;
          }, 0) / firstTouchByLead.size
        : 0;

    const contactLeads = leadsThisWeekData.filter((lead) =>
      ['CONTACTADO', 'DEMO', 'CONVERTIDO'].includes(lead.status)
    );
    const demoLeads = leadsThisWeekData.filter((lead) =>
      ['DEMO', 'CONVERTIDO'].includes(lead.status)
    );
    const convertedLeads = leadsThisWeekData.filter((lead) => lead.status === 'CONVERTIDO');

    const contactToDemoRate =
      contactLeads.length > 0 ? (demoLeads.length / contactLeads.length) * 100 : 0;
    const demoToClosedRate =
      demoLeads.length > 0 ? (convertedLeads.length / demoLeads.length) * 100 : 0;
    const contactRate24h =
      leadsThisWeekData.length > 0 ? (contactedIn24h / leadsThisWeekData.length) * 100 : 0;
    const whatsappResponse48hRate =
      leadsThisWeekData.length > 0
        ? (whatsappTouchesByLead.size / leadsThisWeekData.length) * 100
        : 0;

    return {
      leadsThisWeek: leadsThisWeekData.length,
      contactRate24h: Math.round(contactRate24h * 100) / 100,
      contactToDemoRate: Math.round(contactToDemoRate * 100) / 100,
      demoToClosedRate: Math.round(demoToClosedRate * 100) / 100,
      whatsappResponse48hRate: Math.round(whatsappResponse48hRate * 100) / 100,
      averageHoursToFirstContact: Math.round(averageHoursToFirstContact * 100) / 100,
      appointmentsBookedThisWeek: demoLeads.length,
      conversionsThisWeek: convertedLeads.length,
    };
  }
}

import { prisma } from '@/lib/prisma';
import { subDays } from 'date-fns';

export interface CampaignCplData {
  campaign: string;
  spend: number;
  leads: number;
  cpl: number;
}

export interface StagnantLead {
  id: string;
  name: string;
  phone: string;
  funnelStage: string;
  temperature: string;
  advisor: string | null;
  program: string | null;
  daysSinceUpdate: number;
  lastStageChange: Date;
}

export interface CampaignPerformance {
  campaign: string;
  spend: number;
  totalLeads: number;
  matriculados: number;
  perdidos: number;
  cpl: number;
  conversionRate: number;
  cps: number; // Cost Per Sale
}

export class CplAnalyticsService {
  /**
   * Calcular CPL por campaña
   */
  static async getCplByCampaign(tenantId: string, period: number = 30): Promise<CampaignCplData[]> {
    const startDate = subDays(new Date(), period);

    // Costos por campaña
    const costs = await prisma.campaignCost.groupBy({
      by: ['campaign'],
      where: { tenantId, date: { gte: startDate } },
      _sum: { spendCop: true },
    });

    // Leads por campaña (usando utmCampaign)
    const leads = await prisma.prospect.groupBy({
      by: ['utmCampaign'],
      where: {
        tenantId,
        createdAt: { gte: startDate },
        utmCampaign: { not: null },
      },
      _count: true,
    });

    // Combinar y calcular CPL
    const campaignMap = new Map<string, CampaignCplData>();

    costs.forEach(c => {
      campaignMap.set(c.campaign, {
        campaign: c.campaign,
        spend: Number(c._sum.spendCop || 0),
        leads: 0,
        cpl: 0,
      });
    });

    leads.forEach(l => {
      if (!l.utmCampaign) return;

      const existing = campaignMap.get(l.utmCampaign) || {
        campaign: l.utmCampaign,
        spend: 0,
        leads: 0,
        cpl: 0,
      };
      existing.leads = l._count;
      existing.cpl = existing.spend > 0 ? existing.spend / existing.leads : 0;
      campaignMap.set(l.utmCampaign, existing);
    });

    return Array.from(campaignMap.values()).sort((a, b) => b.spend - a.spend);
  }

  /**
   * Identificar leads estancados (sin cambio de etapa en X días)
   */
  static async getStagnantLeads(tenantId: string, daysStagnant: number = 7): Promise<StagnantLead[]> {
    const cutoffDate = subDays(new Date(), daysStagnant);

    const prospects = await prisma.prospect.findMany({
      where: {
        tenantId,
        funnelStage: { notIn: ['MATRICULADO', 'PERDIDO'] },
        updatedAt: { lt: cutoffDate },
      },
      include: {
        advisor: { select: { name: true } },
        program: { select: { name: true } },
        interactions: {
          where: { type: 'CAMBIO_ETAPA' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'asc' },
      take: 50, // Limitar a 50 para performance
    });

    return prospects.map(p => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
      funnelStage: p.funnelStage,
      temperature: p.temperature,
      advisor: p.advisor?.name || null,
      program: p.program?.name || null,
      daysSinceUpdate: Math.floor(
        (Date.now() - p.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      ),
      lastStageChange: p.interactions[0]?.createdAt || p.createdAt,
    }));
  }

  /**
   * Rendimiento completo de campañas
   */
  static async getCampaignPerformance(tenantId: string, period: number = 30): Promise<CampaignPerformance[]> {
    const cplData = await this.getCplByCampaign(tenantId, period);
    const startDate = subDays(new Date(), period);

    // Conversiones por campaña
    const conversions = await prisma.prospect.groupBy({
      by: ['utmCampaign', 'funnelStage'],
      where: {
        tenantId,
        createdAt: { gte: startDate },
        utmCampaign: { not: null },
      },
      _count: true,
    });

    // Calcular métricas
    const performanceMap = new Map<string, Omit<CampaignPerformance, 'spend' | 'cpl' | 'conversionRate' | 'cps'>>();

    conversions.forEach(c => {
      if (!c.utmCampaign) return;

      const key = c.utmCampaign;
      const existing = performanceMap.get(key) || {
        campaign: key,
        totalLeads: 0,
        matriculados: 0,
        perdidos: 0,
      };

      existing.totalLeads += c._count;
      if (c.funnelStage === 'MATRICULADO') existing.matriculados += c._count;
      if (c.funnelStage === 'PERDIDO') existing.perdidos += c._count;

      performanceMap.set(key, existing);
    });

    // Combinar con CPL
    const results: CampaignPerformance[] = Array.from(performanceMap.values()).map(p => {
      const cplInfo = cplData.find(c => c.campaign === p.campaign);
      const conversionRate = p.totalLeads > 0 ? (p.matriculados / p.totalLeads) * 100 : 0;
      const cps = p.matriculados > 0 ? (cplInfo?.spend || 0) / p.matriculados : 0;

      return {
        ...p,
        spend: cplInfo?.spend || 0,
        cpl: cplInfo?.cpl || 0,
        conversionRate,
        cps,
      };
    });

    return results.sort((a, b) => b.totalLeads - a.totalLeads);
  }
}

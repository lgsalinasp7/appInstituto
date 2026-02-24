import { CplAnalyticsService } from '@/modules/campaigns/services/cpl-analytics.service';
import { prisma } from '@/lib/prisma';
import { subDays } from 'date-fns';

export class ReportGeneratorService {
  /**
   * Generar reporte diario (formato del playbook)
   */
  static async generateDailyReport(tenantId: string): Promise<string> {
    const today = new Date();
    const yesterday = subDays(today, 1);

    // Leads nuevos (últimas 24h)
    const newLeads = await prisma.prospect.count({
      where: { tenantId, createdAt: { gte: yesterday } },
    });

    // Leads calientes
    const hotLeads = await prisma.prospect.count({
      where: {
        tenantId,
        temperature: 'CALIENTE',
        funnelStage: { notIn: ['MATRICULADO', 'PERDIDO'] },
      },
    });

    // Leads estancados
    const stagnant = await CplAnalyticsService.getStagnantLeads(tenantId, 7);

    // Top campañas (últimos 7 días)
    const topCampaigns = await prisma.prospect.groupBy({
      by: ['utmCampaign'],
      where: {
        tenantId,
        createdAt: { gte: subDays(today, 7) },
        utmCampaign: { not: null },
      },
      _count: true,
      orderBy: { _count: { utmCampaign: 'desc' } },
      take: 3,
    });

    // CPL promedio (últimos 7 días)
    const cplData = await CplAnalyticsService.getCplByCampaign(tenantId, 7);
    const avgCpl = cplData.length > 0
      ? cplData.reduce((acc, c) => acc + c.cpl, 0) / cplData.length
      : 0;

    // Formatear reporte según playbook
    const topCampaignsText = topCampaigns.length > 0
      ? topCampaigns.map((c, i) => `${i + 1}. ${c.utmCampaign} - ${c._count} leads`).join('\n')
      : 'Sin datos de campañas';

    const alert = this.generateAlert(hotLeads, stagnant.length, avgCpl);

    return `📊 *Resumen Diario Comercial*
📅 Fecha: ${today.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}

🆕 *Leads nuevos:* ${newLeads}
🔥 *Leads calientes:* ${hotLeads}
⚠️ *Leads estancados:* ${stagnant.length}

🏆 *Top campañas por leads (7 días):*
${topCampaignsText}

💰 *CPL promedio:* $${Math.round(avgCpl).toLocaleString('es-CO')}

⚡ *Alerta del día:*
${alert}`;
  }

  /**
   * Generar reporte semanal (formato del playbook)
   */
  static async generateWeeklyReport(tenantId: string): Promise<string> {
    const today = new Date();
    const weekStart = subDays(today, 7);

    // Gasto total
    const costs = await prisma.campaignCost.aggregate({
      where: { tenantId, date: { gte: weekStart } },
      _sum: { spendCop: true },
    });

    const totalSpend = Number(costs._sum.spendCop || 0);

    // Leads totales
    const totalLeads = await prisma.prospect.count({
      where: { tenantId, createdAt: { gte: weekStart } },
    });

    // CPL global
    const globalCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;

    // Rendimiento de campañas
    const performance = await CplAnalyticsService.getCampaignPerformance(tenantId, 7);

    // Recomendaciones
    const avgCpl = performance.length > 0
      ? performance.reduce((acc, p) => acc + p.cpl, 0) / performance.length
      : 0;

    const toScale = performance.filter(p => p.cpl < avgCpl && p.conversionRate > 5);
    const toPause = performance.filter(p => p.cpl > avgCpl * 1.5 || p.conversionRate < 2);

    // Leads calientes para cierre
    const hotLeads = await prisma.prospect.findMany({
      where: {
        tenantId,
        temperature: 'CALIENTE',
        funnelStage: { in: ['NEGOCIACION', 'LLAMADA_REALIZADA', 'APLICACION'] },
      },
      take: 5,
      select: { name: true, phone: true, funnelStage: true },
    });

    const toScaleText = toScale.length > 0
      ? toScale.map(c => `• ${c.campaign} (CPL: $${Math.round(c.cpl).toLocaleString('es-CO')}, Conv: ${c.conversionRate.toFixed(1)}%)`).join('\n')
      : '- Ninguna';

    const toPauseText = toPause.length > 0
      ? toPause.map(c => `• ${c.campaign} (CPL: $${Math.round(c.cpl).toLocaleString('es-CO')}, Conv: ${c.conversionRate.toFixed(1)}%)`).join('\n')
      : '- Ninguna';

    const hotLeadsText = hotLeads.length > 0
      ? hotLeads.map(l => `• ${l.name} (${l.phone}) - ${l.funnelStage}`).join('\n')
      : '- No hay leads calientes listos para cierre';

    return `📊 *Resumen Semanal Comercial*
📅 Periodo: ${weekStart.toLocaleDateString('es-CO')} - ${today.toLocaleDateString('es-CO')}

💰 *Gasto total:* $${totalSpend.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
👥 *Leads totales:* ${totalLeads}
📉 *CPL global:* $${Math.round(globalCpl).toLocaleString('es-CO')}

📈 *Campañas a escalar:*
${toScaleText}

⏸️ *Campañas a pausar:*
${toPauseText}

🔥 *Acción prioritaria de cierre:*
${hotLeadsText}

---
💡 *Próximos pasos sugeridos:*
• Revisar leads estancados en dashboard
• Aumentar presupuesto en campañas de alto rendimiento
• Contactar leads calientes antes de fin de semana`;
  }

  private static generateAlert(hotLeads: number, stagnant: number, avgCpl: number): string {
    if (hotLeads > 10) {
      return `🎯 Tienes ${hotLeads} leads calientes, ¡prioriza contacto HOY!`;
    }
    if (stagnant > 20) {
      return `⚠️ Hay ${stagnant} leads estancados, revisar seguimientos urgente`;
    }
    if (avgCpl > 50000) {
      return `💸 CPL alto ($${Math.round(avgCpl).toLocaleString('es-CO')}), revisar campañas`;
    }
    if (hotLeads > 5) {
      return `✅ ${hotLeads} leads calientes esperando contacto`;
    }
    return '✅ Todo operando normalmente, mantener el ritmo';
  }
}

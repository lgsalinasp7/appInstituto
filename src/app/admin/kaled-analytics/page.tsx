import { Suspense } from 'react';
import { KaledAnalyticsService } from '@/modules/kaled-crm/services/kaled-analytics.service';
import { resolveKaledTenantId } from '@/lib/kaled-tenant';
import KaledAnalyticsClient from './KaledAnalyticsClient';

export const metadata = {
  title: 'Analytics CRM | KaledSoft',
  description: 'Métricas y análisis del pipeline comercial',
};

async function getAnalyticsData() {
  const tenantId = await resolveKaledTenantId();
  const [overviewMetrics, conversionMetrics, leadsTrend, byStatus] =
    await Promise.all([
      KaledAnalyticsService.getOverviewMetrics(tenantId),
      KaledAnalyticsService.getConversionMetrics(tenantId),
      KaledAnalyticsService.getLeadsTrend(tenantId),
      KaledAnalyticsService.getLeadsByStatus(tenantId),
    ]);

  const { prisma } = await import('@/lib/prisma');
  const campaigns = await prisma.kaledCampaign.findMany({
    where: { tenantId },
    include: {
      _count: {
        select: {
          leads: {
            where: { deletedAt: null },
          },
        },
      },
    },
  });

  const byCampaign = campaigns
    .filter((c) => c._count.leads > 0)
    .map((c) => ({
      name: c.name,
      count: c._count.leads,
    }));

  return {
    overview: {
      totalLeads: overviewMetrics.totalLeads,
      conversionRate: overviewMetrics.conversionRate,
      avgTimeToConversion: overviewMetrics.averageTimeToConversion,
      responseVelocity: overviewMetrics.averageResponseTime,
    },
    conversion: {
      byStage: byStatus.reduce((acc, item) => {
        acc[item.status] = item.count;
        return acc;
      }, {} as Record<string, number>),
      timeline: leadsTrend,
      byCampaign,
    },
  };
}

export default async function KaledAnalyticsPage() {
  const analyticsData = await getAnalyticsData();

  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<div>Cargando analytics...</div>}>
        <KaledAnalyticsClient data={analyticsData} />
      </Suspense>
    </div>
  );
}

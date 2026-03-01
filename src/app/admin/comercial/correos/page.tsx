import { prisma } from '@/lib/prisma';
import { resolveKaledTenantId } from '@/lib/kaled-tenant';
import CommercialEmailDashboardClient from './CommercialEmailDashboardClient';

export const metadata = {
  title: 'Correos Comercial | KaledSoft',
  description: 'Módulo de correos en el dashboard comercial de KaledSoft',
};

async function getTemplates() {
  const tenantId = await resolveKaledTenantId();
  return prisma.kaledEmailTemplate.findMany({
    where: { tenantId },
    include: {
      _count: {
        select: {
          emailLogs: true,
        },
      },
      campaign: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async function getAnalytics() {
  const tenantId = await resolveKaledTenantId();
  const templates = await prisma.kaledEmailTemplate.findMany({
    where: {
      isActive: true,
      tenantId,
    },
    include: {
      emailLogs: {
        select: {
          id: true,
          status: true,
          openCount: true,
          clickCount: true,
          kaledLead: {
            select: {
              id: true,
              purchasedAt: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const analyticsData = templates.map((template) => {
    const totalSent = template.emailLogs.length;
    const totalDelivered = template.emailLogs.filter((log) =>
      ['DELIVERED', 'OPENED', 'CLICKED'].includes(log.status)
    ).length;
    const totalOpened = template.emailLogs.filter((log) =>
      ['OPENED', 'CLICKED'].includes(log.status)
    ).length;
    const totalClicked = template.emailLogs.filter((log) => log.status === 'CLICKED').length;
    const totalConverted = template.emailLogs.filter(
      (log) => log.kaledLead?.purchasedAt != null
    ).length;

    const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
    const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;
    const conversionRate = totalSent > 0 ? (totalConverted / totalSent) * 100 : 0;

    return {
      id: template.id,
      name: template.name,
      subject: template.subject,
      category: template.category,
      phase: template.phase,
      isLibraryTemplate: template.isLibraryTemplate,
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      totalConverted,
      openRate: Math.round(openRate * 10) / 10,
      clickRate: Math.round(clickRate * 10) / 10,
      conversionRate: Math.round(conversionRate * 10) / 10,
    };
  });

  const globalStats = {
    totalTemplates: templates.length,
    totalEmailsSent: analyticsData.reduce((sum, template) => sum + template.totalSent, 0),
    avgOpenRate:
      analyticsData.length > 0
        ? Math.round(
            (analyticsData.reduce((sum, template) => sum + template.openRate, 0) /
              analyticsData.length) *
              10
          ) / 10
        : 0,
    avgClickRate:
      analyticsData.length > 0
        ? Math.round(
            (analyticsData.reduce((sum, template) => sum + template.clickRate, 0) /
              analyticsData.length) *
              10
          ) / 10
        : 0,
    avgConversionRate:
      analyticsData.length > 0
        ? Math.round(
            (analyticsData.reduce((sum, template) => sum + template.conversionRate, 0) /
              analyticsData.length) *
              10
          ) / 10
        : 0,
  };

  return { analyticsData, globalStats };
}

export default async function ComercialCorreosPage() {
  const [templates, analytics] = await Promise.all([getTemplates(), getAnalytics()]);

  return (
    <CommercialEmailDashboardClient
      templates={templates}
      analyticsData={analytics.analyticsData}
      globalStats={analytics.globalStats}
    />
  );
}

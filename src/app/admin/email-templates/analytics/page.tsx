import { prisma } from '@/lib/prisma';
import { EmailAnalyticsClient } from './EmailAnalyticsClient';

export const metadata = {
  title: 'Analytics de Email | KaledSoft',
  description: 'Métricas de rendimiento de plantillas de email',
};

export default async function EmailAnalyticsPage() {
  // Obtener todas las plantillas con sus métricas
  const templates = await prisma.kaledEmailTemplate.findMany({
    where: {
      isActive: true,
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

  // Calcular métricas por plantilla
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
      (log) => log.kaledLead?.purchasedAt !== null
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

  // Calcular métricas globales
  const globalStats = {
    totalTemplates: templates.length,
    totalEmailsSent: analyticsData.reduce((sum, t) => sum + t.totalSent, 0),
    avgOpenRate:
      analyticsData.length > 0
        ? Math.round(
            (analyticsData.reduce((sum, t) => sum + t.openRate, 0) / analyticsData.length) * 10
          ) / 10
        : 0,
    avgClickRate:
      analyticsData.length > 0
        ? Math.round(
            (analyticsData.reduce((sum, t) => sum + t.clickRate, 0) / analyticsData.length) * 10
          ) / 10
        : 0,
    avgConversionRate:
      analyticsData.length > 0
        ? Math.round(
            (analyticsData.reduce((sum, t) => sum + t.conversionRate, 0) / analyticsData.length) *
              10
          ) / 10
        : 0,
  };

  const activeTemplates = analyticsData.filter((template) => template.totalSent > 0).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 shadow-[0_18px_60px_-35px_rgba(8,145,178,0.7)]">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
          Performance Dashboard
        </p>
        <h1 className="mb-2 text-3xl font-bold text-slate-100 md:text-4xl">Analytics de Email</h1>
        <p className="text-slate-400">
          Métricas de rendimiento de tus plantillas de email
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1 text-xs font-medium text-slate-300">
            Plantillas activas: {globalStats.totalTemplates}
          </span>
          <span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1 text-xs font-medium text-slate-300">
            Con envíos: {activeTemplates}
          </span>
          <span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1 text-xs font-medium text-slate-300">
            Emails enviados: {globalStats.totalEmailsSent}
          </span>
        </div>
      </div>

      <EmailAnalyticsClient analyticsData={analyticsData} globalStats={globalStats} />
    </div>
  );
}

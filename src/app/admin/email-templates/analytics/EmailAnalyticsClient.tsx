'use client';

import { useEffect, useMemo, useState } from 'react';
import { BarChart3, TrendingUp, Mail, MousePointer, ShoppingCart } from 'lucide-react';
import { useTablePagination } from '@/hooks/use-table-pagination';
import { TablePagination } from '@/components/ui/table-pagination';

interface TemplateAnalytics {
  id: string;
  name: string;
  subject: string;
  category: string;
  phase: string | null;
  isLibraryTemplate: boolean;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalConverted: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

interface GlobalStats {
  totalTemplates: number;
  totalEmailsSent: number;
  avgOpenRate: number;
  avgClickRate: number;
  avgConversionRate: number;
}

interface EmailAnalyticsClientProps {
  analyticsData: TemplateAnalytics[];
  globalStats: GlobalStats;
}

type SortKey = 'sent' | 'openRate' | 'clickRate' | 'conversionRate';

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'sent', label: 'Emails Enviados' },
  { value: 'openRate', label: 'Open Rate' },
  { value: 'clickRate', label: 'Click Rate' },
  { value: 'conversionRate', label: 'Conversion Rate' },
];

const PHASE_LABELS: Record<string, string> = {
  FASE_1: 'Fase 1',
  FASE_2: 'Fase 2',
  FASE_3: 'Fase 3',
  NO_SHOW: 'No-Show',
};

const PHASE_COLORS: Record<string, string> = {
  FASE_1: 'border-cyan-500/35 bg-cyan-500/10 text-cyan-200',
  FASE_2: 'border-amber-500/35 bg-amber-500/10 text-amber-200',
  FASE_3: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200',
  NO_SHOW: 'border-rose-500/35 bg-rose-500/10 text-rose-200',
};

const getRateBadge = (value: number, highThreshold: number, mediumThreshold: number) => {
  if (value >= highThreshold) {
    return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200';
  }
  if (value >= mediumThreshold) {
    return 'border-amber-500/40 bg-amber-500/15 text-amber-200';
  }
  return 'border-rose-500/40 bg-rose-500/15 text-rose-200';
};

export function EmailAnalyticsClient({ analyticsData, globalStats }: EmailAnalyticsClientProps) {
  const [sortBy, setSortBy] = useState<SortKey>('sent');
  const [filterPhase, setFilterPhase] = useState<string | null>('ALL');

  const phases = useMemo(
    () => ['ALL', ...new Set(analyticsData.map((template) => template.phase).filter(Boolean) as string[])],
    [analyticsData]
  );

  const sortedData = useMemo(() => {
    const filteredData = analyticsData.filter(
      (template) => filterPhase === 'ALL' || template.phase === filterPhase
    );

    return filteredData.toSorted((a, b) => {
      switch (sortBy) {
        case 'sent':
          return b.totalSent - a.totalSent;
        case 'openRate':
          return b.openRate - a.openRate;
        case 'clickRate':
          return b.clickRate - a.clickRate;
        case 'conversionRate':
          return b.conversionRate - a.conversionRate;
        default:
          return 0;
      }
    });
  }, [analyticsData, filterPhase, sortBy]);
  const {
    page,
    totalPages,
    totalItems,
    pageSize,
    paginatedItems,
    setPage,
    resetPage,
  } = useTablePagination(sortedData, 6);

  useEffect(() => {
    resetPage();
  }, [sortBy, filterPhase, resetPage]);

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 shadow-[0_18px_45px_-35px_rgba(34,211,238,0.7)]">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-400">Total Plantillas</h3>
            <BarChart3 className="h-5 w-5 text-cyan-300" />
          </div>
          <p className="text-3xl font-bold text-slate-100">{globalStats.totalTemplates}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-400">Emails Enviados</h3>
            <Mail className="h-5 w-5 text-emerald-300" />
          </div>
          <p className="text-3xl font-bold text-slate-100">{globalStats.totalEmailsSent}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-400">Open Rate Promedio</h3>
            <TrendingUp className="h-5 w-5 text-violet-300" />
          </div>
          <p className="text-3xl font-bold text-slate-100">{globalStats.avgOpenRate}%</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-400">Click Rate Promedio</h3>
            <MousePointer className="h-5 w-5 text-amber-300" />
          </div>
          <p className="text-3xl font-bold text-slate-100">{globalStats.avgClickRate}%</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-400">Conversion Rate Promedio</h3>
            <ShoppingCart className="h-5 w-5 text-rose-300" />
          </div>
          <p className="text-3xl font-bold text-slate-100">{globalStats.avgConversionRate}%</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-medium text-slate-300">Filtrar por fase:</label>
            {phases.map((phase) => (
              <button
                key={phase}
                onClick={() => setFilterPhase(phase)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                  filterPhase === phase
                    ? 'border-cyan-400/70 bg-cyan-500/15 text-cyan-200'
                    : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500 hover:text-slate-100'
                }`}
              >
                {phase === 'ALL' ? 'Todas' : PHASE_LABELS[phase] || phase}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-300">Ordenar por:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 focus:border-cyan-400/70 focus:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-800 bg-slate-950/75">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  Plantilla
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  Fase
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
                  Enviados
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
                  Abiertos
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
                  Clicks
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
                  Open Rate
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
                  Click Rate
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
                  Conversión
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No hay datos disponibles
                  </td>
                </tr>
              ) : (
                paginatedItems.map((template) => (
                  <tr key={template.id} className="transition-colors hover:bg-slate-800/35">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-slate-100">{template.name}</div>
                        <div className="line-clamp-1 text-xs text-slate-400">{template.subject}</div>
                        {template.isLibraryTemplate && (
                          <span className="mt-1 inline-block rounded border border-fuchsia-500/35 bg-fuchsia-500/10 px-2 py-1 text-xs text-fuchsia-200">
                            Librería
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {template.phase ? (
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs ${PHASE_COLORS[template.phase] || 'border-slate-700 bg-slate-900 text-slate-300'}`}
                        >
                          {PHASE_LABELS[template.phase] || template.phase}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-slate-100">
                        {template.totalSent}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-slate-300">{template.totalOpened}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-slate-300">{template.totalClicked}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRateBadge(template.openRate, 40, 20)}`}
                      >
                        {template.openRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRateBadge(template.clickRate, 10, 5)}`}
                      >
                        {template.clickRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRateBadge(template.conversionRate, 5, 2)}`}
                      >
                        {template.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <TablePagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      {/* Insights */}
      {sortedData.length > 0 && (
        <div className="rounded-2xl border border-cyan-500/35 bg-cyan-500/10 p-6">
          <h3 className="mb-4 text-lg font-semibold text-cyan-100">Insights</h3>
          <div className="space-y-2 text-sm text-cyan-50/90">
            {sortedData[0] && sortedData[0].openRate > 0 && (
              <p>
                • <strong>{sortedData[0].name}</strong> tiene el mejor open rate con{' '}
                {sortedData[0].openRate}%
              </p>
            )}
            {globalStats.avgOpenRate < 20 && (
              <p>
                • ⚠️ El open rate promedio ({globalStats.avgOpenRate}%) está por debajo del estándar
                de la industria (20-30%)
              </p>
            )}
            {globalStats.avgClickRate > 5 && (
              <p>
                • ✅ El click rate promedio ({globalStats.avgClickRate}%) está por encima del
                estándar de la industria (2-5%)
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

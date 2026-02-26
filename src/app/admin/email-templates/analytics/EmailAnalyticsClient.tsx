'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Mail, MousePointer, ShoppingCart } from 'lucide-react';

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

export function EmailAnalyticsClient({ analyticsData, globalStats }: EmailAnalyticsClientProps) {
  const [sortBy, setSortBy] = useState<'sent' | 'openRate' | 'clickRate' | 'conversionRate'>(
    'sent'
  );
  const [filterPhase, setFilterPhase] = useState<string | null>('ALL');

  // Filtrar por fase
  const filteredData = analyticsData.filter(
    (template) => filterPhase === 'ALL' || template.phase === filterPhase
  );

  // Ordenar
  const sortedData = [...filteredData].sort((a, b) => {
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

  // Obtener fases únicas
  const phases: (string | null)[] = ['ALL', ...new Set(analyticsData.map((t) => t.phase).filter(Boolean) as string[])];

  return (
    <div className="space-y-8">
      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Plantillas</h3>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{globalStats.totalTemplates}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Emails Enviados</h3>
            <Mail className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{globalStats.totalEmailsSent}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Open Rate Promedio</h3>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{globalStats.avgOpenRate}%</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Click Rate Promedio</h3>
            <MousePointer className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{globalStats.avgClickRate}%</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Conversion Rate Promedio</h3>
            <ShoppingCart className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{globalStats.avgConversionRate}%</p>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <label className="text-sm font-medium text-gray-700">Filtrar por fase:</label>
            {phases.map((phase) => (
              <button
                key={phase}
                onClick={() => setFilterPhase(phase)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filterPhase === phase
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {phase === 'ALL' ? 'Todas' : phase}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="sent">Emails Enviados</option>
              <option value="openRate">Open Rate</option>
              <option value="clickRate">Click Rate</option>
              <option value="conversionRate">Conversion Rate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plantilla
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fase
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enviados
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Abiertos
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clicks
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Open Rate
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Click Rate
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversión
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No hay datos disponibles
                  </td>
                </tr>
              ) : (
                sortedData.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{template.name}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">{template.subject}</div>
                        {template.isLibraryTemplate && (
                          <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                            Librería
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {template.phase ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {template.phase}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-gray-900">
                        {template.totalSent}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-700">{template.totalOpened}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-700">{template.totalClicked}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          template.openRate >= 40
                            ? 'bg-green-100 text-green-800'
                            : template.openRate >= 20
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {template.openRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          template.clickRate >= 10
                            ? 'bg-green-100 text-green-800'
                            : template.clickRate >= 5
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {template.clickRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          template.conversionRate >= 5
                            ? 'bg-green-100 text-green-800'
                            : template.conversionRate >= 2
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
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

      {/* Insights */}
      {sortedData.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Insights</h3>
          <div className="space-y-2 text-sm text-blue-800">
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

"use client";

/**
 * ReportsView Component
 * Responsive reports showing advisor rankings, program distribution, and pending debts
 */

import { Download, ChevronRight } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { AdvisorPerformance, PendingDebt, ProgramDistribution } from "../types";
import { CHART_COLORS } from "../data/mock-data";

interface ReportsViewProps {
  advisorPerformance: AdvisorPerformance[];
  programDistribution: ProgramDistribution[];
  pendingDebts: PendingDebt[];
}

const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.warning, CHART_COLORS.success];

export function ReportsView({
  advisorPerformance,
  programDistribution,
  pendingDebts,
}: ReportsViewProps) {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Advisor Ranking */}
        <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-100 shadow-instituto">
          <h3 className="font-bold text-lg text-primary mb-4 sm:mb-6">
            Ventas por Asesor
          </h3>
          <div className="space-y-4 sm:space-y-5">
            {advisorPerformance.map((advisor, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-instituto text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1.5 sm:mb-2">
                    <span className="text-sm font-bold text-primary truncate">
                      {advisor.name}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 font-semibold ml-2 flex-shrink-0">
                      {advisor.sales} ventas
                    </span>
                  </div>
                  <div className="w-full h-2 sm:h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-instituto rounded-full shadow-sm"
                      style={{ width: `${(advisor.collected / 8000) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right min-w-[70px] sm:min-w-[90px] flex-shrink-0">
                  <span className="text-sm font-bold text-primary">
                    ${advisor.collected.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Programs Distribution */}
        <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-100 shadow-instituto flex flex-col">
          <h3 className="font-bold text-lg text-primary mb-4 sm:mb-6">
            Distribución de Programas
          </h3>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={programDistribution}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {programDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 40px rgba(30, 58, 95, 0.15)",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6">
            <div className="text-center p-2 sm:p-3 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 font-bold uppercase tracking-wide">
                Bachillerato
              </p>
              <p className="font-bold text-primary text-base sm:text-lg">65%</p>
            </div>
            <div className="text-center p-2 sm:p-3 bg-orange-50 rounded-xl border border-orange-100">
              <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 font-bold uppercase tracking-wide">
                Inglés
              </p>
              <p className="font-bold text-orange-600 text-base sm:text-lg">25%</p>
            </div>
            <div className="text-center p-2 sm:p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 font-bold uppercase tracking-wide">
                Otros
              </p>
              <p className="font-bold text-emerald-600 text-base sm:text-lg">10%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Debts */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-instituto overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            <h3 className="font-bold text-primary">Cartera Pendiente Detallada</h3>
            <button className="flex items-center justify-center gap-2 text-xs font-bold text-primary bg-primary/5 px-4 py-2.5 rounded-xl hover:bg-primary/10 transition-all border border-primary/10 w-full sm:w-auto">
              <Download size={14} strokeWidth={3} />
              Exportar Reporte
            </button>
          </div>
        </div>

        {/* Mobile View - Cards */}
        <div className="lg:hidden divide-y divide-gray-100">
          {pendingDebts.map((row, i) => (
            <div key={i} className="p-4 hover:bg-orange-50/30 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-primary">{row.name}</p>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-semibold">
                    {row.advisor}
                  </span>
                </div>
                <span className="font-bold text-red-600">${row.balance.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-gray-500">
                  Vence: <span className="font-semibold text-gray-700">{row.due}</span>
                </span>
                <button className="flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                  Gestionar
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Estudiante
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Deuda Total
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Vencimiento
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Asesor
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingDebts.map((row, i) => (
                <tr key={i} className="hover:bg-orange-50/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-primary">
                    {row.name}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-red-600">
                    ${row.balance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-semibold">
                    {row.due}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-gray-100 px-3 py-1 rounded-lg text-gray-700 font-bold border border-gray-200">
                      {row.advisor}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-xs font-bold text-primary hover:text-[#2d4a6f] hover:underline">
                      Gestionar Cobro
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

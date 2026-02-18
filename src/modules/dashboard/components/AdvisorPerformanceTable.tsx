"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Loader2 } from "lucide-react";
import { useBranding } from "@/components/providers/BrandingContext";
import { cn } from "@/lib/utils";

interface AdvisorData {
  advisorId: string;
  advisorName: string;
  totalStudents: number;
  activeStudents: number;
  totalCollected: number;
  revenueThisMonth: number;
  studentsThisMonth: number;
  collectionRate: number;
  pendingAmount: number;
}

type Period = "month" | "3months" | "year";

const PERIOD_LABELS: Record<Period, string> = {
  month: "Este mes",
  "3months": "Últimos 3 meses",
  year: "Este año",
};

export function AdvisorPerformanceTable() {
  const branding = useBranding();
  const isDark = branding.darkMode !== false;
  const [advisors, setAdvisors] = useState<AdvisorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("month");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/advisors?period=${period}`);
      const data = await res.json();
      if (data.success) {
        setAdvisors(data.data);
      }
    } catch (error) {
      console.error("Error fetching advisor reports:", error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const maxRevenue = Math.max(...advisors.map((a) => a.revenueThisMonth), 1);
  const maxStudents = Math.max(...advisors.map((a) => a.studentsThisMonth), 1);

  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden",
        isDark
          ? "bg-slate-900/50 border-slate-800"
          : "bg-white border-gray-100 shadow-sm"
      )}
    >
      <div className="p-4 sm:p-6 border-b border-inherit">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.accentColor})` }}
            >
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3
                className={cn(
                  "text-lg font-bold font-display tracking-tight",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                Rendimiento por Vendedor
              </h3>
              <p
                className={cn(
                  "text-xs font-medium",
                  isDark ? "text-slate-500" : "text-slate-400"
                )}
              >
                Ventas y recaudos por asesor
              </p>
            </div>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className={cn(
              "text-sm border rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 transition-all",
              isDark
                ? "border-slate-700 bg-slate-800 text-slate-300 focus:ring-cyan-500/20"
                : "border-gray-200 bg-gray-50 text-slate-600 focus:ring-blue-500/20"
            )}
          >
            {Object.entries(PERIOD_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : advisors.length === 0 ? (
        <div className={cn("text-center py-12", isDark ? "text-slate-500" : "text-gray-400")}>
          No hay vendedores registrados
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className={cn(
                  isDark ? "bg-slate-800/50" : "bg-gray-50/80"
                )}
              >
                <th className={cn("px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider", isDark ? "text-slate-500" : "text-gray-500")}>
                  Vendedor
                </th>
                <th className={cn("px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider", isDark ? "text-slate-500" : "text-gray-500")}>
                  Matrículas
                </th>
                <th className={cn("px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider", isDark ? "text-slate-500" : "text-gray-500")}>
                  Recaudo período
                </th>
                <th className={cn("px-4 sm:px-6 py-3 text-center text-xs font-bold uppercase tracking-wider", isDark ? "text-slate-500" : "text-gray-500")}>
                  Tasa recaudo
                </th>
              </tr>
            </thead>
            <tbody className={cn("divide-y", isDark ? "divide-slate-800" : "divide-gray-100")}>
              {advisors.map((advisor) => {
                const revenuePercent = maxRevenue > 0 ? (advisor.revenueThisMonth / maxRevenue) * 100 : 0;
                const studentsPercent = maxStudents > 0 ? (advisor.studentsThisMonth / maxStudents) * 100 : 0;

                return (
                  <tr
                    key={advisor.advisorId}
                    className={cn(
                      "transition-colors",
                      isDark ? "hover:bg-slate-800/30" : "hover:bg-gray-50/50"
                    )}
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: branding.primaryColor }}
                        >
                          {advisor.advisorName.charAt(0)}
                        </div>
                        <span
                          className={cn(
                            "text-sm font-bold",
                            isDark ? "text-white" : "text-slate-900"
                          )}
                        >
                          {advisor.advisorName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-baseline gap-2">
                          <span className={cn("text-sm font-bold", isDark ? "text-white" : "text-slate-900")}>
                            {advisor.studentsThisMonth}
                          </span>
                          <span className={cn("text-xs", isDark ? "text-slate-500" : "text-gray-400")}>
                            / {advisor.totalStudents} total
                          </span>
                        </div>
                        <div className={cn("w-24 h-1.5 rounded-full overflow-hidden", isDark ? "bg-slate-800" : "bg-gray-200")}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${studentsPercent}%`,
                              backgroundColor: branding.primaryColor,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="space-y-1.5">
                        <span className={cn("text-sm font-bold", isDark ? "text-emerald-400" : "text-emerald-600")}>
                          ${advisor.revenueThisMonth.toLocaleString("es-CO")}
                        </span>
                        <div className={cn("w-32 h-1.5 rounded-full overflow-hidden", isDark ? "bg-slate-800" : "bg-gray-200")}>
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${revenuePercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <span
                        className={cn(
                          "inline-flex px-2.5 py-1 rounded-lg text-xs font-bold",
                          advisor.collectionRate >= 70
                            ? isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700"
                            : advisor.collectionRate >= 40
                            ? isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-700"
                            : isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-700"
                        )}
                      >
                        {advisor.collectionRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

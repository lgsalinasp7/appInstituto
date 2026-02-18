"use client";

import { useState, useEffect, useCallback } from "react";
import { Wallet, Loader2 } from "lucide-react";
import { useBranding } from "@/components/providers/BrandingContext";
import { cn } from "@/lib/utils";

interface CarteraUserData {
  userId: string;
  userName: string;
  userEmail: string;
  totalPaymentsRegistered: number;
  totalAmountCollected: number;
  paymentsThisPeriod: number;
  amountThisPeriod: number;
}

type Period = "month" | "3months" | "year";

const PERIOD_LABELS: Record<Period, string> = {
  month: "Este mes",
  "3months": "Últimos 3 meses",
  year: "Este año",
};

export function CarteraUserTable() {
  const branding = useBranding();
  const isDark = branding.darkMode !== false;
  const [users, setUsers] = useState<CarteraUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("month");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/cartera-users?period=${period}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching cartera user reports:", error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const maxAmount = Math.max(...users.map((u) => u.amountThisPeriod), 1);
  const maxPayments = Math.max(...users.map((u) => u.paymentsThisPeriod), 1);

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
              style={{ background: `linear-gradient(135deg, #f97316, #ea580c)` }}
            >
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3
                className={cn(
                  "text-lg font-bold font-display tracking-tight",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                Recaudo por Usuario de Cartera
              </h3>
              <p
                className={cn(
                  "text-xs font-medium",
                  isDark ? "text-slate-500" : "text-slate-400"
                )}
              >
                Cobros realizados por cada gestor de cartera
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
      ) : users.length === 0 ? (
        <div className={cn("text-center py-12", isDark ? "text-slate-500" : "text-gray-400")}>
          No hay usuarios de cartera registrados
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={cn(isDark ? "bg-slate-800/50" : "bg-gray-50/80")}>
                <th className={cn("px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider", isDark ? "text-slate-500" : "text-gray-500")}>
                  Usuario
                </th>
                <th className={cn("px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider", isDark ? "text-slate-500" : "text-gray-500")}>
                  Cobros período
                </th>
                <th className={cn("px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider", isDark ? "text-slate-500" : "text-gray-500")}>
                  Monto recaudado
                </th>
                <th className={cn("px-4 sm:px-6 py-3 text-right text-xs font-bold uppercase tracking-wider", isDark ? "text-slate-500" : "text-gray-500")}>
                  Total histórico
                </th>
              </tr>
            </thead>
            <tbody className={cn("divide-y", isDark ? "divide-slate-800" : "divide-gray-100")}>
              {users.map((user) => {
                const amountPercent = maxAmount > 0 ? (user.amountThisPeriod / maxAmount) * 100 : 0;
                const paymentsPercent = maxPayments > 0 ? (user.paymentsThisPeriod / maxPayments) * 100 : 0;

                return (
                  <tr
                    key={user.userId}
                    className={cn(
                      "transition-colors",
                      isDark ? "hover:bg-slate-800/30" : "hover:bg-gray-50/50"
                    )}
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user.userName.charAt(0)}
                        </div>
                        <div>
                          <span className={cn("text-sm font-bold block", isDark ? "text-white" : "text-slate-900")}>
                            {user.userName}
                          </span>
                          <span className={cn("text-xs", isDark ? "text-slate-500" : "text-gray-400")}>
                            {user.userEmail}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-baseline gap-2">
                          <span className={cn("text-sm font-bold", isDark ? "text-white" : "text-slate-900")}>
                            {user.paymentsThisPeriod}
                          </span>
                          <span className={cn("text-xs", isDark ? "text-slate-500" : "text-gray-400")}>
                            pagos
                          </span>
                        </div>
                        <div className={cn("w-24 h-1.5 rounded-full overflow-hidden", isDark ? "bg-slate-800" : "bg-gray-200")}>
                          <div
                            className="h-full rounded-full bg-orange-500 transition-all duration-500"
                            style={{ width: `${paymentsPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="space-y-1.5">
                        <span className={cn("text-sm font-bold", isDark ? "text-emerald-400" : "text-emerald-600")}>
                          ${user.amountThisPeriod.toLocaleString("es-CO")}
                        </span>
                        <div className={cn("w-32 h-1.5 rounded-full overflow-hidden", isDark ? "bg-slate-800" : "bg-gray-200")}>
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${amountPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <span className={cn("text-sm font-bold", isDark ? "text-slate-300" : "text-slate-600")}>
                        ${user.totalAmountCollected.toLocaleString("es-CO")}
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

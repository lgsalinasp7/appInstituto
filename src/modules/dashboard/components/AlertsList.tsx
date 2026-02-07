"use client";

/**
 * AlertsList Component
 * Shows payment alerts and reminders
 */

import { AlertCircle, Send } from "lucide-react";
import type { AlertItem } from "../types";
import { useBranding } from "@/components/providers/BrandingContext";
import { cn } from "@/lib/utils";

interface AlertsListProps {
  alerts: AlertItem[];
}

export function AlertsList({ alerts }: AlertsListProps) {
  const branding = useBranding();
  const isDark = branding.darkMode !== false;

  return (
    <div className={cn(
      "p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border h-full flex flex-col transition-colors shadow-sm",
      isDark ? "bg-slate-900/40 border-white/[0.05]" : "bg-white border-slate-200 shadow-slate-200/50"
    )}>
      <div className="flex items-center gap-2 sm:gap-2.5 mb-4 sm:mb-6">
        <div className={cn(
          "p-1.5 sm:p-2 rounded-lg",
          isDark ? "bg-orange-500/10" : "bg-orange-50"
        )}>
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" strokeWidth={2.5} />
        </div>
        <h3 className={cn(
          "font-bold text-sm sm:text-base",
          isDark ? "text-slate-100" : "text-primary"
        )}>Alertas de Cobro</h3>
      </div>

      <div className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto max-h-60 sm:max-h-none custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 opacity-50">
            <AlertCircle className="w-8 h-8 mb-2 text-slate-500" />
            <p className="text-sm text-gray-400 text-center">Sin alertas pendientes</p>
          </div>
        ) : (
          alerts.map((alert, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center justify-between p-3 sm:p-4 border rounded-lg sm:rounded-xl transition-all group",
                isDark
                  ? "border-white/5 bg-white/[0.02] hover:border-cyan-500/20 hover:bg-white/[0.05]"
                  : "border-gray-100 bg-gray-50/50 hover:border-primary/20 hover:bg-gray-50 hover:shadow-sm"
              )}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div
                  className={cn(
                    "w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 animate-pulse",
                    alert.type === "overdue" ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-orange-500"
                  )}
                />
                <div className="min-w-0">
                  <p className={cn(
                    "text-xs sm:text-sm font-bold truncate",
                    isDark ? "text-slate-200" : "text-primary"
                  )}>{alert.name}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-semibold">
                    {alert.date} • {alert.amount}
                  </p>
                </div>
              </div>
              <button className={cn(
                "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 sm:p-2 rounded-lg transition-all flex-shrink-0",
                isDark ? "text-cyan-400 hover:bg-cyan-400/10" : "text-primary hover:bg-primary/5"
              )}>
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
              </button>
            </div>
          ))
        )}
      </div>

      <button className={cn(
        "mt-4 sm:mt-6 w-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl transition-all border",
        isDark
          ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
          : "bg-gray-50 hover:bg-gray-100 text-gray-500 border-gray-200"
      )}>
        Ver todos los compromisos
      </button>
    </div>
  );
}

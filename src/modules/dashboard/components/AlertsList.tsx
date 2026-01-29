"use client";

/**
 * AlertsList Component
 * Shows payment alerts and reminders
 */

import { AlertCircle, Send } from "lucide-react";
import type { AlertItem } from "../types";

interface AlertsListProps {
  alerts: AlertItem[];
}

export function AlertsList({ alerts }: AlertsListProps) {
  return (
    <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-2 sm:gap-2.5 mb-4 sm:mb-6">
        <div className="p-1.5 sm:p-2 bg-orange-50 rounded-lg">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" strokeWidth={2.5} />
        </div>
        <h3 className="font-bold text-sm sm:text-base text-primary">Alertas de Cobro</h3>
      </div>

      <div className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto max-h-60 sm:max-h-none">
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Sin alertas pendientes</p>
        ) : (
          alerts.map((alert, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 sm:p-4 border border-gray-100 rounded-lg sm:rounded-xl hover:border-primary/20 hover:bg-gray-50 transition-all group"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div
                  className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 ${alert.type === "overdue"
                      ? "bg-red-500 animate-pulse shadow-lg shadow-red-200"
                      : "bg-orange-500"
                    }`}
                />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-primary truncate">{alert.name}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-semibold">
                    {alert.date} • {alert.amount}
                  </p>
                </div>
              </div>
              <button className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 sm:p-2 text-primary hover:bg-primary/10 rounded-lg transition-all flex-shrink-0">
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
              </button>
            </div>
          ))
        )}
      </div>

      <button className="mt-4 sm:mt-6 w-full py-2.5 sm:py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl transition-all border border-gray-200">
        Ver todos los compromisos
      </button>
    </div>
  );
}

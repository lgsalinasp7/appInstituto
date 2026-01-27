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
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-instituto flex flex-col h-full">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="p-2 bg-orange-50 rounded-lg">
          <AlertCircle size={20} className="text-orange-600" strokeWidth={2.5} />
        </div>
        <h3 className="font-bold text-primary">Alertas de Cobro</h3>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {alerts.map((alert, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-primary/20 hover:bg-gray-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-2.5 h-2.5 rounded-full ${alert.type === "overdue"
                    ? "bg-red-500 animate-pulse shadow-lg shadow-red-200"
                    : "bg-orange-500"
                  }`}
              />
              <div>
                <p className="text-sm font-bold text-primary">{alert.name}</p>
                <p className="text-xs text-gray-500 font-semibold">
                  {alert.date} • {alert.amount}
                </p>
              </div>
            </div>
            <button className="opacity-0 group-hover:opacity-100 p-2 text-primary hover:bg-primary/10 rounded-lg transition-all">
              <Send size={14} strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>

      <button className="mt-6 w-full py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-500 text-sm font-bold rounded-xl transition-all border border-gray-200">
        Ver todos los compromisos
      </button>
    </div>
  );
}

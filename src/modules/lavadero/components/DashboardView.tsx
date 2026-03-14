"use client";

import { useEffect, useState } from "react";
import { DollarSign, ClipboardList, TrendingUp, BarChart3 } from "lucide-react";
import { tenantFetch } from "@/lib/tenant-fetch";
import type { LavaderoDashboardMetrics } from "../types";
import { cn } from "@/lib/utils";

interface DashboardViewProps {
  readOnly?: boolean;
}

export function DashboardView({ readOnly }: DashboardViewProps) {
  const [metrics, setMetrics] = useState<LavaderoDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const res = await tenantFetch("/api/lavadero/dashboard");
      const json = await res.json();
      if (json.success) setMetrics(json.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border p-5 animate-pulse">
              <div className="h-4 w-24 bg-slate-200 rounded mb-2" />
              <div className="h-8 w-32 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No se pudieron cargar las métricas</p>
      </div>
    );
  }

  const fmt = (n: number) => `$${n.toLocaleString("es-CO")}`;

  const cards = [
    { label: "Ingresos Hoy", value: fmt(metrics.todayRevenue), icon: DollarSign, color: "text-green-600 bg-green-50" },
    { label: "Ingresos Semana", value: fmt(metrics.weekRevenue), icon: TrendingUp, color: "text-cyan-600 bg-cyan-50" },
    { label: "Ingresos Mes", value: fmt(metrics.monthRevenue), icon: BarChart3, color: "text-blue-600 bg-blue-50" },
    { label: "Órdenes Pendientes", value: String(metrics.pendingOrders), icon: ClipboardList, color: "text-orange-600 bg-orange-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard {readOnly && <span className="text-sm text-slate-400 font-normal">(Solo lectura)</span>}
        </h1>
        <p className="text-sm text-slate-500">{metrics.todayOrders} órdenes hoy</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">{card.label}</span>
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", card.color)}>
                <card.icon size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Service Popularity & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Servicios Populares (Mes)</h3>
          {metrics.servicePopularity.length === 0 ? (
            <p className="text-sm text-slate-400">Sin datos aún</p>
          ) : (
            <div className="space-y-3">
              {metrics.servicePopularity.map((s, i) => {
                const maxCount = metrics.servicePopularity[0]?.count || 1;
                const pct = (s.count / maxCount) * 100;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700">{s.name}</span>
                      <span className="font-semibold text-slate-900">{s.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Métodos de Pago (Mes)</h3>
          {metrics.paymentBreakdown.length === 0 ? (
            <p className="text-sm text-slate-400">Sin datos aún</p>
          ) : (
            <div className="space-y-3">
              {metrics.paymentBreakdown.map((p) => {
                const methodLabels: Record<string, string> = {
                  CASH: "Efectivo",
                  NEQUI: "Nequi",
                  CARD: "Tarjeta",
                };
                return (
                  <div key={p.method} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">
                      {methodLabels[p.method] || p.method}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{fmt(p.total)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { DollarSign, Calendar, RefreshCw } from "lucide-react";
import { tenantFetch } from "@/lib/tenant-fetch";
import type { LavaderoDailySummary } from "../types";
import { cn } from "@/lib/utils";

interface PaymentItem {
  id: string;
  method: string;
  amount: number;
  createdAt: string;
  order: {
    id: string;
    total: number;
    customer: { name: string };
    vehicle: { plate: string };
  };
  creator: { name: string | null };
}

const METHOD_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  NEQUI: "Nequi",
  CARD: "Tarjeta",
};

export function BillingView() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [summary, setSummary] = useState<LavaderoDailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [paymentsRes, summaryRes] = await Promise.all([
        tenantFetch(`/api/lavadero/payments?dateFrom=${date}T00:00:00&dateTo=${date}T23:59:59`),
        tenantFetch(`/api/lavadero/dashboard/daily-summary?date=${date}`),
      ]);
      const paymentsJson = await paymentsRes.json();
      const summaryJson = await summaryRes.json();

      if (paymentsJson.success) {
        setPayments(
          paymentsJson.data.payments.map((p: { id: string; method: string; amount: unknown; createdAt: string; order: PaymentItem["order"]; creator: PaymentItem["creator"] }) => ({
            ...p,
            amount: Number(p.amount),
          }))
        );
      }
      if (summaryJson.success) setSummary(summaryJson.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const fmt = (n: number) => `$${n.toLocaleString("es-CO")}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Facturación</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Calendar size={16} className="text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:border-cyan-500 outline-none"
            />
          </div>
          <button onClick={loadData} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Daily Summary */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-slate-500 mb-1">Total Recaudado</p>
            <p className="text-2xl font-bold text-green-600">{fmt(summary.totalRevenue)}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-slate-500 mb-1">Pagos Registrados</p>
            <p className="text-2xl font-bold text-slate-900">{summary.totalOrders}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-slate-500 mb-1">Desglose</p>
            <div className="space-y-1 mt-1">
              {summary.paymentBreakdown.map((b) => (
                <div key={b.method} className="flex justify-between text-sm">
                  <span className="text-slate-600">{METHOD_LABELS[b.method] || b.method} ({b.count})</span>
                  <span className="font-semibold">{fmt(b.total)}</span>
                </div>
              ))}
              {summary.paymentBreakdown.length === 0 && (
                <p className="text-xs text-slate-400">Sin pagos este día</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payments List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700">Pagos del día</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-2 text-slate-600 font-semibold">Hora</th>
              <th className="text-left px-4 py-2 text-slate-600 font-semibold">Cliente</th>
              <th className="text-left px-4 py-2 text-slate-600 font-semibold hidden sm:table-cell">Placa</th>
              <th className="text-left px-4 py-2 text-slate-600 font-semibold">Método</th>
              <th className="text-right px-4 py-2 text-slate-600 font-semibold">Monto</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">Cargando...</td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No hay pagos para este día</td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-600">
                    {new Date(p.createdAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-2 font-medium text-slate-900">{p.order.customer.name}</td>
                  <td className="px-4 py-2 text-slate-600 hidden sm:table-cell">{p.order.vehicle.plate}</td>
                  <td className="px-4 py-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      p.method === "CASH" ? "bg-green-100 text-green-700" :
                      p.method === "NEQUI" ? "bg-purple-100 text-purple-700" :
                      "bg-blue-100 text-blue-700"
                    )}>
                      {METHOD_LABELS[p.method] || p.method}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right font-bold text-slate-900">{fmt(p.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

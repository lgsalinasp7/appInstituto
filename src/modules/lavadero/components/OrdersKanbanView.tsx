"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { tenantFetch } from "@/lib/tenant-fetch";
import { OrderDetailModal } from "./OrderDetailModal";
import { NewOrderForm } from "./NewOrderForm";
import { WhatsAppButton } from "./WhatsAppButton";
import { generateReadyMessage } from "../utils/whatsapp";
import type { LavaderoOrderWithDetails } from "../types";
import { cn } from "@/lib/utils";

interface OrdersKanbanViewProps {
  readOnly?: boolean;
}

const COLUMNS = [
  { key: "RECEIVED", label: "Recibido", color: "border-blue-400 bg-blue-50" },
  { key: "WASHING", label: "Lavando", color: "border-yellow-400 bg-yellow-50" },
  { key: "READY", label: "Listo", color: "border-green-400 bg-green-50" },
  { key: "DELIVERED", label: "Entregado", color: "border-slate-400 bg-slate-50" },
] as const;

const NEXT_STATUS: Record<string, string> = {
  RECEIVED: "WASHING",
  WASHING: "READY",
  READY: "DELIVERED",
};

export function OrdersKanbanView({ readOnly }: OrdersKanbanViewProps) {
  const [orders, setOrders] = useState<LavaderoOrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<LavaderoOrderWithDetails | null>(null);
  const [showNewOrder, setShowNewOrder] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const res = await tenantFetch("/api/lavadero/orders?limit=200");
      const json = await res.json();
      if (json.success) setOrders(json.data.orders);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const moveOrder = async (orderId: string, newStatus: string) => {
    try {
      const res = await tenantFetch(`/api/lavadero/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as LavaderoOrderWithDetails["status"] } : o))
        );
      }
    } catch {
      // silently fail
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Órdenes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <div key={col.key} className="bg-white rounded-xl border p-4 min-h-[300px] animate-pulse">
              <div className="h-5 w-20 bg-slate-200 rounded mb-4" />
              <div className="h-24 bg-slate-100 rounded mb-2" />
              <div className="h-24 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          Órdenes {readOnly && <span className="text-sm text-slate-400 font-normal">(Supervisor)</span>}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setLoading(true); loadOrders(); }}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={16} />
          </button>
          {!readOnly && (
            <button
              onClick={() => setShowNewOrder(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors"
            >
              <Plus size={16} /> Nueva Orden
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const columnOrders = orders.filter((o) => o.status === col.key);
          return (
            <div key={col.key} className="flex flex-col">
              <div className={cn("rounded-t-xl border-t-4 px-3 py-2", col.color)}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">{col.label}</span>
                  <span className="text-xs font-semibold text-slate-500 bg-white px-1.5 py-0.5 rounded-full">
                    {columnOrders.length}
                  </span>
                </div>
              </div>
              <div className="flex-1 bg-white border border-t-0 rounded-b-xl p-2 space-y-2 min-h-[200px]">
                {columnOrders.map((order) => {
                  const total = Number(order.total);
                  const services = order.orderServices.map((os) => os.service.name);
                  const nextStatus = NEXT_STATUS[order.status];

                  return (
                    <div
                      key={order.id}
                      className="bg-slate-50 rounded-lg p-3 cursor-pointer hover:bg-slate-100 transition-colors border border-slate-100"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-slate-900">{order.vehicle.plate}</span>
                        <span className="text-xs text-slate-500">
                          #{order.id.slice(-4)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-1">{order.customer.name}</p>
                      <p className="text-xs text-slate-400 mb-2 truncate">{services.join(", ")}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-cyan-700">${total.toLocaleString("es-CO")}</span>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          {col.key === "READY" && (
                            <WhatsAppButton
                              phone={order.customer.phone}
                              message={generateReadyMessage(order.customer.name, order.vehicle.plate, services, total)}
                              size="sm"
                              label=""
                            />
                          )}
                          {nextStatus && !readOnly && (
                            <button
                              onClick={() => moveOrder(order.id, nextStatus)}
                              className="px-2 py-1 rounded text-xs font-medium bg-cyan-600 text-white hover:bg-cyan-700 transition-colors"
                            >
                              Avanzar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {columnOrders.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-8">Sin órdenes</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdated={() => {
            setSelectedOrder(null);
            loadOrders();
          }}
        />
      )}

      {showNewOrder && (
        <NewOrderForm
          onClose={() => setShowNewOrder(false)}
          onCreated={() => {
            setShowNewOrder(false);
            loadOrders();
          }}
        />
      )}
    </div>
  );
}

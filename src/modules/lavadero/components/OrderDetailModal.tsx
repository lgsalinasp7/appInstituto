"use client";

import { useState } from "react";
import { X, Car, User, Wrench, DollarSign } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";
import { PaymentModal } from "./PaymentModal";
import { generateReadyMessage } from "../utils/whatsapp";
import { cn } from "@/lib/utils";
import type { LavaderoOrderWithDetails } from "../types";

interface OrderDetailModalProps {
  order: LavaderoOrderWithDetails;
  onClose: () => void;
  onUpdated: () => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  RECEIVED: { label: "Recibido", color: "bg-blue-100 text-blue-700" },
  WASHING: { label: "Lavando", color: "bg-yellow-100 text-yellow-700" },
  READY: { label: "Listo", color: "bg-green-100 text-green-700" },
  DELIVERED: { label: "Entregado", color: "bg-slate-100 text-slate-700" },
};

export function OrderDetailModal({ order, onClose, onUpdated }: OrderDetailModalProps) {
  const [showPayment, setShowPayment] = useState(false);
  const totalPaid = order.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const total = Number(order.total);
  const isPaid = totalPaid >= total;
  const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.RECEIVED;

  const services = order.orderServices.map((os) => os.service.name);
  const waMessage = generateReadyMessage(order.customer.name, order.vehicle.plate, services, total);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-900">Orden #{order.id.slice(-6)}</h3>
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", statusInfo.color)}>
                {statusInfo.label}
              </span>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100">
              <X size={20} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Vehicle */}
            <div className="flex items-start gap-3">
              <Car size={18} className="text-cyan-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {order.vehicle.plate} - {order.vehicle.brand || order.vehicle.type}
                </p>
                {order.vehicle.color && (
                  <p className="text-xs text-slate-500">Color: {order.vehicle.color}</p>
                )}
              </div>
            </div>

            {/* Customer */}
            <div className="flex items-start gap-3">
              <User size={18} className="text-cyan-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{order.customer.name}</p>
                <p className="text-xs text-slate-500">{order.customer.phone}</p>
              </div>
            </div>

            {/* Services */}
            <div className="flex items-start gap-3">
              <Wrench size={18} className="text-cyan-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 mb-1">Servicios</p>
                {order.orderServices.map((os) => (
                  <div key={os.id} className="flex justify-between text-sm">
                    <span className="text-slate-600">{os.service.name}</span>
                    <span className="font-medium">${Number(os.priceAtTime).toLocaleString("es-CO")}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold border-t mt-2 pt-2">
                  <span>Total</span>
                  <span>${total.toLocaleString("es-CO")}</span>
                </div>
              </div>
            </div>

            {/* Payment status */}
            <div className="flex items-start gap-3">
              <DollarSign size={18} className="text-cyan-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Pagado</span>
                  <span className={cn("font-semibold", isPaid ? "text-green-600" : "text-orange-600")}>
                    ${totalPaid.toLocaleString("es-CO")}
                  </span>
                </div>
                {!isPaid && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Pendiente</span>
                    <span className="font-semibold text-red-600">
                      ${(total - totalPaid).toLocaleString("es-CO")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {order.notes && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Notas</p>
                <p className="text-sm text-slate-700">{order.notes}</p>
              </div>
            )}

            <p className="text-xs text-slate-400">
              Creado por {order.creator.name || "—"} el{" "}
              {new Date(order.createdAt).toLocaleDateString("es-CO", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
              {(order.status === "READY" || order.status === "DELIVERED") && (
                <WhatsAppButton phone={order.customer.phone} message={waMessage} size="sm" />
              )}
              {!isPaid && order.status !== "DELIVERED" && (
                <button
                  onClick={() => setShowPayment(true)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-medium hover:bg-cyan-700 transition-colors"
                >
                  Registrar Pago
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          orderId={order.id}
          total={total}
          paid={totalPaid}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            onUpdated();
          }}
        />
      )}
    </>
  );
}

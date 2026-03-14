"use client";

import { useState } from "react";
import { X, DollarSign } from "lucide-react";
import { tenantFetch } from "@/lib/tenant-fetch";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
  orderId: string;
  total: number;
  paid: number;
  onClose: () => void;
  onSuccess: () => void;
}

const PAYMENT_METHODS = [
  { value: "CASH", label: "Efectivo" },
  { value: "NEQUI", label: "Nequi" },
  { value: "CARD", label: "Tarjeta" },
] as const;

export function PaymentModal({ orderId, total, paid, onClose, onSuccess }: PaymentModalProps) {
  const remaining = total - paid;
  const [method, setMethod] = useState<string>("CASH");
  const [amount, setAmount] = useState(remaining);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > remaining) {
      setError(`El monto debe estar entre $1 y $${remaining.toLocaleString("es-CO")}`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await tenantFetch("/api/lavadero/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, method, amount }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Error al registrar pago");
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold text-slate-900">Registrar Pago</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Total orden:</span>
            <span className="font-semibold">${total.toLocaleString("es-CO")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Pagado:</span>
            <span className="font-semibold text-green-600">${paid.toLocaleString("es-CO")}</span>
          </div>
          <div className="flex justify-between text-sm border-t pt-2">
            <span className="text-slate-500">Pendiente:</span>
            <span className="font-bold text-cyan-700">${remaining.toLocaleString("es-CO")}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Método de pago</label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMethod(m.value)}
                  className={cn(
                    "py-2 rounded-lg text-sm font-medium border transition-colors",
                    method === m.value
                      ? "bg-cyan-600 text-white border-cyan-600"
                      : "bg-white text-slate-700 border-slate-200 hover:border-cyan-300"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto</label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={1}
                max={remaining}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-cyan-600 text-white font-semibold hover:bg-cyan-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Registrando..." : "Confirmar Pago"}
          </button>
        </form>
      </div>
    </div>
  );
}

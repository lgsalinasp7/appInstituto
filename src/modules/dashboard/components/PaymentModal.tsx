"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { z } from "zod";
import { sendReceiptViaWhatsApp } from "../utils/whatsapp";

const paymentSchema = z.object({
  amount: z.number().positive("El monto debe ser mayor a 0"),
  method: z.enum(["BANCOLOMBIA", "NEQUI", "DAVIPLATA", "EFECTIVO", "OTRO"]),
  reference: z.string().optional(),
  comments: z.string().optional(),
});

type PaymentFormData = {
  amount: number;
  method: "BANCOLOMBIA" | "NEQUI" | "DAVIPLATA" | "EFECTIVO" | "OTRO";
  reference?: string;
  comments?: string;
};

interface Student {
  id: string;
  fullName?: string;
  name?: string;
  phone?: string;
  document?: string;
  program?: string;
  remainingBalance: number;
  totalProgramValue?: number;
  totalValue?: number;
  totalPaid?: number;
  paidAmount?: number;
}

interface PaymentModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentUserId: string;
}

export function PaymentModal({ student, isOpen, onClose, onSuccess, currentUserId }: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    receiptNumber: string;
    newBalance: number;
    amount: number;
    method: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      method: "BANCOLOMBIA",
    },
  });

  const watchAmount = watch("amount");

  if (!isOpen) return null;

  const studentName = student.fullName || student.name || "Estudiante";
  const balance = student.remainingBalance || 0;
  const totalValue = student.totalProgramValue || student.totalValue || 0;
  const totalPaid = student.totalPaid || student.paidAmount || 0;

  const newBalancePreview = watchAmount ? Math.max(0, balance - watchAmount) : balance;

  const onSubmit = async (data: PaymentFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          paymentDate: new Date(),
          studentId: student.id,
          registeredById: currentUserId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al registrar el pago");
      }

      setSuccessData({
        receiptNumber: result.data.payment.receiptNumber,
        newBalance: result.data.studentBalance.remainingBalance,
        amount: data.amount,
        method: data.method,
      });

      reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessData(null);
    setError(null);
    reset();
    onClose();
  };

  if (successData) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Pago Registrado</h2>
            <p className="text-green-100">El pago se ha procesado exitosamente</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Número de Recibo</span>
                <span className="font-bold text-primary">{successData.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estudiante</span>
                <span className="font-bold text-primary">{studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nuevo Saldo</span>
                <span className="font-bold text-green-600">${successData.newBalance.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <Send size={18} className="text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-blue-900">Recibo Generado</p>
                  <p className="text-xs text-blue-700 mt-1">
                    El recibo digital está listo para enviar al estudiante por WhatsApp o correo.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3.5 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-all"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  sendReceiptViaWhatsApp(
                    student.phone || "",
                    {
                      receiptNumber: successData.receiptNumber,
                      studentName: studentName,
                      studentDocument: student.document,
                      amount: successData.amount,
                      paymentDate: new Date().toISOString(),
                      method: successData.method,
                      newBalance: successData.newBalance,
                      programName: student.program,
                    }
                  );
                }}
                className="flex-1 py-3.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Enviar WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-200">
        <div className="bg-gradient-instituto p-8 text-white relative">
          <button
            onClick={handleClose}
            className="absolute right-6 top-6 text-white/70 hover:text-white transition-colors hover:rotate-90 duration-200"
          >
            <X size={26} strokeWidth={2.5} />
          </button>
          <h2 className="text-2xl font-bold mb-2">Registrar Nuevo Pago</h2>
          <p className="text-blue-100 text-sm font-medium">
            Estudiante:{" "}
            <span className="font-bold text-white">{studentName}</span>
          </p>
          <div className="mt-5 inline-flex items-center gap-2.5 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold border border-white/20">
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse shadow-lg shadow-orange-300" />
            Saldo Actual: ${balance.toLocaleString()}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Monto del Pago *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">
                  $
                </span>
                <input
                  {...register("amount")}
                  type="number"
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-primary transition-all"
                />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-xs">{errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Método de Pago *
              </label>
              <select
                {...register("method")}
                className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none font-bold text-primary cursor-pointer transition-all"
              >
                <option value="BANCOLOMBIA">Bancolombia</option>
                <option value="NEQUI">Nequi</option>
                <option value="DAVIPLATA">Daviplata</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Referencia de Pago / Comprobante
            </label>
            <input
              {...register("reference")}
              type="text"
              placeholder="Ej: REF-123456"
              className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Comentarios
            </label>
            <textarea
              {...register("comments")}
              rows={2}
              placeholder="Notas adicionales del pago..."
              className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none font-medium transition-all"
            />
          </div>

          {watchAmount > 0 && (
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-5 rounded-2xl border border-primary/10">
              <h4 className="text-sm font-bold text-primary mb-3">Vista Previa</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Programa</p>
                  <p className="font-bold text-primary">${totalValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ya Pagado</p>
                  <p className="font-bold text-green-600">${(totalPaid + (watchAmount || 0)).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Nuevo Saldo</p>
                  <p className="font-bold text-orange-600">${newBalancePreview.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-primary/5 p-5 rounded-2xl flex items-start gap-3 border border-primary/10">
            <div className="mt-0.5 p-2 bg-primary rounded-lg shadow-md">
              <CheckCircle2 size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-primary">
                Acciones Automáticas
              </p>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                Al guardar se generará automáticamente el <strong>Recibo Digital</strong> con
                número de consecutivo único y se actualizará el saldo del estudiante.
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-all border-2 border-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-200 hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? "Procesando..." : "Confirmar & Generar Recibo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

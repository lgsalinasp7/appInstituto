"use client";

import { useState } from "react";
import { X, CheckCircle, Download, Send, Calendar, CreditCard } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { ReceiptPDF, type ReceiptPDFData } from "@/modules/receipts/components/ReceiptPDF";
import { toast } from "sonner";

interface ReceiptConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    student: {
      id: string;
      fullName: string;
      documentType: string;
      documentNumber: string;
      phone: string;
      email?: string | null;
    };
    payment: {
      id: string;
      amount: number;
      paymentDate: Date;
      method: string;
      reference: string | null;
      paymentType: string;
      receiptNumber: string;
    };
    commitment: {
      amount: number;
      scheduledDate: Date;
      moduleNumber: number;
    };
    program: {
      name: string;
      totalValue: number;
      matriculaValue: number;
      modulesCount: number;
    };
    registeredBy: {
      name: string;
    };
  } | null;
}

export function ReceiptConfirmationModal({ isOpen, onClose, data }: ReceiptConfirmationModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  if (!isOpen || !data) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const formatMethod = (method: string) => {
    const methods: Record<string, string> = {
      EFECTIVO: "Efectivo",
      NEQUI: "Nequi",
      BANCOLOMBIA: "Bancolombia",
      DAVIPLATA: "Daviplata",
      TRANSFERENCIA: "Transferencia",
    };
    return methods[method] || method;
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const receiptData: ReceiptPDFData = {
        receiptNumber: data.payment.receiptNumber,
        generatedAt: new Date(),
        student: {
          fullName: data.student.fullName,
          documentNumber: `${data.student.documentType} ${data.student.documentNumber}`,
          phone: data.student.phone,
          email: data.student.email,
        },
        program: {
          name: data.program.name,
        },
        payment: {
          amount: data.payment.amount,
          paymentDate: new Date(data.payment.paymentDate),
          method: data.payment.method,
          reference: data.payment.reference,
          paymentType: data.payment.paymentType,
          moduleNumber: null,
        },
        registeredBy: {
          name: data.registeredBy.name,
        },
        balanceAfter: data.program.totalValue - data.payment.amount,
      };

      const blob = await pdf(<ReceiptPDF data={receiptData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Recibo-${data.payment.receiptNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Recibo descargado exitosamente");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Error al generar el PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendWhatsApp = async () => {
    setIsSendingWhatsApp(true);
    try {
      // Formatear el mensaje para WhatsApp
      const message = encodeURIComponent(
        `*RECIBO DE PAGO - MATRÍCULA*\n\n` +
        `Recibo No: ${data.payment.receiptNumber}\n` +
        `Fecha: ${formatDate(data.payment.paymentDate)}\n\n` +
        `*Estudiante:* ${data.student.fullName}\n` +
        `*Documento:* ${data.student.documentType} ${data.student.documentNumber}\n` +
        `*Programa:* ${data.program.name}\n\n` +
        `*Concepto:* Pago de Matrícula\n` +
        `*Método:* ${formatMethod(data.payment.method)}\n` +
        `*TOTAL PAGADO:* ${formatCurrency(data.payment.amount)}\n\n` +
        `*Próximo pago:*\n` +
        `Módulo ${data.commitment.moduleNumber}: ${formatCurrency(data.commitment.amount)}\n` +
        `Fecha límite: ${formatDate(data.commitment.scheduledDate)}\n\n` +
        `_Instituto - Formación Técnica Profesional_`
      );

      // Limpiar el número de teléfono (solo números)
      const phone = data.student.phone.replace(/\D/g, "");
      // Agregar código de país si no lo tiene
      const phoneWithCode = phone.startsWith("57") ? phone : `57${phone}`;

      // Abrir WhatsApp
      window.open(`https://wa.me/${phoneWithCode}?text=${message}`, "_blank");

      toast.success("WhatsApp abierto exitosamente");
    } catch (error) {
      console.error("Error sending WhatsApp:", error);
      toast.error("Error al abrir WhatsApp");
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg my-8 overflow-hidden border border-gray-200">
        {/* Header con icono de éxito */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold">¡Matrícula Exitosa!</h2>
          <p className="text-emerald-100 text-sm mt-1">El pago ha sido registrado correctamente</p>
        </div>

        {/* Contenido del recibo */}
        <div className="p-6 space-y-4">
          {/* Número de recibo */}
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Recibo No.</p>
            <p className="text-xl font-bold text-primary">{data.payment.receiptNumber}</p>
            <p className="text-xs text-gray-400">{formatDate(data.payment.paymentDate)}</p>
          </div>

          {/* Datos del estudiante */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Estudiante:</span>
              <span className="font-bold text-primary">{data.student.fullName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Documento:</span>
              <span className="font-medium">{data.student.documentType} {data.student.documentNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Programa:</span>
              <span className="font-medium">{data.program.name}</span>
            </div>
          </div>

          {/* Detalles del pago */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Concepto:</span>
              <span className="font-bold text-emerald-700">Pago de Matrícula</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Método:</span>
              <span className="font-medium flex items-center gap-1">
                <CreditCard size={14} />
                {formatMethod(data.payment.method)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-emerald-200">
              <span className="text-sm font-bold">TOTAL PAGADO:</span>
              <span className="text-xl font-bold text-emerald-600">
                {formatCurrency(data.payment.amount)}
              </span>
            </div>
          </div>

          {/* Próximo pago */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-blue-600" />
              <span className="text-sm font-bold text-blue-700">Próximo Pago</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Módulo {data.commitment.moduleNumber}:</span>
              <span className="font-bold">{formatCurrency(data.commitment.amount)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">Fecha límite:</span>
              <span className="font-medium text-blue-600">{formatDate(data.commitment.scheduledDate)}</span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="p-6 pt-0 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              <Download size={18} />
              {isDownloading ? "Generando..." : "Descargar PDF"}
            </button>
            <button
              onClick={handleSendWhatsApp}
              disabled={isSendingWhatsApp}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-50"
            >
              <Send size={18} />
              {isSendingWhatsApp ? "Abriendo..." : "WhatsApp"}
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
}

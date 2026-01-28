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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
      {/* Reduced max-h to 80vh to strictly prevent top cutoff on small screens */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Header con icono de éxito - More compacted */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 px-4 text-white text-center relative shrink-0">
          <button
            onClick={onClose}
            className="absolute right-3 top-2.5 text-white/70 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-1">
            <CheckCircle size={20} className="text-white" />
          </div>
          <h2 className="text-base font-bold leading-tight">¡Matrícula Exitosa!</h2>
          <p className="text-emerald-100 text-[10px] mt-0.5">Recaudo exitoso</p>
        </div>

        {/* Contenido del recibo - Scrollable */}
        <div className="p-3 space-y-2 overflow-y-auto custom-scrollbar flex-1">
          {/* Número de recibo */}
          <div className="text-center p-1.5 bg-gray-50 rounded-lg">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider leading-none mb-0.5">Recibo No.</p>
            <p className="text-base font-bold text-primary leading-tight">{data.payment.receiptNumber}</p>
            <p className="text-[10px] text-gray-400 leading-none mt-0.5">{formatDate(data.payment.paymentDate)}</p>
          </div>

          {/* Datos del estudiante */}
          <div className="space-y-1 text-xs border-y border-gray-100 py-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Estudiante:</span>
              <span className="font-bold text-primary text-right max-w-[170px] truncate">{data.student.fullName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Documento:</span>
              <span className="font-medium text-gray-700">{data.student.documentType} {data.student.documentNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Programa:</span>
              <span className="font-medium text-gray-700 text-right truncate max-w-[170px]">{data.program.name}</span>
            </div>
          </div>

          {/* Detalles del pago */}
          <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-gray-600">Concepto:</span>
              <span className="font-bold text-[10px] text-emerald-700">Pago de Matrícula</span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-gray-600">Método:</span>
              <span className="font-medium text-[10px] flex items-center gap-1">
                <CreditCard size={10} />
                {formatMethod(data.payment.method)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-emerald-200">
              <span className="text-xs font-bold">TOTAL:</span>
              <span className="text-base font-bold text-emerald-600">
                {formatCurrency(data.payment.amount)}
              </span>
            </div>
          </div>

          {/* Próximo pago */}
          <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar size={12} className="text-blue-600" />
              <span className="text-[10px] font-bold text-blue-700">Próximo Pago</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-600">Módulo {data.commitment.moduleNumber}:</span>
              <span className="font-bold">{formatCurrency(data.commitment.amount)}</span>
            </div>
            <div className="flex justify-between text-[10px] mt-0.5">
              <span className="text-gray-600">Fecha límite:</span>
              <span className="font-medium text-blue-600">{formatDate(data.commitment.scheduledDate)}</span>
            </div>
          </div>
        </div>

        {/* Botones de acción - Fixed at bottom */}
        <div className="p-3 pt-0 shrink-0 space-y-2 bg-white">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-all disabled:opacity-50 text-xs h-8"
            >
              <Download size={14} />
              {isDownloading ? "..." : "PDF"}
            </button>
            <button
              onClick={handleSendWhatsApp}
              disabled={isSendingWhatsApp}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all disabled:opacity-50 text-xs h-8"
            >
              <Send size={14} />
              {isSendingWhatsApp ? "..." : "WhatsApp"}
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all text-xs h-8"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

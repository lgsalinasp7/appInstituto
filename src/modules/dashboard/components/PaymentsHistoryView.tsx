"use client";

import { useState, useMemo } from "react";
import { CreditCard, Search, Download, Calendar, Send, Eye, Edit2, X, Printer, AlertCircle, CheckCircle2 } from "lucide-react";
import { Pagination } from "./Pagination";
import { DEMO_PAYMENTS, DEMO_METHOD_STATS } from "../data/demo-data";
import { sendReceiptViaWhatsApp } from "../utils/whatsapp";

interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  method: string;
  reference: string | null;
  receiptNumber: string;
  comments?: string | null;
  student: {
    id: string;
    fullName: string;
    documentNumber: string;
    phone?: string;
    programName?: string;
  };
  registeredBy: {
    name: string | null;
    email: string;
  };
}

interface PaymentsHistoryViewProps {
  advisorId?: string;
}

export function PaymentsHistoryView({ advisorId }: PaymentsHistoryViewProps) {
  const [payments] = useState<Payment[]>(DEMO_PAYMENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        payment.student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.student.documentNumber.includes(searchTerm);

      const matchesMethod = methodFilter === "all" || payment.method === methodFilter;

      let matchesDate = true;
      if (dateFilter !== "all") {
        const paymentDate = new Date(payment.paymentDate);
        const now = new Date();
        
        switch (dateFilter) {
          case "today":
            matchesDate = paymentDate.toDateString() === now.toDateString();
            break;
          case "week":
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            matchesDate = paymentDate >= weekAgo;
            break;
          case "month":
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            matchesDate = paymentDate >= monthAgo;
            break;
        }
      }

      return matchesSearch && matchesMethod && matchesDate;
    });
  }, [payments, searchTerm, methodFilter, dateFilter]);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalCollected = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowEditModal(true);
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      BANCOLOMBIA: "bg-yellow-100 text-yellow-800",
      NEQUI: "bg-purple-100 text-purple-800",
      DAVIPLATA: "bg-red-100 text-red-800",
      EFECTIVO: "bg-green-100 text-green-800",
      OTRO: "bg-gray-100 text-gray-800",
    };
    return colors[method] || colors.OTRO;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard size={24} />
            <span className="text-sm font-medium opacity-90">Total Recaudado</span>
          </div>
          <p className="text-3xl font-bold">${totalCollected.toLocaleString()}</p>
          <p className="text-sm opacity-75 mt-1">{filteredPayments.length} pagos</p>
        </div>

        {DEMO_METHOD_STATS.slice(0, 3).map((stat) => (
          <div key={stat.method} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getMethodColor(stat.method)}`}>
                {stat.method}
              </span>
              <span className="text-sm text-gray-500">{stat.percentage}%</span>
            </div>
            <p className="text-xl font-bold text-[#1e3a5f]">${stat.amount.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{stat.count} transacciones</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por estudiante, recibo o documento..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value as typeof dateFilter); setCurrentPage(1); }}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            >
              <option value="all">Todo el tiempo</option>
              <option value="today">Hoy</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
            </select>
            <select
              value={methodFilter}
              onChange={(e) => { setMethodFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            >
              <option value="all">Todos los métodos</option>
              <option value="BANCOLOMBIA">Bancolombia</option>
              <option value="NEQUI">Nequi</option>
              <option value="DAVIPLATA">Daviplata</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="OTRO">Otro</option>
            </select>
            <button className="px-4 py-2.5 bg-[#1e3a5f] text-white rounded-xl hover:bg-[#2d4a6f] transition-colors flex items-center gap-2">
              <Download size={18} />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#1e3a5f] flex items-center gap-2">
              <Calendar size={18} />
              Historial de Pagos
            </h3>
          </div>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Recibo</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Estudiante</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Monto</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Método</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Registrado por</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-[#1e3a5f]">
                      {payment.receiptNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-[#1e3a5f]">{payment.student.fullName}</p>
                      <p className="text-xs text-gray-500">Doc: {payment.student.documentNumber}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-emerald-600">${payment.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getMethodColor(payment.method)}`}>
                      {payment.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(payment.paymentDate).toLocaleDateString("es-CO")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {payment.registeredBy.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleViewDetails(payment)}
                        className="p-2 text-[#1e3a5f] hover:bg-[#1e3a5f]/10 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(payment)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => sendReceiptViaWhatsApp(
                          payment.student.phone || "",
                          {
                            receiptNumber: payment.receiptNumber,
                            studentName: payment.student.fullName,
                            studentDocument: payment.student.documentNumber,
                            amount: payment.amount,
                            paymentDate: payment.paymentDate,
                            method: payment.method,
                            reference: payment.reference,
                            programName: payment.student.programName,
                          }
                        )}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Enviar por WhatsApp"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden divide-y divide-gray-100">
          {paginatedPayments.map((payment) => (
            <div key={payment.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-[#1e3a5f]">{payment.student.fullName}</p>
                  <p className="text-xs text-gray-500 font-mono">{payment.receiptNumber}</p>
                </div>
                <span className="font-bold text-emerald-600">${payment.amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${getMethodColor(payment.method)}`}>
                    {payment.method}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(payment.paymentDate).toLocaleDateString("es-CO")}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleViewDetails(payment)} className="p-2 text-[#1e3a5f]">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => handleEdit(payment)} className="p-2 text-orange-600">
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => sendReceiptViaWhatsApp(
                      payment.student.phone || "",
                      {
                        receiptNumber: payment.receiptNumber,
                        studentName: payment.student.fullName,
                        studentDocument: payment.student.documentNumber,
                        amount: payment.amount,
                        paymentDate: payment.paymentDate,
                        method: payment.method,
                        reference: payment.reference,
                        programName: payment.student.programName,
                      }
                    )}
                    className="p-2 text-green-600"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredPayments.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      {showDetailsModal && selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => { setShowDetailsModal(false); setSelectedPayment(null); }}
          onEdit={() => { setShowDetailsModal(false); setShowEditModal(true); }}
        />
      )}

      {showEditModal && selectedPayment && (
        <EditPaymentModal
          payment={selectedPayment}
          onClose={() => { setShowEditModal(false); setSelectedPayment(null); }}
          onSave={() => { setShowEditModal(false); setSelectedPayment(null); }}
        />
      )}
    </div>
  );
}

function PaymentDetailsModal({
  payment,
  onClose,
  onEdit,
}: {
  payment: Payment;
  onClose: () => void;
  onEdit: () => void;
}) {
  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      BANCOLOMBIA: "bg-yellow-100 text-yellow-800",
      NEQUI: "bg-purple-100 text-purple-800",
      DAVIPLATA: "bg-red-100 text-red-800",
      EFECTIVO: "bg-green-100 text-green-800",
      OTRO: "bg-gray-100 text-gray-800",
    };
    return colors[method] || colors.OTRO;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <CreditCard size={28} />
            <h2 className="text-xl font-bold">Detalle del Recibo</h2>
          </div>
          <p className="text-2xl font-mono font-bold">{payment.receiptNumber}</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
            <p className="text-sm text-emerald-600 font-medium mb-1">Monto del Pago</p>
            <p className="text-3xl font-bold text-emerald-700">${payment.amount.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Estudiante</p>
              <p className="font-bold text-[#1e3a5f]">{payment.student.fullName}</p>
              <p className="text-sm text-gray-500">Doc: {payment.student.documentNumber}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Fecha de Pago</p>
              <p className="font-bold text-[#1e3a5f]">
                {new Date(payment.paymentDate).toLocaleDateString("es-CO", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Método de Pago</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getMethodColor(payment.method)}`}>
                {payment.method}
              </span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Referencia</p>
              <p className="font-bold text-[#1e3a5f]">{payment.reference || "N/A"}</p>
            </div>
          </div>

          {payment.comments && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Comentarios</p>
              <p className="text-gray-700">{payment.comments}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Registrado por</p>
            <p className="font-bold text-[#1e3a5f]">{payment.registeredBy.name}</p>
            <p className="text-sm text-gray-500">{payment.registeredBy.email}</p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex flex-wrap gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 bg-gray-100 text-[#1e3a5f] rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Printer size={18} />
            Imprimir
          </button>
          <button
            onClick={onEdit}
            className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            <Edit2 size={18} />
            Editar
          </button>
          <button
            onClick={() => sendReceiptViaWhatsApp(
              payment.student.phone || "",
              {
                receiptNumber: payment.receiptNumber,
                studentName: payment.student.fullName,
                studentDocument: payment.student.documentNumber,
                amount: payment.amount,
                paymentDate: payment.paymentDate,
                method: payment.method,
                reference: payment.reference,
                programName: payment.student.programName,
              }
            )}
            className="flex-1 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <Send size={18} />
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

function EditPaymentModal({
  payment,
  onClose,
  onSave,
}: {
  payment: Payment;
  onClose: () => void;
  onSave: () => void;
}) {
  const [reference, setReference] = useState(payment.reference || "");
  const [comments, setComments] = useState(payment.comments || "");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onSave();
    }, 800);
  };

  const handleCancel = () => {
    setShowCancelConfirm(false);
    onSave();
  };

  if (showCancelConfirm) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="bg-red-500 p-6 text-white text-center">
            <AlertCircle size={48} className="mx-auto mb-3" />
            <h2 className="text-xl font-bold">Anular Pago</h2>
          </div>
          <div className="p-6">
            <p className="text-center text-gray-700 mb-4">
              ¿Está seguro de anular el pago <strong>{payment.receiptNumber}</strong> por valor de{" "}
              <strong>${payment.amount.toLocaleString()}</strong>?
            </p>
            <p className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-xl">
              Esta acción no se puede deshacer. El saldo del estudiante será actualizado.
            </p>
          </div>
          <div className="p-6 border-t border-gray-100 flex gap-3">
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600"
            >
              Sí, Anular Pago
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-orange-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-3">
            <Edit2 size={28} />
            <div>
              <h2 className="text-xl font-bold">Editar Pago</h2>
              <p className="text-orange-100 font-mono">{payment.receiptNumber}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-[#1e3a5f]">{payment.student.fullName}</p>
                <p className="text-sm text-gray-500">{new Date(payment.paymentDate).toLocaleDateString("es-CO")}</p>
              </div>
              <p className="text-xl font-bold text-emerald-600">${payment.amount.toLocaleString()}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referencia de Pago</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ej: REF-123456"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              placeholder="Notas adicionales..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
            />
          </div>

          <button
            onClick={() => setShowCancelConfirm(true)}
            className="w-full py-2.5 border-2 border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <AlertCircle size={18} />
            Anular este pago
          </button>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

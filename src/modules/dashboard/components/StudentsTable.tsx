"use client";

import { useState, useMemo } from "react";
import { Calendar, CreditCard, MoreHorizontal, Filter, Search, Eye, X, Phone, Mail, MessageCircle, FileText, Clock } from "lucide-react";
import { Pagination } from "./Pagination";
import type { Student } from "../types";

interface StudentsTableProps {
  students: Student[];
  onPaymentClick: (student: Student) => void;
}

export function StudentsTable({ students, onPaymentClick }: StudentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.document.includes(searchTerm) ||
        s.program.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [students, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetail = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-instituto overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col lg:flex-row gap-3 lg:justify-between lg:items-center">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, documento o programa..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          <div className="text-sm text-[#64748b] font-semibold">
            Mostrando{" "}
            <span className="font-bold text-[#1e3a5f] text-base">
              {filteredStudents.length}
            </span>{" "}
            estudiantes
          </div>
        </div>
      </div>

      <div className="lg:hidden divide-y divide-gray-100">
        {paginatedStudents.map((student) => (
          <div
            key={student.id}
            className="p-4 hover:bg-[#f8fafc] transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-instituto text-white flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-[#1e3a5f]">{student.name}</p>
                  <p className="text-xs text-[#64748b] font-semibold">
                    Doc: {student.document}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleViewDetail(student)}
                className="p-2 text-[#1e3a5f] hover:bg-[#1e3a5f]/10 rounded-lg transition-colors"
              >
                <Eye size={18} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-[#1e3a5f]/10 text-[#1e3a5f]">
                {student.program}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-[#334155]">
                {student.advisor}
              </span>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-[#64748b] font-semibold">Saldo Pendiente</span>
                <span className="font-bold text-[#1e3a5f]">
                  ${student.remainingBalance.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-instituto rounded-full"
                  style={{
                    width: `${(student.paidAmount / student.totalValue) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-[#94a3b8]">
                  Pagado: ${student.paidAmount.toLocaleString()}
                </span>
                <span className="text-xs text-[#94a3b8]">
                  {Math.round((student.paidAmount / student.totalValue) * 100)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#64748b]">
                <Calendar size={14} />
                <span className="text-sm font-semibold">
                  Próximo: {student.nextPaymentDate}
                </span>
              </div>
              <button
                onClick={() => onPaymentClick(student)}
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-instituto text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <CreditCard size={16} />
                Pagar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider">
                Estudiante
              </th>
              <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider">
                Programa
              </th>
              <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider">
                Progreso de Pago
              </th>
              <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider">
                Saldo
              </th>
              <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider">
                Próximo Pago
              </th>
              <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider">
                Asesor
              </th>
              <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedStudents.map((student) => {
              const progressPercent = Math.round((student.paidAmount / student.totalValue) * 100);
              return (
                <tr
                  key={student.id}
                  className="hover:bg-[#f8fafc] transition-colors"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-instituto text-white flex items-center justify-center font-bold text-sm shadow-md">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#1e3a5f]">
                          {student.name}
                        </p>
                        <p className="text-xs text-[#64748b] font-semibold">
                          Doc: {student.document}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-[#334155] font-semibold">
                      {student.program}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-green-600 font-bold">${student.paidAmount.toLocaleString()}</span>
                        <span className="text-gray-500">{progressPercent}%</span>
                      </div>
                      <div className="w-28 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full shadow-sm ${
                            progressPercent >= 75 ? "bg-green-500" :
                            progressPercent >= 50 ? "bg-blue-500" :
                            progressPercent >= 25 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">de ${student.totalValue.toLocaleString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className={`text-sm font-bold ${student.remainingBalance > 0 ? "text-red-600" : "text-green-600"}`}>
                      ${student.remainingBalance.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#94a3b8]" />
                      <span className="text-sm text-[#334155] font-semibold">
                        {student.nextPaymentDate}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 text-[#334155] border border-gray-200">
                      {student.advisor}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewDetail(student)}
                        className="p-2.5 text-[#1e3a5f] hover:bg-[#1e3a5f]/10 rounded-xl transition-colors border border-transparent hover:border-[#1e3a5f]/20"
                        title="Ver Detalle"
                      >
                        <Eye size={18} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => onPaymentClick(student)}
                        className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border border-transparent hover:border-emerald-200"
                        title="Registrar Pago"
                      >
                        <CreditCard size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📋</span>
          </div>
          <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">
            No hay estudiantes
          </h3>
          <p className="text-sm text-[#64748b]">
            No se encontraron estudiantes con los filtros aplicados.
          </p>
        </div>
      ) : (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredStudents.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(items) => { setItemsPerPage(items); setCurrentPage(1); }}
        />
      )}

      {showDetailModal && selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => { setShowDetailModal(false); setSelectedStudent(null); }}
          onPaymentClick={() => {
            setShowDetailModal(false);
            onPaymentClick(selectedStudent);
          }}
        />
      )}
    </div>
  );
}

function StudentDetailModal({
  student,
  onClose,
  onPaymentClick,
}: {
  student: Student;
  onClose: () => void;
  onPaymentClick: () => void;
}) {
  const progressPercent = Math.round((student.paidAmount / student.totalValue) * 100);

  const paymentHistory = [
    { id: 1, date: "2025-01-15", amount: 350000, method: "BANCOLOMBIA", receipt: "REC-2025-00048" },
    { id: 2, date: "2024-12-15", amount: 350000, method: "NEQUI", receipt: "REC-2024-00125" },
    { id: 3, date: "2024-11-15", amount: 350000, method: "EFECTIVO", receipt: "REC-2024-00098" },
    { id: 4, date: "2024-10-15", amount: 350000, method: "BANCOLOMBIA", receipt: "REC-2024-00072" },
  ];

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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-instituto p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold">
              {student.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{student.name}</h2>
              <p className="text-blue-200">Doc: {student.document}</p>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Programa</p>
                <p className="font-bold text-[#1e3a5f]">{student.program}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Asesor</p>
                <p className="font-bold text-[#1e3a5f]">{student.advisor}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Fecha de Matrícula</p>
                <p className="font-bold text-[#1e3a5f]">{student.enrollmentDate}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Estado</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                  student.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {student.status === "active" ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#1e3a5f]/5 to-[#1e3a5f]/10 rounded-xl p-5 border border-[#1e3a5f]/10">
              <h3 className="text-sm font-bold text-[#1e3a5f] mb-4">Resumen Financiero</h3>
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Programa</p>
                  <p className="text-lg font-bold text-[#1e3a5f]">${student.totalValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Pagado</p>
                  <p className="text-lg font-bold text-green-600">${student.paidAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Saldo Pendiente</p>
                  <p className="text-lg font-bold text-red-600">${student.remainingBalance.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Progreso de pago</span>
                  <span className="font-bold text-[#1e3a5f]">{progressPercent}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      progressPercent >= 75 ? "bg-green-500" :
                      progressPercent >= 50 ? "bg-blue-500" :
                      progressPercent >= 25 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#1e3a5f] flex items-center gap-2">
                  <Clock size={16} />
                  Historial de Pagos
                </h3>
                <span className="text-xs text-gray-500">{paymentHistory.length} pagos</span>
              </div>
              <div className="space-y-2">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <CreditCard size={16} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-mono text-xs text-gray-500">{payment.receipt}</p>
                        <p className="text-xs text-gray-400">{new Date(payment.date).toLocaleDateString("es-CO")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">${payment.amount.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${getMethodColor(payment.method)}`}>
                        {payment.method}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {student.remainingBalance > 0 && (
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-orange-600" />
                  <div>
                    <p className="font-bold text-orange-900">Próximo Pago</p>
                    <p className="text-sm text-orange-700">{student.nextPaymentDate}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex flex-wrap gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
          <a
            href={`https://wa.me/57${(student.phone || "").replace(/\D/g, "")}?text=Hola%20${encodeURIComponent(student.name.split(" ")[0])}%2C%20le%20escribimos%20del%20Instituto%20de%20Formaci%C3%B3n%20T%C3%A9cnica.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} />
            WhatsApp
          </a>
          {student.remainingBalance > 0 && (
            <button
              onClick={onPaymentClick}
              className="flex-1 py-2.5 bg-[#1e3a5f] text-white rounded-xl font-medium hover:bg-[#2d4a6f] transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard size={18} />
              Registrar Pago
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

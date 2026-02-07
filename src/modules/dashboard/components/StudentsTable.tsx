"use client";

import { useState } from "react";
import { Calendar, CreditCard, Search, Eye, X, MessageCircle, Clock } from "lucide-react";
import { Pagination } from "./Pagination";
import type { Student } from "../types";
import { useBranding } from "@/components/providers/BrandingContext";
import { cn } from "@/lib/utils";

interface StudentsTableProps {
  students: Student[];
  onPaymentClick: (student: Student) => void;
}

export function StudentsTable({ students, onPaymentClick }: StudentsTableProps) {
  const branding = useBranding();
  const isDark = branding.darkMode !== false;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.document.includes(searchTerm) ||
      s.program.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-all duration-300",
      isDark ? "bg-slate-900/60 border-slate-800/50 shadow-2xl" : "bg-white border-slate-200 shadow-instituto"
    )}>
      <div className={cn(
        "p-4 sm:p-6 border-b",
        isDark ? "border-slate-800/50 bg-slate-900/40" : "border-slate-100 bg-gray-50/50"
      )}>
        <div className="flex flex-col lg:flex-row gap-3 lg:justify-between lg:items-center">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, documento o programa..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className={cn(
                  "w-full pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 transition-all",
                  isDark
                    ? "bg-slate-950/50 border-slate-800 text-slate-200 focus:ring-cyan-500/20"
                    : "bg-white border-slate-200 text-slate-700 focus:ring-blue-500/20"
                )}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className={cn(
                "px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 transition-all",
                isDark
                  ? "bg-slate-950/50 border-slate-800 text-slate-200 focus:ring-cyan-500/20"
                  : "bg-white border-slate-200 text-slate-700 focus:ring-blue-500/20"
              )}
            >
              <option value="all">Todos los estados</option>
              <option value="MATRICULADO">Matriculados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="EN_OTRA_INSTITUCION">En otra institución</option>
            </select>
          </div>
          <div className={cn(
            "text-sm font-semibold",
            isDark ? "text-slate-400" : "text-gray-500"
          )}>
            Mostrando{" "}
            <span className={cn(
              "font-bold text-base",
              isDark ? "text-cyan-400" : "text-primary"
            )}>
              {filteredStudents.length}
            </span>{" "}
            estudiantes
          </div>
        </div>
      </div>

      <div className={cn(
        "lg:hidden divide-y",
        isDark ? "divide-slate-800/50" : "divide-gray-100"
      )}>
        {paginatedStudents.map((student) => (
          <div
            key={student.id}
            className={cn(
              "p-4 transition-colors",
              isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-xl text-white flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0",
                  isDark ? "bg-gradient-to-br from-cyan-600 to-blue-700" : "bg-gradient-instituto"
                )}>
                  {student.name.charAt(0)}
                </div>
                <div>
                  <p className={cn(
                    "font-bold",
                    isDark ? "text-white" : "text-primary"
                  )}>{student.name}</p>
                  <p className="text-xs text-slate-500 font-semibold">
                    Doc: {student.document}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleViewDetail(student)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isDark ? "text-cyan-400 hover:bg-cyan-400/10" : "text-primary hover:bg-primary/10"
                )}
              >
                <Eye size={18} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary">
                {student.program}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-700">
                {student.advisor}
              </span>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500 font-semibold">Saldo Pendiente</span>
                <span className="font-bold text-primary">
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
                <span className="text-xs text-gray-400">
                  Pagado: ${student.paidAmount.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400">
                  {Math.round((student.paidAmount / student.totalValue) * 100)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-500">
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
          <thead className={cn(
            "transition-colors",
            isDark ? "bg-slate-950/40" : "bg-gray-50/50"
          )}>
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Estudiante
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Programa
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Progreso de Pago
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Saldo
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Próximo Pago
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Asesor
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider" />
            </tr>
          </thead>
          <tbody className={cn(
            "divide-y",
            isDark ? "divide-slate-800/50" : "divide-gray-100"
          )}>
            {paginatedStudents.map((student) => {
              const progressPercent = Math.round((student.paidAmount / student.totalValue) * 100);
              return (
                <tr
                  key={student.id}
                  className={cn(
                    "transition-colors",
                    isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
                  )}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-sm shadow-md",
                        isDark ? "bg-gradient-to-br from-cyan-600 to-blue-700" : "bg-gradient-instituto"
                      )}>
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className={cn(
                          "font-bold text-sm",
                          isDark ? "text-white" : "text-primary"
                        )}>
                          {student.name}
                        </p>
                        <p className="text-xs text-slate-500 font-semibold">
                          Doc: {student.document}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "text-sm font-semibold",
                      isDark ? "text-slate-300" : "text-gray-700"
                    )}>
                      {student.program}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-emerald-500 font-bold">${student.paidAmount.toLocaleString()}</span>
                        <span className="text-slate-500">{progressPercent}%</span>
                      </div>
                      <div className={cn(
                        "w-28 h-2 rounded-full overflow-hidden shadow-inner",
                        isDark ? "bg-slate-800" : "bg-gray-100"
                      )}>
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            progressPercent >= 75 ? "bg-emerald-500" :
                              progressPercent >= 50 ? "bg-blue-500" :
                                progressPercent >= 25 ? "bg-amber-500" : "bg-rose-500"
                          )}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold opacity-60">de ${student.totalValue.toLocaleString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className={cn(
                      "text-sm font-bold",
                      student.remainingBalance > 0 ? (isDark ? "text-rose-400" : "text-red-600") : (isDark ? "text-emerald-400" : "text-green-600")
                    )}>
                      ${student.remainingBalance.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-500" />
                      <span className={cn(
                        "text-sm font-semibold",
                        isDark ? "text-slate-300" : "text-gray-700"
                      )}>
                        {student.nextPaymentDate}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border transition-colors",
                      isDark
                        ? "bg-slate-800/50 text-slate-300 border-slate-700"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                    )}>
                      {student.advisor}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewDetail(student)}
                        className={cn(
                          "p-2 rounded-xl transition-all border group active:scale-95",
                          isDark
                            ? "text-cyan-400 border-slate-800 hover:bg-cyan-400/10 hover:border-cyan-500/30"
                            : "text-primary border-slate-100 hover:bg-primary/5 hover:border-primary/20"
                        )}
                        title="Ver Detalle"
                      >
                        <Eye size={18} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => onPaymentClick(student)}
                        className={cn(
                          "p-2 rounded-xl transition-all border group active:scale-95",
                          isDark
                            ? "text-emerald-400 border-slate-800 hover:bg-emerald-400/10 hover:border-emerald-500/30"
                            : "text-emerald-600 border-slate-100 hover:bg-emerald-50 hover:border-emerald-200"
                        )}
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
          <h3 className="text-lg font-bold text-primary mb-2">
            No hay estudiantes
          </h3>
          <p className="text-sm text-gray-500">
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
  const branding = useBranding();
  const isDark = branding.darkMode !== false;
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className={cn(
        "rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border animate-in zoom-in-95 duration-300 transition-colors",
        isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
      )}>
        <div className={cn(
          "p-6 text-white relative",
          isDark ? "bg-gradient-to-br from-cyan-600 to-blue-700" : "bg-gradient-instituto"
        )}>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl font-bold shadow-lg">
              {student.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold font-display tracking-tight">{student.name}</h2>
              <p className="text-white/70 text-sm font-medium">Doc: {student.document}</p>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className={cn(
                "rounded-xl p-4 border transition-colors",
                isDark ? "bg-white/[0.03] border-white/5" : "bg-gray-50 border-gray-100"
              )}>
                <p className={cn(
                  "text-[10px] uppercase font-bold mb-1 tracking-wider text-slate-500"
                )}>Programa</p>
                <p className={cn(
                  "font-bold text-sm",
                  isDark ? "text-slate-200" : "text-primary"
                )}>{student.program}</p>
              </div>
              <div className={cn(
                "rounded-xl p-4 border transition-colors",
                isDark ? "bg-white/[0.03] border-white/5" : "bg-gray-50 border-gray-100"
              )}>
                <p className={cn(
                  "text-[10px] uppercase font-bold mb-1 tracking-wider text-slate-500"
                )}>Asesor</p>
                <p className={cn(
                  "font-bold text-sm",
                  isDark ? "text-slate-200" : "text-primary"
                )}>{student.advisor}</p>
              </div>
              <div className={cn(
                "rounded-xl p-4 border transition-colors",
                isDark ? "bg-white/[0.03] border-white/5" : "bg-gray-50 border-gray-100"
              )}>
                <p className={cn(
                  "text-[10px] uppercase font-bold mb-1 tracking-wider text-slate-500"
                )}>Fecha de Matrícula</p>
                <p className={cn(
                  "font-bold text-sm",
                  isDark ? "text-slate-200" : "text-primary"
                )}>{student.enrollmentDate}</p>
              </div>
              <div className={cn(
                "rounded-xl p-4 border transition-colors",
                isDark ? "bg-white/[0.03] border-white/5" : "bg-gray-50 border-gray-100"
              )}>
                <p className={cn(
                  "text-[10px] uppercase font-bold mb-1 tracking-wider text-slate-500"
                )}>Estado</p>
                <span className={cn(
                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ring-1 ring-inset",
                  student.status === "MATRICULADO"
                    ? (isDark ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" : "bg-emerald-50 text-emerald-700 ring-emerald-500/20")
                    : (isDark ? "bg-amber-500/10 text-amber-400 ring-amber-500/20" : "bg-amber-50 text-amber-700 ring-amber-500/20")
                )}>
                  {student.status === "MATRICULADO" ? "Matriculado" :
                    student.status === "PENDIENTE" ? "Pendiente" : "En otra institución"}
                </span>
              </div>
            </div>

            <div className={cn(
              "rounded-xl p-5 border transition-colors",
              isDark ? "bg-slate-950/40 border-slate-800" : "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/10"
            )}>
              <h3 className={cn(
                "text-sm font-bold mb-4",
                isDark ? "text-slate-400" : "text-primary"
              )}>Resumen Financiero</h3>
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold">Total Programa</p>
                  <p className={cn(
                    "text-lg font-bold",
                    isDark ? "text-slate-200" : "text-primary"
                  )}>${student.totalValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold">Total Pagado</p>
                  <p className="text-lg font-bold text-emerald-500">${student.paidAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold">Saldo Pendiente</p>
                  <p className={cn(
                    "text-lg font-bold",
                    student.remainingBalance > 0 ? (isDark ? "text-rose-400" : "text-red-600") : (isDark ? "text-emerald-400" : "text-emerald-600")
                  )}>${student.remainingBalance.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-1 uppercase tracking-wider font-bold">
                  <span className="text-slate-500">Progreso de pago</span>
                  <span className={isDark ? "text-cyan-400" : "text-primary"}>{progressPercent}%</span>
                </div>
                <div className={cn(
                  "w-full h-2.5 rounded-full overflow-hidden shadow-inner",
                  isDark ? "bg-slate-800" : "bg-gray-200"
                )}>
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      progressPercent >= 75 ? "bg-emerald-500" :
                        progressPercent >= 50 ? "bg-blue-500" :
                          progressPercent >= 25 ? "bg-amber-500" : "bg-rose-500"
                    )}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 border-b border-dashed border-slate-800/50 pb-2">
                <h3 className={cn(
                  "text-sm font-bold flex items-center gap-2",
                  isDark ? "text-slate-400" : "text-primary"
                )}>
                  <Clock size={16} />
                  Historial de Pagos
                </h3>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{paymentHistory.length} registros</span>
              </div>
              <div className="space-y-2">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-colors",
                    isDark ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]" : "bg-gray-50/50 border-gray-100 hover:bg-gray-50"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm",
                        isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-100 text-emerald-600"
                      )}>
                        <CreditCard size={16} />
                      </div>
                      <div>
                        <p className={cn(
                          "font-mono text-[10px] font-bold",
                          isDark ? "text-slate-400" : "text-gray-500"
                        )}>{payment.receipt}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{new Date(payment.date).toLocaleDateString("es-CO")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-500 text-sm">${payment.amount.toLocaleString()}</p>
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest",
                        isDark ? "bg-white/5 text-slate-400" : "bg-gray-200 text-gray-700"
                      )}>
                        {payment.method}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {student.remainingBalance > 0 && (
              <div className={cn(
                "rounded-xl p-4 border flex items-center gap-3 transition-colors",
                isDark ? "bg-amber-500/5 border-amber-500/10" : "bg-amber-50 border-amber-100"
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  isDark ? "bg-amber-500/10 text-amber-500" : "bg-amber-100 text-amber-600"
                )}>
                  <Calendar size={20} />
                </div>
                <div>
                  <p className={cn("font-bold text-sm", isDark ? "text-amber-400" : "text-amber-900")}>Próximo Pago</p>
                  <p className={cn("text-xs font-semibold", isDark ? "text-amber-500/70" : "text-amber-700")}>{student.nextPaymentDate}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={cn(
          "p-6 border-t flex flex-wrap gap-3 mt-auto",
          isDark ? "border-white/5" : "border-gray-100"
        )}>
          <button
            onClick={onClose}
            className={cn(
              "flex-1 py-3 border rounded-xl font-bold text-sm transition-all active:scale-95",
              isDark
                ? "border-slate-800 text-slate-400 hover:bg-white/5"
                : "border-gray-200 text-gray-700 hover:bg-gray-100"
            )}
          >
            Cerrar
          </button>
          <a
            href={`https://wa.me/57${(student.phone || "").replace(/\D/g, "")}?text=Hola%20${encodeURIComponent(student.name.split(" ")[0])}%2C%20le%20escribimos%20del%20Instituto%20de%20Formaci%C3%B3n%20T%C3%A9cnica.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <MessageCircle size={18} />
            WhatsApp
          </a>
          {student.remainingBalance > 0 && (
            <button
              onClick={onPaymentClick}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95",
                isDark ? "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/20" : "bg-primary hover:bg-primary-light shadow-primary/10"
              )}
            >
              <CreditCard size={18} />
              Registrar Abono
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

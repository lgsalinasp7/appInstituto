"use client";

import { useState, useEffect } from "react";
import { X, User, Phone, Mail, MapPin, GraduationCap, Calendar, DollarSign, CreditCard, UserCheck } from "lucide-react";
import type { StudentWithRelations } from "../types";

interface PaymentHistory {
  id: string;
  amount: number;
  paymentDate: Date;
  method: string;
  reference: string | null;
  receiptNumber: string;
  registeredBy: { name: string | null; email: string };
}

interface StudentDetailModalProps {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
  onPaymentClick: () => void;
}

export function StudentDetailModal({ studentId, isOpen, onClose, onPaymentClick }: StudentDetailModalProps) {
  const [student, setStudent] = useState<StudentWithRelations | null>(null);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentDetails();
    }
  }, [isOpen, studentId]);

  const fetchStudentDetails = async () => {
    setIsLoading(true);
    try {
      const [studentRes, paymentsRes] = await Promise.all([
        fetch(`/api/students/${studentId}`),
        fetch(`/api/students/${studentId}/payments`),
      ]);

      const studentData = await studentRes.json();
      const paymentsData = await paymentsRes.json();

      if (studentData.success) {
        setStudent(studentData.data);
      }

      if (paymentsData.success) {
        setPayments(paymentsData.data.payments || []);
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 animate-fade-in-up overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl my-4 sm:my-8 overflow-hidden border border-gray-200">
        <div className="bg-gradient-instituto p-4 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 sm:right-6 top-4 sm:top-6 text-white/70 hover:text-white transition-colors hover:rotate-90 duration-200"
          >
            <X size={22} className="sm:w-[26px] sm:h-[26px]" strokeWidth={2.5} />
          </button>

          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-6 sm:h-8 w-36 sm:w-48 bg-white/20 rounded mb-2" />
              <div className="h-3 sm:h-4 w-24 sm:w-32 bg-white/10 rounded" />
            </div>
          ) : student ? (
            <>
              <div className="flex items-center gap-3 sm:gap-4 pr-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/20 flex items-center justify-center text-xl sm:text-2xl font-bold flex-shrink-0">
                  {student.fullName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold truncate">{student.fullName}</h2>
                  <p className="text-blue-100 text-xs sm:text-sm">
                    {student.documentType}: {student.documentNumber}
                  </p>
                </div>
              </div>

              <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3">
                <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                  student.status === "MATRICULADO"
                    ? "bg-green-500/20 text-green-100"
                    : student.status === "PENDIENTE"
                    ? "bg-yellow-500/20 text-yellow-100"
                    : "bg-red-500/20 text-red-100"
                }`}>
                  {student.status.replace("_", " ")}
                </span>
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-white/10 text-white truncate max-w-[150px] sm:max-w-none">
                  {student.program.name}
                </span>
              </div>
            </>
          ) : null}
        </div>

        {isLoading ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="animate-spin w-6 h-6 sm:w-8 sm:h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : student ? (
          <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-5">
                  <h3 className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2 mb-3 sm:mb-4">
                    <Phone size={14} className="sm:w-4 sm:h-4" />
                    Contacto
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Phone size={12} className="sm:w-3.5 sm:h-3.5 text-gray-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium">{student.phone}</span>
                    </div>
                    {student.email && (
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Mail size={12} className="sm:w-3.5 sm:h-3.5 text-gray-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-medium truncate">{student.email}</span>
                      </div>
                    )}
                    {student.address && (
                      <div className="flex items-center gap-2 sm:gap-3">
                        <MapPin size={12} className="sm:w-3.5 sm:h-3.5 text-gray-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-medium">{student.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {(student.guardianName || student.guardianPhone) && (
                  <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-5">
                    <h3 className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2 mb-3 sm:mb-4">
                      <UserCheck size={14} className="sm:w-4 sm:h-4" />
                      Acudiente
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      {student.guardianName && (
                        <div className="flex items-center gap-2 sm:gap-3">
                          <User size={12} className="sm:w-3.5 sm:h-3.5 text-gray-500 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium">{student.guardianName}</span>
                        </div>
                      )}
                      {student.guardianPhone && (
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Phone size={12} className="sm:w-3.5 sm:h-3.5 text-gray-500 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium">{student.guardianPhone}</span>
                        </div>
                      )}
                      {student.guardianEmail && (
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Mail size={12} className="sm:w-3.5 sm:h-3.5 text-gray-500 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium truncate">{student.guardianEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-5">
                  <h3 className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2 mb-3 sm:mb-4">
                    <GraduationCap size={14} className="sm:w-4 sm:h-4" />
                    Información Académica
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between gap-2">
                      <span className="text-xs sm:text-sm text-gray-500">Programa</span>
                      <span className="text-xs sm:text-sm font-bold text-primary text-right truncate max-w-[150px]">{student.program.name}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-xs sm:text-sm text-gray-500">Asesor</span>
                      <span className="text-xs sm:text-sm font-bold text-primary text-right truncate max-w-[150px]">{student.advisor.name || student.advisor.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                        <Calendar size={10} className="sm:w-3 sm:h-3" />
                        Matrícula
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-primary">
                        {new Date(student.enrollmentDate).toLocaleDateString("es-CO")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="bg-gradient-to-br from-primary to-primary-light rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-3 sm:mb-4">
                    <DollarSign size={14} className="sm:w-4 sm:h-4" />
                    Resumen Financiero
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-blue-100">Valor Total</span>
                      <span className="font-bold">${student.totalProgramValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-blue-100">Total Pagado</span>
                      <span className="font-bold text-green-300">${student.totalPaid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-blue-100">Saldo Pendiente</span>
                      <span className="font-bold text-orange-300">${student.remainingBalance.toLocaleString()}</span>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between text-[10px] sm:text-xs mb-1">
                        <span>Progreso</span>
                        <span>{Math.round((student.totalPaid / student.totalProgramValue) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 sm:h-3 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-400 rounded-full transition-all"
                          style={{ width: `${(student.totalPaid / student.totalProgramValue) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={onPaymentClick}
                    className="mt-3 sm:mt-4 w-full py-2.5 sm:py-3 bg-white text-primary font-bold rounded-lg sm:rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <CreditCard size={16} className="sm:w-[18px] sm:h-[18px]" />
                    Registrar Pago
                  </button>
                </div>

                <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-5">
                  <h3 className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2 mb-3 sm:mb-4">
                    <CreditCard size={14} className="sm:w-4 sm:h-4" />
                    Historial de Pagos ({payments.length})
                  </h3>

                  {payments.length === 0 ? (
                    <p className="text-xs sm:text-sm text-gray-500 text-center py-3 sm:py-4">
                      No hay pagos registrados
                    </p>
                  ) : (
                    <div className="space-y-2 sm:space-y-3 max-h-40 sm:max-h-48 overflow-y-auto">
                      {payments.map((payment) => (
                        <div key={payment.id} className="bg-white p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-gray-200">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <p className="font-bold text-primary text-sm sm:text-base">${payment.amount.toLocaleString()}</p>
                              <p className="text-[10px] sm:text-xs text-gray-500">
                                {new Date(payment.paymentDate).toLocaleDateString("es-CO")}
                              </p>
                            </div>
                            <span className="text-[10px] sm:text-xs bg-primary/10 text-primary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg font-bold flex-shrink-0">
                              {payment.method}
                            </span>
                          </div>
                          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 truncate">
                            Recibo: {payment.receiptNumber}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

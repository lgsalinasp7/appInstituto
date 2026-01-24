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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden border border-gray-200">
        <div className="bg-gradient-instituto p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-white/70 hover:text-white transition-colors hover:rotate-90 duration-200"
          >
            <X size={26} strokeWidth={2.5} />
          </button>

          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-white/20 rounded mb-2" />
              <div className="h-4 w-32 bg-white/10 rounded" />
            </div>
          ) : student ? (
            <>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {student.fullName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{student.fullName}</h2>
                  <p className="text-blue-100 text-sm">
                    {student.documentType}: {student.documentNumber}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  student.status === "MATRICULADO" 
                    ? "bg-green-500/20 text-green-100" 
                    : student.status === "PENDIENTE"
                    ? "bg-yellow-500/20 text-yellow-100"
                    : "bg-red-500/20 text-red-100"
                }`}>
                  {student.status.replace("_", " ")}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white">
                  {student.program.name}
                </span>
              </div>
            </>
          ) : null}
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#1e3a5f] border-t-transparent rounded-full mx-auto" />
          </div>
        ) : student ? (
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-[#1e3a5f] uppercase tracking-wider flex items-center gap-2 mb-4">
                    <Phone size={16} />
                    Contacto
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone size={14} className="text-[#64748b]" />
                      <span className="text-sm font-medium">{student.phone}</span>
                    </div>
                    {student.email && (
                      <div className="flex items-center gap-3">
                        <Mail size={14} className="text-[#64748b]" />
                        <span className="text-sm font-medium">{student.email}</span>
                      </div>
                    )}
                    {student.address && (
                      <div className="flex items-center gap-3">
                        <MapPin size={14} className="text-[#64748b]" />
                        <span className="text-sm font-medium">{student.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {(student.guardianName || student.guardianPhone) && (
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-[#1e3a5f] uppercase tracking-wider flex items-center gap-2 mb-4">
                      <UserCheck size={16} />
                      Acudiente
                    </h3>
                    <div className="space-y-3">
                      {student.guardianName && (
                        <div className="flex items-center gap-3">
                          <User size={14} className="text-[#64748b]" />
                          <span className="text-sm font-medium">{student.guardianName}</span>
                        </div>
                      )}
                      {student.guardianPhone && (
                        <div className="flex items-center gap-3">
                          <Phone size={14} className="text-[#64748b]" />
                          <span className="text-sm font-medium">{student.guardianPhone}</span>
                        </div>
                      )}
                      {student.guardianEmail && (
                        <div className="flex items-center gap-3">
                          <Mail size={14} className="text-[#64748b]" />
                          <span className="text-sm font-medium">{student.guardianEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-[#1e3a5f] uppercase tracking-wider flex items-center gap-2 mb-4">
                    <GraduationCap size={16} />
                    Información Académica
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#64748b]">Programa</span>
                      <span className="text-sm font-bold text-[#1e3a5f]">{student.program.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#64748b]">Asesor</span>
                      <span className="text-sm font-bold text-[#1e3a5f]">{student.advisor.name || student.advisor.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#64748b] flex items-center gap-1">
                        <Calendar size={12} />
                        Fecha de Matrícula
                      </span>
                      <span className="text-sm font-bold text-[#1e3a5f]">
                        {new Date(student.enrollmentDate).toLocaleDateString("es-CO")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-2xl p-5 text-white">
                  <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4">
                    <DollarSign size={16} />
                    Resumen Financiero
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-blue-100">Valor Total</span>
                      <span className="font-bold">${student.totalProgramValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-100">Total Pagado</span>
                      <span className="font-bold text-green-300">${student.totalPaid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-100">Saldo Pendiente</span>
                      <span className="font-bold text-orange-300">${student.remainingBalance.toLocaleString()}</span>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progreso</span>
                        <span>{Math.round((student.totalPaid / student.totalProgramValue) * 100)}%</span>
                      </div>
                      <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-400 rounded-full transition-all"
                          style={{ width: `${(student.totalPaid / student.totalProgramValue) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={onPaymentClick}
                    className="mt-4 w-full py-3 bg-white text-[#1e3a5f] font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard size={18} />
                    Registrar Pago
                  </button>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-[#1e3a5f] uppercase tracking-wider flex items-center gap-2 mb-4">
                    <CreditCard size={16} />
                    Historial de Pagos ({payments.length})
                  </h3>
                  
                  {payments.length === 0 ? (
                    <p className="text-sm text-[#64748b] text-center py-4">
                      No hay pagos registrados
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {payments.map((payment) => (
                        <div key={payment.id} className="bg-white p-3 rounded-xl border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-[#1e3a5f]">${payment.amount.toLocaleString()}</p>
                              <p className="text-xs text-[#64748b]">
                                {new Date(payment.paymentDate).toLocaleDateString("es-CO")}
                              </p>
                            </div>
                            <span className="text-xs bg-[#1e3a5f]/10 text-[#1e3a5f] px-2 py-1 rounded-lg font-bold">
                              {payment.method}
                            </span>
                          </div>
                          <p className="text-xs text-[#94a3b8] mt-1">
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

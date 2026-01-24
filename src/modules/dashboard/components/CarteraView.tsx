"use client";

import { useState, useMemo } from "react";
import { AlertCircle, Calendar, Phone, MessageCircle, CheckCircle2, Clock, RefreshCw, DollarSign, X, History, Search } from "lucide-react";
import { Pagination } from "./Pagination";
import { DEMO_CARTERA_SUMMARY, DEMO_CARTERA_ALERTS, DEMO_STUDENT_DEBTS } from "../data/demo-data";

interface Alert {
  id: string;
  type: "overdue" | "today" | "upcoming";
  studentName: string;
  studentPhone: string;
  amount: number;
  dueDate: string;
  daysOverdue?: number;
  advisorName: string;
  studentId: string;
}

interface CarteraSummary {
  totalPendingAmount: number;
  overdueCount: number;
  overdueAmount: number;
  todayCount: number;
  todayAmount: number;
  upcomingCount: number;
  upcomingAmount: number;
}

interface StudentDebt {
  studentId: string;
  studentName: string;
  documentNumber: string;
  phone: string;
  programName: string;
  advisorName: string;
  totalProgramValue: number;
  totalPaid: number;
  remainingBalance: number;
  daysSinceLastPayment: number | null;
}

interface CarteraViewProps {
  advisorId?: string;
}

export function CarteraView({ advisorId }: CarteraViewProps) {
  const [alerts] = useState<Alert[]>(DEMO_CARTERA_ALERTS);
  const [summary] = useState<CarteraSummary>(DEMO_CARTERA_SUMMARY);
  const [debts] = useState<StudentDebt[]>(DEMO_STUDENT_DEBTS);
  const [activeTab, setActiveTab] = useState<"alerts" | "debts">("alerts");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [showAbonoModal, setShowAbonoModal] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDebt | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert =>
      alert.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [alerts, searchTerm]);

  const filteredDebts = useMemo(() => {
    return debts.filter(debt =>
      debt.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debt.documentNumber.includes(searchTerm)
    );
  }, [debts, searchTerm]);

  const totalPagesDebts = Math.ceil(filteredDebts.length / itemsPerPage);
  const paginatedDebts = filteredDebts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateCommitment = (studentId: string, amount: number, date: Date, comments: string) => {
    console.log("Creating commitment:", { studentId, amount, date, comments });
    setShowCommitmentModal(false);
    setSelectedStudent(null);
  };

  const handleRegisterAbono = (data: { amount: number; method: string; reference: string; createCommitment: boolean; commitmentDate?: Date }) => {
    console.log("Registering abono:", data);
    setShowAbonoModal(false);
    setSelectedStudent(null);
    setSelectedAlert(null);
  };

  const handleMarkAsPaid = (alert: Alert) => {
    setSelectedAlert(alert);
    const student = debts.find(d => d.studentId === alert.studentId);
    if (student) {
      setSelectedStudent(student);
    }
    setShowAbonoModal(true);
  };

  const getAlertTypeStyles = (type: string) => {
    switch (type) {
      case "overdue":
        return "bg-red-50 border-red-200 text-red-800";
      case "today":
        return "bg-orange-50 border-orange-200 text-orange-800";
      case "upcoming":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "overdue":
        return <AlertCircle className="text-red-500" size={20} />;
      case "today":
        return <Clock className="text-orange-500" size={20} />;
      case "upcoming":
        return <Calendar className="text-blue-500" size={20} />;
      default:
        return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={20} />
            <span className="text-sm font-medium opacity-90">Vencidos</span>
          </div>
          <p className="text-2xl font-bold">${summary.overdueAmount.toLocaleString()}</p>
          <p className="text-sm opacity-75">{summary.overdueCount} compromisos</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={20} />
            <span className="text-sm font-medium opacity-90">Vencen Hoy</span>
          </div>
          <p className="text-2xl font-bold">${summary.todayAmount.toLocaleString()}</p>
          <p className="text-sm opacity-75">{summary.todayCount} compromisos</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={20} />
            <span className="text-sm font-medium opacity-90">Próximos 7 días</span>
          </div>
          <p className="text-2xl font-bold">${summary.upcomingAmount.toLocaleString()}</p>
          <p className="text-sm opacity-75">{summary.upcomingCount} compromisos</p>
        </div>

        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw size={20} />
            <span className="text-sm font-medium opacity-90">Total Pendiente</span>
          </div>
          <p className="text-2xl font-bold">${summary.totalPendingAmount.toLocaleString()}</p>
          <p className="text-sm opacity-75">Cartera total</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex">
            <button
              onClick={() => { setActiveTab("alerts"); setCurrentPage(1); }}
              className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                activeTab === "alerts"
                  ? "text-[#1e3a5f] border-b-2 border-[#1e3a5f] bg-[#1e3a5f]/5"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Alertas de Cobro ({filteredAlerts.length})
            </button>
            <button
              onClick={() => { setActiveTab("debts"); setCurrentPage(1); }}
              className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                activeTab === "debts"
                  ? "text-[#1e3a5f] border-b-2 border-[#1e3a5f] bg-[#1e3a5f]/5"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Cartera Detallada ({filteredDebts.length})
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar estudiante..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            />
          </div>
        </div>

        {activeTab === "alerts" && (
          <div className="p-4 space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 size={48} className="mx-auto text-green-400 mb-4" />
                <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">Sin alertas pendientes</h3>
                <p className="text-gray-500">No hay compromisos de pago vencidos o próximos</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border ${getAlertTypeStyles(alert.type)} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                >
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <p className="font-bold">{alert.studentName}</p>
                      <p className="text-sm opacity-75">
                        {alert.type === "overdue" && `Vencido hace ${alert.daysOverdue} días`}
                        {alert.type === "today" && "Vence hoy"}
                        {alert.type === "upcoming" && `Vence el ${new Date(alert.dueDate).toLocaleDateString("es-CO")}`}
                      </p>
                      <p className="text-xs opacity-60 mt-1">Asesor: {alert.advisorName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">${alert.amount.toLocaleString()}</span>
                    <div className="flex gap-2">
                      <a
                        href={`tel:${alert.studentPhone}`}
                        className="p-2 bg-white/50 rounded-lg hover:bg-white transition-colors"
                        title="Llamar"
                      >
                        <Phone size={18} />
                      </a>
                      <a
                        href={`https://wa.me/57${alert.studentPhone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/50 rounded-lg hover:bg-white transition-colors"
                        title="WhatsApp"
                      >
                        <MessageCircle size={18} />
                      </a>
                      <button
                        onClick={() => handleMarkAsPaid(alert)}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        title="Registrar Abono"
                      >
                        <DollarSign size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "debts" && (
          <>
            <div className="overflow-x-auto">
              {paginatedDebts.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 size={48} className="mx-auto text-green-400 mb-4" />
                  <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">Sin cartera pendiente</h3>
                  <p className="text-gray-500">Todos los estudiantes están al día</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Estudiante</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Programa</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Progreso</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Pendiente</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Último Pago</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedDebts.map((debt) => {
                      const progressPercent = Math.round((debt.totalPaid / debt.totalProgramValue) * 100);
                      return (
                        <tr key={debt.studentId} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-bold text-[#1e3a5f]">{debt.studentName}</p>
                              <p className="text-xs text-gray-500">{debt.phone}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm">{debt.programName}</p>
                            <p className="text-xs text-gray-500">{debt.advisorName}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-green-600 font-bold">${debt.totalPaid.toLocaleString()}</span>
                                <span className="text-gray-500">{progressPercent}%</span>
                              </div>
                              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    progressPercent >= 75 ? "bg-green-500" :
                                    progressPercent >= 50 ? "bg-blue-500" :
                                    progressPercent >= 25 ? "bg-yellow-500" : "bg-red-500"
                                  }`}
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-400 mt-1">de ${debt.totalProgramValue.toLocaleString()}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-red-600 text-lg">${debt.remainingBalance.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm ${
                              debt.daysSinceLastPayment !== null && debt.daysSinceLastPayment > 30
                                ? "text-red-600 font-bold"
                                : "text-gray-600"
                            }`}>
                              {debt.daysSinceLastPayment !== null
                                ? `Hace ${debt.daysSinceLastPayment} días`
                                : "Sin pagos"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <a
                                href={`https://wa.me/57${debt.phone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                title="WhatsApp"
                              >
                                <MessageCircle size={18} />
                              </a>
                              <button
                                onClick={() => {
                                  setSelectedStudent(debt);
                                  setShowAbonoModal(true);
                                }}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                title="Registrar Abono"
                              >
                                <DollarSign size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedStudent(debt);
                                  setShowCommitmentModal(true);
                                }}
                                className="p-2 text-[#1e3a5f] hover:bg-[#1e3a5f]/10 rounded-lg"
                                title="Crear compromiso"
                              >
                                <Calendar size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedStudent(debt);
                                  setShowHistorialModal(true);
                                }}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                                title="Ver historial"
                              >
                                <History size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            
            {filteredDebts.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPagesDebts}
                totalItems={filteredDebts.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(items) => { setItemsPerPage(items); setCurrentPage(1); }}
              />
            )}
          </>
        )}
      </div>

      {showCommitmentModal && selectedStudent && (
        <CommitmentModal
          student={selectedStudent}
          onClose={() => { setShowCommitmentModal(false); setSelectedStudent(null); }}
          onSubmit={handleCreateCommitment}
        />
      )}

      {showAbonoModal && selectedStudent && (
        <AbonoModal
          student={selectedStudent}
          alertAmount={selectedAlert?.amount}
          onClose={() => { setShowAbonoModal(false); setSelectedStudent(null); setSelectedAlert(null); }}
          onSubmit={handleRegisterAbono}
        />
      )}

      {showHistorialModal && selectedStudent && (
        <HistorialCompromisosModal
          student={selectedStudent}
          onClose={() => { setShowHistorialModal(false); setSelectedStudent(null); }}
        />
      )}
    </div>
  );
}

function CommitmentModal({
  student,
  onClose,
  onSubmit,
}: {
  student: StudentDebt;
  onClose: () => void;
  onSubmit: (studentId: string, amount: number, date: Date, comments: string) => void;
}) {
  const [amount, setAmount] = useState(Math.min(student.remainingBalance, 350000));
  const [date, setDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [comments, setComments] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="bg-[#1e3a5f] p-6 text-white relative rounded-t-2xl">
          <button onClick={onClose} className="absolute right-4 top-4 text-white/70 hover:text-white">
            <X size={24} />
          </button>
          <div className="flex items-center gap-3">
            <Calendar size={28} />
            <div>
              <h3 className="text-lg font-bold">Crear Compromiso de Pago</h3>
              <p className="text-sm text-blue-200">{student.studentName}</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Saldo Pendiente</span>
              <span className="font-bold text-red-600">${student.remainingBalance.toLocaleString()}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto del Compromiso</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Pago</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={2}
              placeholder="Ej: Se compromete a pagar el día 20..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 resize-none"
            />
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg font-medium hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={() => onSubmit(student.studentId, amount, new Date(date), comments)}
            className="flex-1 py-2.5 bg-[#1e3a5f] text-white rounded-lg font-medium hover:bg-[#2d4a6f]"
          >
            Crear Compromiso
          </button>
        </div>
      </div>
    </div>
  );
}

function AbonoModal({
  student,
  alertAmount,
  onClose,
  onSubmit,
}: {
  student: StudentDebt;
  alertAmount?: number;
  onClose: () => void;
  onSubmit: (data: { amount: number; method: string; reference: string; createCommitment: boolean; commitmentDate?: Date }) => void;
}) {
  const [amount, setAmount] = useState(alertAmount || Math.min(student.remainingBalance, 350000));
  const [method, setMethod] = useState("BANCOLOMBIA");
  const [reference, setReference] = useState("");
  const [createCommitment, setCreateCommitment] = useState(false);
  const [commitmentDate, setCommitmentDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const newBalance = student.remainingBalance - amount;

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({
        amount,
        method,
        reference,
        createCommitment,
        commitmentDate: createCommitment ? new Date(commitmentDate) : undefined,
      });
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white relative rounded-t-2xl">
          <button onClick={onClose} className="absolute right-4 top-4 text-white/70 hover:text-white">
            <X size={24} />
          </button>
          <div className="flex items-center gap-3">
            <DollarSign size={28} />
            <div>
              <h3 className="text-lg font-bold">Registrar Abono</h3>
              <p className="text-sm text-emerald-100">{student.studentName}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Saldo Actual</p>
              <p className="font-bold text-red-600">${student.remainingBalance.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Nuevo Saldo</p>
              <p className="font-bold text-emerald-600">${newBalance.toLocaleString()}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto del Abono *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                max={student.remainingBalance}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago *</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="BANCOLOMBIA">Bancolombia</option>
              <option value="NEQUI">Nequi</option>
              <option value="DAVIPLATA">Daviplata</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referencia / Comprobante</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ej: REF-123456"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {newBalance > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createCommitment}
                  onChange={(e) => setCreateCommitment(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <p className="font-medium text-blue-900">Crear compromiso para saldo restante</p>
                  <p className="text-xs text-blue-700">Se creará un compromiso por ${newBalance.toLocaleString()}</p>
                </div>
              </label>
              
              {createCommitment && (
                <div className="mt-3 pl-7">
                  <label className="block text-xs font-medium text-blue-800 mb-1">Fecha del compromiso</label>
                  <input
                    type="date"
                    value={commitmentDate}
                    onChange={(e) => setCommitmentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              )}
            </div>
          )}

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-900">Recibo Automático</p>
                <p className="text-xs text-emerald-700">Se generará un recibo digital para enviar al estudiante</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg font-medium hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || amount <= 0 || amount > student.remainingBalance}
            className="flex-1 py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Registrar Abono
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function HistorialCompromisosModal({
  student,
  onClose,
}: {
  student: StudentDebt;
  onClose: () => void;
}) {
  const compromisos = [
    { id: 1, amount: 350000, date: "2025-01-15", status: "PAGADO", paidDate: "2025-01-14" },
    { id: 2, amount: 350000, date: "2024-12-15", status: "PAGADO", paidDate: "2024-12-15" },
    { id: 3, amount: 350000, date: "2024-11-15", status: "PAGADO", paidDate: "2024-11-18" },
    { id: 4, amount: 350000, date: "2025-01-22", status: "PENDIENTE", paidDate: null },
    { id: 5, amount: 300000, date: "2025-02-15", status: "PENDIENTE", paidDate: null },
  ];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "PAGADO":
        return "bg-green-100 text-green-800";
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-800";
      case "VENCIDO":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="bg-purple-600 p-6 text-white relative rounded-t-2xl">
          <button onClick={onClose} className="absolute right-4 top-4 text-white/70 hover:text-white">
            <X size={24} />
          </button>
          <div className="flex items-center gap-3">
            <History size={28} />
            <div>
              <h3 className="text-lg font-bold">Historial de Compromisos</h3>
              <p className="text-sm text-purple-200">{student.studentName}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white rounded-lg p-3">
              <p className="text-lg font-bold text-green-600">3</p>
              <p className="text-xs text-gray-500">Pagados</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-lg font-bold text-yellow-600">2</p>
              <p className="text-xs text-gray-500">Pendientes</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-lg font-bold text-red-600">0</p>
              <p className="text-xs text-gray-500">Vencidos</p>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[400px]">
          <div className="divide-y divide-gray-100">
            {compromisos.map((compromiso) => (
              <div key={compromiso.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-[#1e3a5f]">${compromiso.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">
                      Fecha compromiso: {new Date(compromiso.date).toLocaleDateString("es-CO")}
                    </p>
                    {compromiso.paidDate && (
                      <p className="text-xs text-green-600">
                        Pagado: {new Date(compromiso.paidDate).toLocaleDateString("es-CO")}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusStyles(compromiso.status)}`}>
                    {compromiso.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 border border-gray-200 rounded-lg font-medium hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

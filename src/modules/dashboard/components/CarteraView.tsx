"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { AlertCircle, Calendar, MessageCircle, CheckCircle2, Clock, RefreshCw, DollarSign, History, Search, Trash2 } from "lucide-react";
import { Pagination } from "./Pagination";
import { toast } from "sonner";
import {
  useCreateCommitment,
  useCancelCommitment,
  useCreatePayment,
} from "@/modules/cartera/hooks/usePaymentCommitments";

/** Colombia country calling code for WhatsApp links */
const COUNTRY_CODE_CO = "57";

// Interfaces mapped to API response
interface Alert {
  id: string; // Not used currently in API stats
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
  overdue: { amount: number; count: number };
  today: { amount: number; count: number };
  upcoming: { amount: number; count: number };
}

interface StudentCommitment {
  id: string;
  scheduledDate: string;
  amount: number | string;
  status: string;
  comments?: string | null;
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
  commitments: StudentCommitment[];
}

interface CarteraViewProps {
  advisorId?: string;
}

export function CarteraView({ advisorId: _advisorId }: CarteraViewProps) {
  const [summary, setSummary] = useState<CarteraSummary | null>(null);
  const [debts, setDebts] = useState<StudentDebt[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"alerts" | "debts">("debts"); // Default to debts as alerts are summary-based now
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [showAbonoModal, setShowAbonoModal] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDebt | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const summaryRes = await fetch("/api/cartera/stats");
      const summaryData = await summaryRes.json();
      if (summaryData.success) {
        setSummary(summaryData.data);
      }

      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", itemsPerPage.toString());
      if (debouncedSearch) params.append("search", debouncedSearch);

      const debtsRes = await fetch(`/api/cartera/debts?${params.toString()}`);
      const debtsData = await debtsRes.json();

      if (debtsData.success) {
        setDebts(debtsData.data.debts);
        setTotalItems(debtsData.data.total);
      }
    } catch (error) {
      console.error("Error fetching cartera data:", error);
      toast.error("Error al cargar datos de cartera");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const { create: createCommitmentApi } = useCreateCommitment();

  const handleCreateCommitment = async (
    studentId: string,
    amount: number,
    date: Date,
    comments: string,
  ) => {
    try {
      await createCommitmentApi({
        studentId,
        amount,
        scheduledDate: date,
        comments: comments || undefined,
      });
      toast.success("Compromiso creado correctamente");
      setShowCommitmentModal(false);
      setSelectedStudent(null);
      fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear compromiso";
      toast.error(message);
    }
  };

  const { createPayment: createPaymentApi } = useCreatePayment();

  const handleRegisterAbono = async (data: {
    commitmentId: string;
    amount: number;
    method: "BANCOLOMBIA" | "NEQUI" | "DAVIPLATA" | "EFECTIVO" | "OTRO";
    reference?: string;
  }) => {
    try {
      await createPaymentApi({
        commitmentId: data.commitmentId,
        amount: data.amount,
        method: data.method,
        reference: data.reference || undefined,
      });
      toast.success("Abono registrado y compromiso marcado como PAGADO");
      setShowAbonoModal(false);
      setSelectedStudent(null);
      fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al registrar abono";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-instituto">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={20} />
            <span className="text-sm font-medium opacity-90">Vencidos</span>
          </div>
          <p className="text-2xl font-bold">${summary?.overdue.amount.toLocaleString() || 0}</p>
          <p className="text-sm opacity-75">{summary?.overdue.count || 0} compromisos</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-instituto">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={20} />
            <span className="text-sm font-medium opacity-90">Vencen Hoy</span>
          </div>
          <p className="text-2xl font-bold">${summary?.today.amount.toLocaleString() || 0}</p>
          <p className="text-sm opacity-75">{summary?.today.count || 0} compromisos</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-instituto">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={20} />
            <span className="text-sm font-medium opacity-90">Próximos 7 días</span>
          </div>
          <p className="text-2xl font-bold">${summary?.upcoming.amount.toLocaleString() || 0}</p>
          <p className="text-sm opacity-75">{summary?.upcoming.count || 0} compromisos</p>
        </div>

        <div className="bg-gradient-to-br from-primary to-primary-light rounded-2xl p-5 text-white shadow-instituto">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw size={20} />
            <span className="text-sm font-medium opacity-90">Total Pendiente</span>
          </div>
          <p className="text-2xl font-bold">${summary?.totalPendingAmount.toLocaleString() || 0}</p>
          <p className="text-sm opacity-75">Cartera total</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex">
            <button
              onClick={() => { setActiveTab("debts"); setCurrentPage(1); }}
              className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${activeTab === "debts"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Cartera Detallada ({totalItems})
            </button>
            {/* Removed Alerts Tab as it required redundant filtering logic not yet supported by new API design effectively without duplication */}
          </div>
        </div>

        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar estudiante o documento..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {activeTab === "debts" && (
          <div className="overflow-x-auto min-h-[300px]">
            {loading ? (
              <div className="flex justify-center items-center h-48 text-gray-400">Cargando cartera...</div>
            ) : (
              <>
                {debts.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 size={48} className="mx-auto text-green-400 mb-4" />
                    <h3 className="text-lg font-bold text-primary mb-2">Sin cartera pendiente</h3>
                    <p className="text-gray-500">No se encontraron estudiantes con saldo pendiente</p>
                  </div>
                ) : (
                  <>
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Estudiante</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Programa</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Progreso Pago</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Pendiente</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Último Pago</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {debts.map((debt) => {
                          const progressPercent = debt.totalProgramValue > 0 ? Math.round((debt.totalPaid / debt.totalProgramValue) * 100) : 0;
                          return (
                            <tr key={debt.studentId} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-bold text-primary">{debt.studentName}</p>
                                  <p className="text-xs text-gray-500">{debt.phone}</p>
                                  <p className="text-xs text-gray-400">{debt.documentNumber}</p>
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
                                      className={`h-full rounded-full ${progressPercent >= 75 ? "bg-green-500" :
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
                                <span className={`text-sm ${debt.daysSinceLastPayment !== null && debt.daysSinceLastPayment > 30
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
                                    href={`https://wa.me/${COUNTRY_CODE_CO}${debt.phone.replace(/\D/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="WhatsApp"
                                  >
                                    <MessageCircle size={18} />
                                  </a>
                                  <button
                                    onClick={() => {
                                      setSelectedStudent(debt);
                                      setShowAbonoModal(true);
                                    }}
                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="Registrar Abono"
                                  >
                                    <DollarSign size={18} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedStudent(debt);
                                      setShowCommitmentModal(true);
                                    }}
                                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                    title="Crear compromiso"
                                  >
                                    <Calendar size={18} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedStudent(debt);
                                      setShowHistorialModal(true);
                                    }}
                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
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
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(totalItems / itemsPerPage)}
                      totalItems={totalItems}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                      onItemsPerPageChange={(items) => { setItemsPerPage(items); setCurrentPage(1); }}
                    />
                  </>
                )}
              </>
            )}
          </div>
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
          onClose={() => { setShowAbonoModal(false); setSelectedStudent(null); }}
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

// Subcomponents omitted for brevity, reusing definitions from previous logic or importing.
// For compilation safety, I must include them or move to separate files.
// I will include condensed versions mainly for placeholders as implementation of modals logic is next step or user responsibility if complex.
// But to match previous content I will include meaningful placeholders.

interface CommitmentModalProps {
  student: StudentDebt;
  onClose: () => void;
  onSubmit: (studentId: string, amount: number, date: Date, comments: string) => void | Promise<void>;
}

function CommitmentModal({ student, onClose, onSubmit }: CommitmentModalProps) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const defaultAmount = Math.min(student.remainingBalance, 500000);

  const [amount, setAmount] = useState<string>(String(defaultAmount));
  const [date, setDate] = useState<string>(todayStr);
  const [comments, setComments] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }
    if (amt > student.remainingBalance) {
      toast.error(`El monto excede el saldo pendiente ($${student.remainingBalance.toLocaleString()})`);
      return;
    }
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      toast.error("Fecha inválida");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(student.studentId, amt, parsedDate, comments);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg max-w-md w-full space-y-4">
        <div>
          <h3 className="font-bold text-lg">Crear Compromiso de Pago</h3>
          <p className="text-sm text-gray-500">{student.studentName} — {student.documentNumber}</p>
          <p className="text-xs text-gray-400 mt-1">
            Saldo pendiente: <span className="font-bold text-red-600">${student.remainingBalance.toLocaleString()}</span>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fecha del compromiso</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={todayStr}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Monto (COP)</label>
          <input
            type="number"
            min={1}
            step={1000}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            maxLength={1000}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            placeholder="Ej: Compromiso confirmado por WhatsApp"
          />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} disabled={submitting} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
            Cancelar
          </button>
          <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            {submitting ? "Creando..." : "Crear compromiso"}
          </button>
        </div>
      </form>
    </div>
  );
}

type AbonoMethod = "BANCOLOMBIA" | "NEQUI" | "DAVIPLATA" | "EFECTIVO" | "OTRO";

interface AbonoModalProps {
  student: StudentDebt;
  onClose: () => void;
  onSubmit: (data: {
    commitmentId: string;
    amount: number;
    method: AbonoMethod;
    reference?: string;
  }) => void | Promise<void>;
}

function AbonoModal({ student, onClose, onSubmit }: AbonoModalProps) {
  const pendingCommitments = (student.commitments ?? []).filter(
    (c) => c.status === "PENDIENTE" || c.status === "EN_COMPROMISO" || c.status === "VENCIDO"
  );

  const [commitmentId, setCommitmentId] = useState<string>(pendingCommitments[0]?.id ?? "");
  const selected = pendingCommitments.find((c) => c.id === commitmentId);
  const expectedAmount = selected ? Number(selected.amount) : 0;

  const [amount, setAmount] = useState<string>(String(expectedAmount || ""));
  const [method, setMethod] = useState<AbonoMethod>("EFECTIVO");
  const [reference, setReference] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selected) setAmount(String(Number(selected.amount)));
  }, [selected]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!commitmentId) {
      toast.error("Seleccione un compromiso");
      return;
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }
    if (amt !== expectedAmount) {
      toast.error(
        `El monto debe ser exactamente $${expectedAmount.toLocaleString()} (pagos parciales no permitidos)`
      );
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ commitmentId, amount: amt, method, reference: reference || undefined });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg max-w-md w-full space-y-4">
        <div>
          <h3 className="font-bold text-lg">Registrar Abono</h3>
          <p className="text-sm text-gray-500">{student.studentName} — {student.documentNumber}</p>
        </div>
        {pendingCommitments.length === 0 ? (
          <p className="text-sm text-gray-600 py-4">Este estudiante no tiene compromisos pendientes.</p>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Compromiso</label>
              <select
                value={commitmentId}
                onChange={(e) => setCommitmentId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {pendingCommitments.map((c) => (
                  <option key={c.id} value={c.id}>
                    {new Date(c.scheduledDate).toLocaleDateString("es-CO")} — ${Number(c.amount).toLocaleString()} ({c.status})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Monto (debe ser exacto)</label>
              <input
                type="number"
                min={1}
                step={1000}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-gray-400 mt-1">Esperado: ${expectedAmount.toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Método</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as AbonoMethod)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="BANCOLOMBIA">Bancolombia</option>
                <option value="NEQUI">Nequi</option>
                <option value="DAVIPLATA">Daviplata</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Referencia (opcional)</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Ej: Transacción #12345"
              />
            </div>
          </>
        )}
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} disabled={submitting} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
            Cancelar
          </button>
          {pendingCommitments.length > 0 && (
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
              {submitting ? "Registrando..." : "Registrar abono"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

interface HistorialCompromisosModalProps {
  student: StudentDebt;
  onClose: () => void;
}

function HistorialCompromisosModal({ student, onClose }: HistorialCompromisosModalProps) {
  const [items, setItems] = useState<StudentCommitment[]>(student.commitments ?? []);
  const { cancel, loading: canceling } = useCancelCommitment();

  const handleCancel = async (id: string) => {
    if (!confirm("¿Cancelar este compromiso? Esta acción no se puede deshacer.")) return;
    try {
      await cancel(id);
      setItems((prev) => prev.filter((c) => c.id !== id));
      toast.success("Compromiso cancelado");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cancelar";
      toast.error(message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="font-bold text-lg mb-1">Historial de Compromisos</h3>
        <p className="text-sm text-gray-500 mb-4">{student.studentName}</p>
        <div className="max-h-72 overflow-y-auto mb-4 divide-y">
          {items.length ? (
            items.map((c) => (
              <div key={c.id} className="py-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {new Date(c.scheduledDate).toLocaleDateString("es-CO")} — ${Number(c.amount).toLocaleString()}
                  </p>
                  <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                    c.status === "PAGADO"
                      ? "bg-green-100 text-green-700"
                      : c.status === "EN_COMPROMISO"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {c.status}
                  </span>
                  {c.comments && <p className="text-xs text-gray-500 mt-1 truncate">{c.comments}</p>}
                </div>
                {c.status !== "PAGADO" && (
                  <button
                    onClick={() => handleCancel(c.id)}
                    disabled={canceling}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Cancelar compromiso"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">No hay compromisos registrados.</p>
          )}
        </div>
        <button onClick={onClose} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
          Cerrar
        </button>
      </div>
    </div>
  );
}

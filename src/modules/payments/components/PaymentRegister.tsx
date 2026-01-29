"use client";

import { useState, useEffect } from "react";
import { Search, CheckCircle, AlertCircle, DollarSign, Calendar, MessageSquare, ArrowRight, FileText } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import type { StudentWithRelations } from "@/modules/students/types";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency, parseCurrency } from "@/lib/utils";

interface Commitment {
    id: string;
    scheduledDate: string | Date;
    amount: number;
    status: string;
    student: {
        id: string;
        fullName: string;
        phone: string;
        program?: { name: string };
    };
}

interface PaymentRegisterProps {
    preSelectedStudent?: StudentWithRelations | null;
}

export function PaymentRegister({ preSelectedStudent }: PaymentRegisterProps) {
    const { user } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [student, setStudent] = useState<StudentWithRelations | null>(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: "success" | "error"; text: string; receiptId?: string } | null>(null);
    const [paymentData, setPaymentData] = useState({
        amount: 0,
        method: "BANCOLOMBIA",
        comments: "",
    });

    const [pendingCommitments, setPendingCommitments] = useState<Commitment[]>([]);
    const [filterRange, setFilterRange] = useState<"all" | "today" | "week" | "month">("week");
    const [loadingTable, setLoadingTable] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState<{
        moduleValue: number;
        minimumPayment: number;
        remainingBalance: number;
        currentModule: number;
        modulesCount: number;
    } | null>(null);

    // Cargar compromisos al montar y cuando cambie el filtro
    useEffect(() => {
        fetchPendingCommitments();
    }, [filterRange]);

    useEffect(() => {
        if (preSelectedStudent) {
            handleSelectStudent(preSelectedStudent);
        }
    }, [preSelectedStudent]);

    const fetchPendingCommitments = async () => {
        setLoadingTable(true);
        try {
            // Calculamos fechas para el API
            let startDate: Date | undefined;
            let endDate: Date | undefined;
            const now = new Date();

            if (filterRange === "today") {
                startDate = new Date(now.setHours(0, 0, 0, 0));
                endDate = new Date(now.setHours(23, 59, 59, 999));
            } else if (filterRange === "week") {
                startDate = startOfWeek(now, { weekStartsOn: 1 });
                endDate = endOfWeek(now, { weekStartsOn: 1 });
            } else if (filterRange === "month") {
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
            }

            const url = new URL("/api/commitments", window.location.origin);
            url.searchParams.append("status", "PENDIENTE");
            if (startDate) url.searchParams.append("startDate", startDate.toISOString());
            if (endDate) url.searchParams.append("endDate", endDate.toISOString());

            const res = await fetch(url.toString());
            const data = await res.json();
            if (data.success) {
                setPendingCommitments(data.data.commitments);
            }
        } catch (error) {
            console.error("Error loading commitments:", error);
        } finally {
            setLoadingTable(false);
        }
    };

    const searchStudent = async (idOrTerm?: string, suggestedAmount?: number) => {
        const term = idOrTerm || searchTerm;
        if (!term) return;
        setLoading(true);
        setStudent(null);
        setMsg(null);
        try {
            const res = await fetch(`/api/students?search=${encodeURIComponent(term)}`);
            const data = await res.json();
            if (data.success && data.data.students.length > 0) {
                const found = data.data.students[0];
                handleSelectStudent(found, suggestedAmount);
            } else {
                setMsg({ type: "error", text: "Estudiante no encontrado" });
            }
        } catch {
            setMsg({ type: "error", text: "Error al buscar estudiante" });
        } finally {
            setLoading(false);
        }
    };

    const handleSelectStudent = async (found: StudentWithRelations, suggestedAmount?: number) => {
        setStudent(found);
        setSearchTerm(found.documentNumber);
        setPaymentInfo(null);

        // Fetch payment info from API
        try {
            const res = await fetch(`/api/students/${found.id}/payment-info`);
            const data = await res.json();
            if (data.success) {
                setPaymentInfo({
                    moduleValue: data.data.moduleValue,
                    minimumPayment: data.data.minimumPayment,
                    remainingBalance: data.data.remainingBalance,
                    currentModule: data.data.currentModule,
                    modulesCount: data.data.modulesCount,
                });

                // Pre-fill with suggested amount or minimum payment
                const amount = suggestedAmount || data.data.minimumPayment;
                setPaymentData(prev => ({ ...prev, amount }));
            }
        } catch (error) {
            console.error("Error fetching payment info:", error);
            // Fallback to old logic
            if (suggestedAmount) {
                setPaymentData(prev => ({ ...prev, amount: suggestedAmount }));
            } else if (!found.matriculaPaid) {
                setPaymentData(prev => ({ ...prev, amount: Number(found.initialPayment) }));
            } else {
                setPaymentData(prev => ({ ...prev, amount: 0 }));
            }
        }

        // Scroll al formulario
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleRegisterPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student) return;
        setLoading(true);
        setMsg(null);

        try {
            const res = await fetch("/api/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: student.id,
                    registeredById: user?.id || "unknown",
                    amount: Number(paymentData.amount),
                    method: paymentData.method,
                    comments: paymentData.comments,
                    paymentDate: new Date(),
                    // El backend decide si es matricula o modulo
                })
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error);

            setMsg({
                type: "success",
                text: "Pago registrado exitosamente",
                receiptId: result.data?.receiptNumber || result.data?.id
            });

            // Refrescar tabla si el pago afecta compromisos
            fetchPendingCommitments();

            // No reseteamos el estudiante inmediatamente para que vea el botón de WhatsApp
            // Pero sí limpiamos el monto
            setPaymentData(prev => ({ ...prev, amount: 0, comments: "" }));

        } catch (err) {
            setMsg({ type: "error", text: err instanceof Error ? err.message : "Error al registrar" });
        } finally {
            setLoading(false);
        }
    };

    const sendWhatsApp = () => {
        if (!student || !msg?.receiptId) return;

        const message = `*RECIBO DE PAGO - INSTITUTO*%0A%0A` +
            `Hola *${student.fullName}*,%0A` +
            `Hemos recibido exitosamente tu pago.%0A%0A` +
            `*Monto:* $${Number(paymentData.amount).toLocaleString()}%0A` +
            `*Recibo No:* ${msg.receiptId}%0A` +
            `*Fecha:* ${format(new Date(), "dd/MM/yyyy")}%0A%0A` +
            `¡Gracias por confiar en nosotros!`;

        const phone = student.phone.replace(/\D/g, "");
        const finalPhone = phone.startsWith("57") ? phone : `57${phone}`;

        window.open(`https://wa.me/${finalPhone}?text=${message}`, "_blank");
    };

    return (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Buscador y Formulario Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
                    <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-xs sm:text-sm font-bold text-primary uppercase mb-3 sm:mb-4 flex items-center gap-2">
                            <Search size={16} /> Buscar Estudiante
                        </h3>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Documento o nombre..."
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-primary transition-all font-medium text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && searchStudent()}
                            />
                            <button
                                onClick={() => searchStudent()}
                                disabled={loading}
                                className="w-full py-2.5 sm:py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 text-sm"
                            >
                                {loading ? "Buscando..." : "Buscar"}
                            </button>
                        </div>
                    </div>

                    {student && (
                        <div className="bg-primary text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl animate-fade-in-up">
                            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0">
                                    {student.fullName.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold leading-tight text-sm sm:text-base truncate">{student.fullName}</h3>
                                    <p className="text-blue-200 text-xs">{student.documentNumber}</p>
                                </div>
                            </div>
                            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm border-t border-white/10 pt-3 sm:pt-4">
                                <div className="flex justify-between gap-2">
                                    <span className="opacity-70">Programa</span>
                                    <span className="font-medium text-right truncate max-w-[120px] sm:max-w-none">{student.program.name}</span>
                                </div>
                                {paymentInfo && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="opacity-70">Valor Módulo</span>
                                            <span className="font-bold text-emerald-300">${paymentInfo.moduleValue.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="opacity-70">Módulo</span>
                                            <span className="font-medium">{paymentInfo.currentModule} / {paymentInfo.modulesCount}</span>
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-between">
                                    <span className="opacity-70">Saldo</span>
                                    <span className="font-bold text-orange-300">${paymentInfo ? paymentInfo.remainingBalance.toLocaleString() : Number(student.remainingBalance).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm sm:shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 hidden sm:block">
                            <DollarSign size={120} />
                        </div>

                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-primary mb-4 sm:mb-6 flex items-center gap-2">
                            Registrar Recaudo
                        </h3>

                        {msg && (
                            <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4 animate-bounce-in">
                                <div className={`p-3 sm:p-4 rounded-xl flex items-center gap-2 sm:gap-3 ${msg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                                    {msg.type === "success" ? <CheckCircle size={18} className="flex-shrink-0" /> : <AlertCircle size={18} className="flex-shrink-0" />}
                                    <span className="font-bold text-sm sm:text-base">{msg.text}</span>
                                </div>
                                {msg.type === "success" && (
                                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                        <button
                                            onClick={sendWhatsApp}
                                            className="flex items-center justify-center gap-1.5 sm:gap-3 py-3 sm:py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] text-xs sm:text-base"
                                        >
                                            <MessageSquare size={16} className="sm:w-5 sm:h-5" />
                                            <span className="hidden xs:inline">Enviar</span> WhatsApp
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (msg.receiptId) {
                                                    window.open(`/api/receipts/${msg.receiptId}/download`, "_blank");
                                                }
                                            }}
                                            className="flex items-center justify-center gap-1.5 sm:gap-3 py-3 sm:py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] text-xs sm:text-base"
                                        >
                                            <FileText size={16} className="sm:w-5 sm:h-5" />
                                            <span className="hidden xs:inline">Descargar</span> PDF
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleRegisterPayment} className="space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase mb-1.5 sm:mb-2">Valor a Recibir *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-lg sm:text-xl">$</span>
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50 border-2 border-gray-100 rounded-xl sm:rounded-2xl focus:border-primary focus:outline-none font-bold text-xl sm:text-2xl text-primary transition-all"
                                            value={formatCurrency(paymentData.amount)}
                                            onChange={e => setPaymentData({ ...paymentData, amount: parseCurrency(e.target.value) })}
                                            onFocus={e => e.target.select()}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase mb-1.5 sm:mb-2">Medio de Pago</label>
                                    <select
                                        className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-gray-50 border-2 border-gray-100 rounded-xl sm:rounded-2xl focus:border-primary focus:outline-none font-bold text-gray-600 text-sm sm:text-base"
                                        value={paymentData.method}
                                        onChange={e => setPaymentData({ ...paymentData, method: e.target.value })}
                                    >
                                        <option value="BANCOLOMBIA">Bancolombia</option>
                                        <option value="NEQUI">Nequi</option>
                                        <option value="DAVIPLATA">Daviplata</option>
                                        <option value="EFECTIVO">Efectivo</option>
                                        <option value="OTRO">Otro</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase mb-1.5 sm:mb-2">Notas / Observaciones</label>
                                <textarea
                                    className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-gray-50 border-2 border-gray-100 rounded-xl sm:rounded-2xl focus:border-primary focus:outline-none text-sm sm:text-base"
                                    rows={2}
                                    placeholder="Ej: Pago cuota 3 ó Abono parcial"
                                    value={paymentData.comments}
                                    onChange={e => setPaymentData({ ...paymentData, comments: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !student || paymentData.amount <= 0}
                                className="w-full py-3.5 sm:py-5 bg-gradient-instituto text-white font-black rounded-xl sm:rounded-2xl shadow-xl hover:shadow-primary/40 transition-all disabled:opacity-30 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-lg"
                            >
                                {loading ? "Procesando..." : "CONFIRMAR TRANSACCIÓN"}
                                {!loading && <ArrowRight size={18} className="sm:w-5 sm:h-5" />}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Tabla de Vencimientos */}
            <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <h3 className="font-extrabold text-primary flex items-center gap-2 text-sm sm:text-base">
                        <Calendar className="text-blue-500" size={18} />
                        Pagos por Vencer
                    </h3>
                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 overflow-x-auto">
                        {(["today", "week", "month"] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setFilterRange(range)}
                                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${filterRange === range
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                {range === "today" ? "Hoy" : range === "week" ? "Semana" : "Mes"}
                            </button>
                        ))}
                    </div>
                </div>

                {loadingTable ? (
                    <div className="p-8 sm:p-12 text-center text-gray-400 animate-pulse text-sm">Cargando próximos pagos...</div>
                ) : pendingCommitments.length === 0 ? (
                    <div className="p-8 sm:p-12 text-center text-gray-400 text-sm">
                        No hay pagos programados para este periodo.
                    </div>
                ) : (
                    <>
                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {pendingCommitments.map((c) => (
                                <div key={c.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-bold text-primary text-sm truncate">{c.student.fullName}</h4>
                                            <p className="text-[10px] text-gray-400">{c.student.phone}</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md flex-shrink-0 ${new Date(c.scheduledDate) < new Date() ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                                            }`}>
                                            {format(new Date(c.scheduledDate), "dd MMM", { locale: es })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-3 truncate">{c.student.program?.name || "Sin programa"}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="font-black text-primary text-base">${Number(c.amount).toLocaleString()}</span>
                                        <button
                                            onClick={() => searchStudent(c.student.fullName, c.amount)}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all"
                                        >
                                            <DollarSign size={14} />
                                            Pagar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Estudiante</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Programa</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Vencimiento</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {pendingCommitments.map((c) => (
                                        <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-primary">{c.student.fullName}</div>
                                                <div className="text-[10px] text-gray-400">{c.student.phone}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">{c.student.program?.name || "Sin programa"}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-md ${new Date(c.scheduledDate) < new Date() ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                                                    }`}>
                                                    {format(new Date(c.scheduledDate), "dd MMM", { locale: es })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-black text-primary">${Number(c.amount).toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => searchStudent(c.student.fullName, c.amount)}
                                                    className="p-2 bg-white border border-gray-200 rounded-lg text-primary hover:bg-primary hover:text-white transition-all shadow-sm group-hover:shadow-md"
                                                    title="Cargar para pagar"
                                                >
                                                    <DollarSign size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

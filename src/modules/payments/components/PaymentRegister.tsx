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

    const handleSelectStudent = (found: StudentWithRelations, suggestedAmount?: number) => {
        setStudent(found);
        setSearchTerm(found.documentNumber);

        if (suggestedAmount) {
            setPaymentData(prev => ({ ...prev, amount: suggestedAmount }));
        } else {
            // Lógica por defecto: si no pago matricula, sugerir matricula
            if (!found.matriculaPaid) {
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
                    advisorId: user?.id || "unknown",
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
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Buscador y Formulario Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-primary uppercase mb-4 flex items-center gap-2">
                            <Search size={16} /> Buscar Estudiante
                        </h3>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Documento o nombre..."
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-primary transition-all font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && searchStudent()}
                            />
                            <button
                                onClick={() => searchStudent()}
                                disabled={loading}
                                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                {loading ? "Buscando..." : "Buscar"}
                            </button>
                        </div>
                    </div>

                    {student && (
                        <div className="bg-primary text-white p-6 rounded-2xl shadow-xl animate-fade-in-up">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
                                    {student.fullName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold leading-tight">{student.fullName}</h3>
                                    <p className="text-blue-200 text-xs">{student.documentNumber}</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm border-t border-white/10 pt-4">
                                <div className="flex justify-between">
                                    <span className="opacity-70">Programa</span>
                                    <span className="font-medium text-right">{student.program.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="opacity-70">Saldo</span>
                                    <span className="font-bold text-orange-300">${Number(student.remainingBalance).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <DollarSign size={120} />
                        </div>

                        <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                            Registrar Recaudo
                        </h3>

                        {msg && (
                            <div className="mb-6 space-y-4 animate-bounce-in">
                                <div className={`p-4 rounded-xl flex items-center gap-3 ${msg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                                    {msg.type === "success" ? <CheckCircle size={22} /> : <AlertCircle size={22} />}
                                    <span className="font-bold">{msg.text}</span>
                                </div>
                                {msg.type === "success" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button
                                            onClick={sendWhatsApp}
                                            className="flex items-center justify-center gap-3 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02]"
                                        >
                                            <MessageSquare size={20} />
                                            Enviar WhatsApp
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (msg.receiptId) {
                                                    // Buscamos si msg.receiptId es el ID o el Numero. 
                                                    // Preferimos el ID del objeto devuelto en result.data.id
                                                    window.open(`/api/receipts/${msg.receiptId}/download`, "_blank");
                                                }
                                            }}
                                            className="flex items-center justify-center gap-3 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02]"
                                        >
                                            <FileText size={20} />
                                            Descargar PDF
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleRegisterPayment} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Valor a Recibir *</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-xl">$</span>
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-10 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary focus:outline-none font-bold text-2xl text-primary transition-all"
                                            value={formatCurrency(paymentData.amount)}
                                            onChange={e => setPaymentData({ ...paymentData, amount: parseCurrency(e.target.value) })}
                                            onFocus={e => e.target.select()}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Medio de Pago</label>
                                    <select
                                        className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary focus:outline-none font-bold text-gray-600"
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
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Notas / Observaciones</label>
                                <textarea
                                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary focus:outline-none"
                                    rows={2}
                                    placeholder="Ej: Pago cuota 3 ó Abono parcial"
                                    value={paymentData.comments}
                                    onChange={e => setPaymentData({ ...paymentData, comments: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !student || paymentData.amount <= 0}
                                className="w-full py-5 bg-gradient-instituto text-white font-black rounded-2xl shadow-xl hover:shadow-primary/40 transition-all disabled:opacity-30 flex items-center justify-center gap-3 text-lg"
                            >
                                {loading ? "Procesando..." : "CONFIRMAR TRANSACCIÓN"}
                                {!loading && <ArrowRight size={20} />}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Tabla de Vencimientos */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="font-extrabold text-primary flex items-center gap-2">
                        <Calendar className="text-blue-500" size={20} />
                        Pagos por Vencer
                    </h3>
                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                        {(["today", "week", "month"] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setFilterRange(range)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterRange === range
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                {range === "today" ? "Hoy" : range === "week" ? "Esta Semana" : "Este Mes"}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loadingTable ? (
                        <div className="p-12 text-center text-gray-400 animate-pulse">Cargando próximos pagos...</div>
                    ) : pendingCommitments.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            No hay pagos programados para este periodo.
                        </div>
                    ) : (
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
                    )}
                </div>
            </div>
        </div>
    );
}

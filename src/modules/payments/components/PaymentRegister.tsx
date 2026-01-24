"use client";

import { useState } from "react";
import { Search, CheckCircle, AlertCircle, DollarSign } from "lucide-react";
import type { StudentWithRelations } from "@/modules/students/types";

export function PaymentRegister() {
    const [searchTerm, setSearchTerm] = useState("");
    const [student, setStudent] = useState<StudentWithRelations | null>(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [paymentData, setPaymentData] = useState({
        amount: 0,
        method: "BANCOLOMBIA",
        comments: "",
    });

    const searchStudent = async () => {
        if (!searchTerm) return;
        setLoading(true);
        setStudent(null);
        setMsg(null);
        try {
            const res = await fetch(`/api/students?search=${encodeURIComponent(searchTerm)}`);
            const data = await res.json();
            if (data.success && data.data.students.length > 0) {
                // Tomamos el primero por simplicidad en este ejemplo, idealmente mostrar lista si hay varios
                const found = data.data.students[0];
                setStudent(found);
                calculatePayment(found);
            } else {
                setMsg({ type: "error", text: "Estudiante no encontrado" });
            }
        } catch {
            setMsg({ type: "error", text: "Error al buscar estudiante" });
        } finally {
            setLoading(false);
        }
    };

    const calculatePayment = (std: StudentWithRelations) => {
        // Nota: El programa está disponible para uso futuro cuando el backend provea más datos
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _program = std.program;
        // Calculamos valores desde properties si existen, o fallback
        // Nota: StudentWithRelations viene del backend actual, deberia tener los campos calculados si el backend los envia
        // Pero si no, usaremos lógica local o asumimos que el backend envia `totalProgramValue` y `initialPayment`

        // PERO: Necesitamos saber el VALOR DEL MODULO. 
        // Como el objeto `program` anidado en `StudentWithRelations` es simple ({id, name}), 
        // necesitamos fetch del detalle completo del estudiante o programa si queremos el valor exacto.
        // O mejor: usar la info que ya tenemos en `student` si agregamos campos al include del backend.

        // Por ahora, para MVP: Asumimos que el usuario conoce el valor o lo calcula.
        // MEJORA: Backend debería enviar `nextPaymentAmount` sugerido.

        // Si no pagó matrícula:
        if (!std.matriculaPaid) {
            setPaymentData(prev => ({ ...prev, amount: std.initialPayment })); // Asumiendo initialPayment es valor matricula
        } else {
            // Valor modulo aproximado o manual
            setPaymentData(prev => ({ ...prev, amount: 0 }));
        }
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
                    advisorId: "user_placeholder_id", // TODO
                    amount: Number(paymentData.amount),
                    method: paymentData.method,
                    comments: paymentData.comments,
                    paymentDate: new Date(),
                    // El backend decide si es matricula o modulo
                })
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error);

            setMsg({ type: "success", text: "Pago registrado exitosamente" });
            setStudent(null);
            setSearchTerm("");
            setPaymentData({ amount: 0, method: "BANCOLOMBIA", comments: "" });

        } catch (err) {
            setMsg({ type: "error", text: err instanceof Error ? err.message : "Error al registrar" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Buscador */}
            <div className="flex gap-4 mb-8">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por documento o nombre..."
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#1e3a5f] transition-all text-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && searchStudent()}
                    />
                </div>
                <button
                    onClick={searchStudent}
                    disabled={loading}
                    className="px-8 bg-[#1e3a5f] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                >
                    {loading ? "Buscando..." : "Buscar"}
                </button>
            </div>

            {msg && (
                <div className={`p-4 rounded-xl mb-6 flex items-center gap-2 ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {msg.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {msg.text}
                </div>
            )}

            {student && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up">
                    {/* Info Estudiante (Izquierda) */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-20 h-20 bg-[#1e3a5f]/10 rounded-full flex items-center justify-center text-3xl font-bold text-[#1e3a5f] mb-3">
                                    {student.fullName.charAt(0)}
                                </div>
                                <h3 className="font-bold text-lg text-[#1e3a5f]">{student.fullName}</h3>
                                <p className="text-gray-500 text-sm">{student.documentNumber}</p>
                                <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${student.status === "MATRICULADO" ? "bg-blue-50 text-blue-700" : "bg-yellow-50 text-yellow-700"
                                    }`}>
                                    {student.status}
                                </span>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Programa</span>
                                    <span className="font-medium">{student.program.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Módulo Actual</span>
                                    <span className="font-bold text-[#1e3a5f]">{student.currentModule}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Saldo Pendiente</span>
                                    <span className="font-bold text-orange-600">${student.remainingBalance.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Estado Próximo Pago */}
                        <div className={`p-6 rounded-2xl border ${!student.matriculaPaid ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"}`}>
                            <h4 className={`font-bold flex items-center gap-2 mb-2 ${!student.matriculaPaid ? "text-amber-800" : "text-blue-800"}`}>
                                <AlertCircle size={18} />
                                {!student.matriculaPaid ? "Pendiente Matrícula" : "Próximo Vencimiento"}
                            </h4>
                            <p className="text-sm opacity-80 mb-2">
                                {!student.matriculaPaid
                                    ? "El estudiante debe cancelar la matrícula para iniciar."
                                    : `Compromiso para el ${new Date().toLocaleDateString()} (Simulado)`}
                            </p>
                            {!student.matriculaPaid && (
                                <div className="font-bold text-lg text-amber-900">
                                    ${student.initialPayment.toLocaleString()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Formulario Pago (Derecha) */}
                    <div className="md:col-span-2">
                        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg">
                            <h3 className="text-xl font-bold text-[#1e3a5f] mb-6 flex items-center gap-2">
                                <DollarSign /> Registrar Nuevo Recaudo
                            </h3>

                            <form onSubmit={handleRegisterPayment} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Valor a Pagar *</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                            <input
                                                type="number"
                                                className="w-full pl-8 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#1e3a5f] font-bold text-xl text-[#1e3a5f]"
                                                value={paymentData.amount}
                                                onChange={e => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Método de Pago *</label>
                                        <select
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#1e3a5f]"
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
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Observaciones</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#1e3a5f]"
                                        rows={3}
                                        placeholder="Comentarios adicionales..."
                                        value={paymentData.comments}
                                        onChange={e => setPaymentData({ ...paymentData, comments: e.target.value })}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || paymentData.amount <= 0}
                                    className="w-full py-4 bg-gradient-instituto text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all disabled:opacity-50 text-lg"
                                >
                                    {loading ? "Procesando..." : "Confirmar Pago"}
                                </button>

                                <p className="text-center text-xs text-gray-400">
                                    Se generará automáticamente el recibo y se actualizará el estado de cuenta.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

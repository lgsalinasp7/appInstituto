"use client";

import { useState, useEffect } from "react";
import { Calendar, Phone, CheckCircle } from "lucide-react";

interface Commitment {
    id: string;
    amount: number;
    scheduledDate: string;
    moduleNumber: number;
    status: string;
    student: {
        id: string;
        fullName: string;
        phone: string;
    };
}

export function CarteraView() {
    const [commitments, setCommitments] = useState<Commitment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCartera = async () => {
        setLoading(true);
        try {
            // Traer solo pendientes
            const res = await fetch("/api/commitments?status=PENDIENTE");
            const data = await res.json();
            if (data.success) {
                setCommitments(data.data.commitments);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCartera();
    }, []);

    const getDaysOverdue = (dateStr: string) => {
        const due = new Date(dateStr);
        const today = new Date();
        const diffTime = today.getTime() - due.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h3 className="text-base sm:text-lg font-bold text-primary">Compromisos Pendientes</h3>
                <span className="bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold self-start sm:self-auto">
                    Total: ${commitments.reduce((acc, c) => acc + Number(c.amount), 0).toLocaleString()}
                </span>
            </div>

            {loading ? (
                <div className="text-center py-8 sm:py-10 text-gray-400 text-sm">Cargando cartera...</div>
            ) : commitments.length === 0 ? (
                <div className="text-center py-8 sm:py-10 flex flex-col items-center gap-2">
                    <CheckCircle size={32} className="sm:w-10 sm:h-10 text-green-500" />
                    <p className="text-gray-500 font-medium text-sm sm:text-base">¡Excelente! No hay cartera pendiente.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {commitments.map(commitment => {
                        const daysOverdue = getDaysOverdue(commitment.scheduledDate);
                        const isOverdue = daysOverdue > 0;

                        return (
                            <div key={commitment.id} className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-l-4 shadow-sm bg-white ${isOverdue ? "border-red-500" : "border-yellow-500"}`}>
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <h4 className="font-bold text-primary text-sm sm:text-base truncate">{commitment.student.fullName}</h4>
                                    <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded font-bold flex-shrink-0 ${isOverdue ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                                        {isOverdue ? `${daysOverdue}d mora` : "Pendiente"}
                                    </span>
                                </div>

                                <div className="space-y-1 mb-3">
                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                        <Phone size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                                        <span className="truncate">{commitment.student.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                        <Calendar size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                                        Vence: {new Date(commitment.scheduledDate).toLocaleDateString()}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-600 pl-5">
                                        Módulo {commitment.moduleNumber}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                    <span className="font-bold text-base sm:text-lg text-primary">${Number(commitment.amount).toLocaleString()}</span>
                                    <button className="text-xs font-bold text-blue-600 hover:text-blue-800 px-2 py-1 hover:bg-blue-50 rounded transition-colors">
                                        Gestionar
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

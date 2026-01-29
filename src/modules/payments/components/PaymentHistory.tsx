"use client";

import { useState, useEffect } from "react";
import { Search, FileText } from "lucide-react";
import type { PaymentWithRelations } from "@/modules/payments/types";

export function PaymentHistory() {
    const [payments, setPayments] = useState<PaymentWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        search: ""
    });

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append("startDate", filters.startDate);
            if (filters.endDate) params.append("endDate", filters.endDate);
            // Nota: El endpoint actual no soporta filtro 'search' general en payments, 
            // pero asumiremos que lo filtraremos en cliente o lo implementaremos después

            const res = await fetch(`/api/payments?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setPayments(data.data.payments);
            }
        } catch (err) {
            console.error("Error fetching payments", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []); // Cargar al inicio y cuando cambien filtros (si agregamos dependency)

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        fetchPayments();
    };

    const filteredPayments = payments.filter(p => filters.search ? (
        p.student.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.receiptNumber.toLowerCase().includes(filters.search.toLowerCase())
    ) : true);

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Filtros */}
            <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="sm:col-span-2 lg:col-span-1">
                        <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Buscar</label>
                        <div className="relative mt-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Estudiante o Recibo..."
                                className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                                value={filters.search}
                                onChange={e => handleFilterChange("search", e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Desde</label>
                        <input
                            type="date"
                            className="w-full mt-1 px-3 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                            value={filters.startDate}
                            onChange={e => handleFilterChange("startDate", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Hasta</label>
                        <input
                            type="date"
                            className="w-full mt-1 px-3 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                            value={filters.endDate}
                            onChange={e => handleFilterChange("endDate", e.target.value)}
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={applyFilters}
                            className="w-full px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-all text-sm"
                        >
                            Filtrar
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="text-center py-8 sm:py-12 text-gray-400 text-sm">Cargando historial...</div>
                ) : filteredPayments.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 text-gray-400 text-sm">No se encontraron pagos</div>
                ) : (
                    <>
                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {filteredPayments.map(payment => (
                                <div key={payment.id} className="p-4 hover:bg-gray-50/50">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-bold text-primary text-sm truncate">{payment.student.fullName}</h4>
                                            <p className="text-[10px] text-gray-400">{payment.student.documentNumber}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold flex-shrink-0 ${payment.paymentType === "MATRICULA" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
                                            }`}>
                                            {payment.paymentType || "PAGO"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                        <span className="font-mono">{payment.receiptNumber}</span>
                                        <span>•</span>
                                        <span>{new Date(payment.paymentDate).toLocaleDateString()}</span>
                                        {payment.moduleNumber && (
                                            <>
                                                <span>•</span>
                                                <span>Módulo {payment.moduleNumber}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-primary text-base">${payment.amount.toLocaleString()}</span>
                                        <button
                                            onClick={() => window.open(`/api/receipts/${payment.id}/download`, "_blank")}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-primary text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            <FileText size={14} />
                                            Recibo
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Recibo</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Fecha</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Estudiante</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Concepto</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Valor</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredPayments.map(payment => (
                                        <tr key={payment.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 font-mono text-sm text-gray-600">{payment.receiptNumber}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(payment.paymentDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-primary text-sm">{payment.student.fullName}</div>
                                                <div className="text-xs text-gray-400">{payment.student.documentNumber}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${payment.paymentType === "MATRICULA" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
                                                    }`}>
                                                    {payment.paymentType || "PAGO"}
                                                </span>
                                                {payment.moduleNumber && (
                                                    <span className="ml-2 text-xs text-gray-500">Módulo {payment.moduleNumber}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-primary">
                                                ${payment.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => window.open(`/api/receipts/${payment.id}/download`, "_blank")}
                                                    className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"
                                                    title="Descargar Recibo"
                                                >
                                                    <FileText size={18} />
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

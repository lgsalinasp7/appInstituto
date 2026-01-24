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

    return (
        <div>
            {/* Filtros */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-gray-500 uppercase">Buscar</label>
                    <div className="relative mt-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Estudiante o Recibo..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e3a5f]"
                            value={filters.search}
                            onChange={e => handleFilterChange("search", e.target.value)} // Filtro cliente por ahora
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Desde</label>
                    <input
                        type="date"
                        className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e3a5f]"
                        value={filters.startDate}
                        onChange={e => handleFilterChange("startDate", e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Hasta</label>
                    <input
                        type="date"
                        className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e3a5f]"
                        value={filters.endDate}
                        onChange={e => handleFilterChange("endDate", e.target.value)}
                    />
                </div>

                <button
                    onClick={applyFilters}
                    className="px-6 py-2.5 bg-[#1e3a5f] text-white font-bold rounded-lg hover:opacity-90 transition-all"
                >
                    Filtrar
                </button>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-8 text-gray-400">Cargando historial...</td></tr>
                        ) : payments.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-8 text-gray-400">No se encontraron pagos</td></tr>
                        ) : (
                            payments
                                .filter(p => filters.search ? (
                                    p.student.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
                                    p.receiptNumber.toLowerCase().includes(filters.search.toLowerCase())
                                ) : true)
                                .map(payment => (
                                    <tr key={payment.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-mono text-sm text-gray-600">{payment.receiptNumber}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(payment.paymentDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-[#1e3a5f] text-sm">{payment.student.fullName}</div>
                                            <div className="text-xs text-gray-400">{payment.student.documentNumber}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${payment.paymentType === "MATRICULA" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
                                                }`}>
                                                {payment.paymentType || "PAGO"} {/* paymentType might be missing in older records or unsaved types */}
                                            </span>
                                            {payment.moduleNumber && (
                                                <span className="ml-2 text-xs text-gray-500">Módulo {payment.moduleNumber}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-[#1e3a5f]">
                                            ${payment.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="text-[#1e3a5f] hover:bg-[#1e3a5f]/10 p-2 rounded-lg transition-colors" title="Descargar Recibo">
                                                <FileText size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

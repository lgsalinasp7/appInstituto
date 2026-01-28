"use client";

import { useState, useEffect, useCallback } from "react";
import {
    PieChart,
    Users,
    TrendingUp,
    Download,
    AlertCircle
} from "lucide-react";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart as RePieChart,
    Pie
} from "recharts";

interface DailyRevenue {
    date: string;
    amount: number;
}

interface FinancialData {
    totalRevenue: number;
    averagePayment: number;
    pendingAmount: number;
    dailyRevenue: DailyRevenue[];
}

interface AgingBracket {
    label: string;
    amount: number;
    count: number;
}

interface AgingData {
    brackets: AgingBracket[];
    totalOverdue: number;
}

interface AdvisorData {
    advisorId: string;
    advisorName: string;
    totalStudents: number;
    totalCollected: number;
    collectionRate: number;
    revenueThisMonth: number;
}

const COLORS = ["#10b981", "#f59e0b", "#f97316", "#ef4444"];

export default function ReportesPage() {
    const [activeTab, setActiveTab] = useState<"financiero" | "cartera" | "asesores">("financiero");
    const [financialData, setFinancialData] = useState<FinancialData | null>(null);
    const [agingData, setAgingData] = useState<AgingData | null>(null);
    const [advisorsData, setAdvisorsData] = useState<AdvisorData[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ADVISORS_PER_PAGE = 10;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === "financiero") {
                const res = await fetch("/api/reports/financial");
                const data = await res.json();
                if (data.success) setFinancialData(data.data);
            } else if (activeTab === "cartera") {
                const res = await fetch("/api/reports/portfolio-aging");
                const data = await res.json();
                if (data.success) setAgingData(data.data);
            } else if (activeTab === "asesores") {
                const res = await fetch("/api/reports/advisors");
                const data = await res.json();
                if (data.success) setAdvisorsData(data.data);
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="space-y-6">
            <DashboardHeader
                title="Reportes Detallados"
                subtitle="Analiza el rendimiento financiero y operativo"
            >
                <div className="flex gap-3">
                    <button
                        onClick={() => window.open("/api/reports/payments/export", "_blank")}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all"
                    >
                        <Download size={20} />
                        Exportar Excel
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-[#1e3a5f] rounded-xl font-bold hover:bg-gray-50 transition-all">
                        <Download size={20} />
                        Exportar PDF
                    </button>
                </div>
            </DashboardHeader>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-xl w-full md:w-fit">
                <button
                    onClick={() => setActiveTab("financiero")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "financiero"
                        ? "bg-white text-[#1e3a5f] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <TrendingUp size={18} />
                    Financiero
                </button>
                <button
                    onClick={() => setActiveTab("cartera")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "cartera"
                        ? "bg-white text-[#1e3a5f] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <PieChart size={18} />
                    Cartera (Edades)
                </button>
                <button
                    onClick={() => setActiveTab("asesores")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "asesores"
                        ? "bg-white text-[#1e3a5f] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <Users size={18} />
                    Asesores
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-400">Cargando datos...</div>
                ) : (
                    <>
                        {activeTab === "financiero" && financialData && (
                            <div className="space-y-8 animate-fade-in-up">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                                        <p className="text-sm font-bold text-emerald-600 uppercase">Total Recaudado</p>
                                        <p className="text-2xl font-black text-emerald-900 mt-1">
                                            ${financialData.totalRevenue.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                        <p className="text-sm font-bold text-blue-600 uppercase">Promedio Pago</p>
                                        <p className="text-2xl font-black text-blue-900 mt-1">
                                            ${Math.round(financialData.averagePayment).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
                                        <p className="text-sm font-bold text-orange-600 uppercase">Pendiente por Cobrar</p>
                                        <p className="text-2xl font-black text-orange-900 mt-1">
                                            ${financialData.pendingAmount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="h-80 w-full">
                                    <h3 className="font-bold text-[#1e3a5f] mb-4">Ingresos por Día</h3>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={financialData.dailyRevenue || []}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12} />
                                            <YAxis axisLine={false} tickLine={false} fontSize={12} tickFormatter={(v: number) => `$${(v || 0) / 1000}k`} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                                                formatter={(value) => [`$${(Number(value) || 0).toLocaleString()}`, "Monto"]}
                                            />
                                            <Bar dataKey="amount" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {activeTab === "cartera" && agingData && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up">
                                <div>
                                    <h3 className="font-bold text-[#1e3a5f] mb-6">Distribución de Cartera por Edades</h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RePieChart>
                                                <Pie
                                                    data={agingData.brackets}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="amount"
                                                    nameKey="label"
                                                >
                                                    {agingData.brackets.map((_: AgingBracket, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => [`$${(Number(value) || 0).toLocaleString()}`, "Deuda"]} />
                                            </RePieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        {agingData.brackets.map((b: AgingBracket, i: number) => (
                                            <div key={b.label} className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                                                <span className="text-sm font-medium text-gray-600">{b.label}:</span>
                                                <span className="text-sm font-bold text-[#1e3a5f]">${b.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-red-600 uppercase">Cartera Total en Mora</p>
                                            <p className="text-3xl font-black text-red-900 mt-1">${agingData.totalOverdue.toLocaleString()}</p>
                                        </div>
                                        <AlertCircle size={40} className="text-red-500 opacity-20" />
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                        <h4 className="font-bold text-[#1e3a5f] mb-3 text-sm uppercase">Recomendación</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            El {Math.round((agingData.brackets[3].amount / agingData.totalOverdue) * 100) || 0}% de la cartera tiene más de 90 días.
                                            Se recomienda iniciar procesos de cobro jurídico para estos casos.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "asesores" && (
                            <div className="space-y-6 animate-fade-in-up">
                                <h3 className="font-bold text-[#1e3a5f]">Rendimiento por Asesor</h3>
                                {advisorsData.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <Users size={48} className="mb-4 opacity-20" />
                                        <p className="text-lg font-medium">No hay asesores registrados</p>
                                        <p className="text-sm">Los usuarios con rol de Administrador o Ventas aparecerán aquí.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-[#f8fafc]">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-xs font-bold text-[#64748b] uppercase">Asesor</th>
                                                        <th className="px-6 py-4 text-center text-xs font-bold text-[#64748b] uppercase">Matrículas</th>
                                                        <th className="px-6 py-4 text-right text-xs font-bold text-[#64748b] uppercase">Recaudo Total</th>
                                                        <th className="px-6 py-4 text-center text-xs font-bold text-[#64748b] uppercase">Eficiencia</th>
                                                        <th className="px-6 py-4 text-right text-xs font-bold text-[#64748b] uppercase">Recaudo Mes</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {advisorsData
                                                        .slice((currentPage - 1) * ADVISORS_PER_PAGE, currentPage * ADVISORS_PER_PAGE)
                                                        .map((advisor) => (
                                                            <tr key={advisor.advisorId} className="hover:bg-gray-50/50 transition-colors">
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase">
                                                                            {advisor.advisorName.charAt(0)}
                                                                        </div>
                                                                        <span className="text-sm font-bold text-[#1e3a5f]">{advisor.advisorName}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                                                                    {advisor.totalStudents}
                                                                </td>
                                                                <td className="px-6 py-4 text-right text-sm font-bold text-[#1e3a5f]">
                                                                    ${advisor.totalCollected.toLocaleString()}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <div className="flex-1 max-w-[60px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-emerald-500"
                                                                                style={{ width: `${advisor.collectionRate}%` }}
                                                                            ></div>
                                                                        </div>
                                                                        <span className="text-xs font-bold text-gray-500">{advisor.collectionRate}%</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-right text-sm font-bold text-emerald-600">
                                                                    ${advisor.revenueThisMonth.toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {advisorsData.length > ADVISORS_PER_PAGE && (
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                <p className="text-sm text-gray-500">
                                                    Mostrando {Math.min(advisorsData.length, (currentPage - 1) * ADVISORS_PER_PAGE + 1)} a {Math.min(advisorsData.length, currentPage * ADVISORS_PER_PAGE)} de {advisorsData.length} asesores
                                                </p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                        disabled={currentPage === 1}
                                                        className="px-4 py-2 text-sm font-bold text-[#1e3a5f] bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                    >
                                                        Anterior
                                                    </button>
                                                    <button
                                                        onClick={() => setCurrentPage(p => p + 1)}
                                                        disabled={currentPage * ADVISORS_PER_PAGE >= advisorsData.length}
                                                        className="px-4 py-2 text-sm font-bold text-[#1e3a5f] bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                    >
                                                        Siguiente
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

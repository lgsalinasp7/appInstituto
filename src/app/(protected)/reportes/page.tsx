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
        <div className="space-y-4 sm:space-y-6">
            <DashboardHeader
                title="Reportes"
                subtitle="Rendimiento financiero"
            >
                <div className="flex gap-2 sm:gap-3">
                    <button
                        onClick={() => window.open("/api/reports/payments/export", "_blank")}
                        className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all"
                    >
                        <Download size={16} className="sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Exportar</span> Excel
                    </button>
                    <button className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 text-[#1e3a5f] rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-gray-50 transition-all">
                        <Download size={16} className="sm:w-5 sm:h-5" />
                        PDF
                    </button>
                </div>
            </DashboardHeader>

            {/* Tabs - Responsive */}
            <div className="flex p-1 bg-gray-100 rounded-xl w-full overflow-x-auto">
                <button
                    onClick={() => setActiveTab("financiero")}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 sm:flex-none ${activeTab === "financiero"
                        ? "bg-white text-[#1e3a5f] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <TrendingUp size={16} className="sm:w-[18px] sm:h-[18px]" />
                    Financiero
                </button>
                <button
                    onClick={() => setActiveTab("cartera")}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 sm:flex-none ${activeTab === "cartera"
                        ? "bg-white text-[#1e3a5f] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <PieChart size={16} className="sm:w-[18px] sm:h-[18px]" />
                    Cartera
                </button>
                <button
                    onClick={() => setActiveTab("asesores")}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 sm:flex-none ${activeTab === "asesores"
                        ? "bg-white text-[#1e3a5f] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <Users size={16} className="sm:w-[18px] sm:h-[18px]" />
                    Asesores
                </button>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 lg:p-6 min-h-[300px] sm:min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-400">Cargando datos...</div>
                ) : (
                    <>
                        {activeTab === "financiero" && financialData && (
                            <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                                    <div className="p-4 sm:p-6 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-100/20">
                                        <p className="text-xs sm:text-sm font-bold text-emerald-600 uppercase tracking-wider">Total Recaudado</p>
                                        <p className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-900 mt-1 sm:mt-2">
                                            ${financialData.totalRevenue.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-4 sm:p-6 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm shadow-blue-100/20">
                                        <p className="text-xs sm:text-sm font-bold text-blue-600 uppercase tracking-wider">Promedio Pago</p>
                                        <p className="text-xl sm:text-2xl lg:text-3xl font-black text-blue-900 mt-1 sm:mt-2">
                                            ${Math.round(financialData.averagePayment).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-4 sm:p-6 bg-orange-50 rounded-2xl border border-orange-100 shadow-sm shadow-orange-100/20">
                                        <p className="text-xs sm:text-sm font-bold text-orange-600 uppercase tracking-wider">Pendiente</p>
                                        <p className="text-xl sm:text-2xl lg:text-3xl font-black text-orange-900 mt-1 sm:mt-2">
                                            ${financialData.pendingAmount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h3 className="font-bold text-sm sm:text-base text-[#1e3a5f] mb-4 sm:mb-6 flex items-center gap-2">
                                        <TrendingUp size={18} className="text-primary" />
                                        Ingresos por Día
                                    </h3>
                                    <div className="h-52 sm:h-64 lg:h-80 w-full">
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
                            </div>
                        )}

                        {activeTab === "cartera" && agingData && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 animate-fade-in-up">
                                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h3 className="font-bold text-[#1e3a5f] mb-6 flex items-center gap-2">
                                        <PieChart size={18} className="text-primary" />
                                        Distribución de Cartera
                                    </h3>
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
                                                <Tooltip
                                                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                                                    formatter={(value) => [`$${(Number(value) || 0).toLocaleString()}`, "Deuda"]}
                                                />
                                            </RePieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                                        {agingData.brackets.map((b: AgingBracket, i: number) => (
                                            <div key={b.label} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">{b.label}</span>
                                                </div>
                                                <span className="text-xs font-black text-[#1e3a5f]">${b.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 lg:space-y-6">
                                    <div className="p-6 bg-red-50 rounded-2xl border border-red-100 shadow-sm shadow-red-100/20 flex items-center justify-between group">
                                        <div>
                                            <p className="text-xs sm:text-sm font-bold text-red-600 uppercase tracking-wider">Cartera Total en Mora</p>
                                            <p className="text-2xl sm:text-3xl font-black text-red-900 mt-1">${agingData.totalOverdue.toLocaleString()}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <AlertCircle size={28} className="text-red-500" />
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <h4 className="font-bold text-[#1e3a5f] mb-3 text-xs uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                            Recomendación Estratégica
                                        </h4>
                                        <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                            El {Math.round((agingData.brackets[3].amount / agingData.totalOverdue) * 100) || 0}% de la cartera tiene más de 90 días.
                                            Se recomienda priorizar procesos de cobro jurídico para mitigar riesgos financieros inmediatos.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "asesores" && (
                            <div className="space-y-4 sm:space-y-6 animate-fade-in-up">
                                {/* Desktop/Internal Header removed for cleaner look, like Recaudos */}
                                {advisorsData.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <Users size={48} className="mb-4 text-gray-300 opacity-50" />
                                        <p className="text-gray-500 font-bold text-lg">No hay asesores registrados</p>
                                        <p className="text-sm text-gray-400 mt-1">Los usuarios con rol de Administrador o Ventas aparecerán aquí.</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Mobile View: Cards */}
                                        <div className="md:hidden divide-y divide-gray-100 -mx-3 sm:-mx-4">
                                            {advisorsData
                                                .slice((currentPage - 1) * ADVISORS_PER_PAGE, currentPage * ADVISORS_PER_PAGE)
                                                .map((advisor) => (
                                                    <div key={advisor.advisorId} className="p-4 hover:bg-gray-50/50 transition-colors">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm uppercase flex-shrink-0">
                                                                {advisor.advisorName.charAt(0)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-[#1e3a5f] text-sm truncate">{advisor.advisorName}</p>
                                                                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Asesor Comercial</p>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                                            <div>
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Matrículas</span>
                                                                <span className="text-sm font-bold text-gray-700">{advisor.totalStudents} estudiantes</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Eficiencia</span>
                                                                <span className="text-sm font-bold text-emerald-600">{advisor.collectionRate}%</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-between items-end pt-3 border-t border-gray-50">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Recaudo Total</span>
                                                                <span className="text-lg font-black text-[#1e3a5f]">${advisor.totalCollected.toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Este Mes</span>
                                                                <span className="text-sm font-bold text-emerald-600">${advisor.revenueThisMonth.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>

                                        {/* Desktop View: Table */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50/50">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Asesor</th>
                                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Matrículas</th>
                                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Recaudo Total</th>
                                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Eficiencia</th>
                                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Recaudo Mes</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {advisorsData
                                                        .slice((currentPage - 1) * ADVISORS_PER_PAGE, currentPage * ADVISORS_PER_PAGE)
                                                        .map((advisor) => (
                                                            <tr key={advisor.advisorId} className="hover:bg-blue-50/30 transition-colors group">
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm uppercase">
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
                                                                        <div className="flex-1 max-w-[80px] h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-emerald-500 rounded-full"
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

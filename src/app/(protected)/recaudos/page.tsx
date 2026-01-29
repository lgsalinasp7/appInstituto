"use client";

import { useState } from "react";
import { CreditCard, History, Users, ArrowLeft } from "lucide-react";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";
import { PaymentRegister } from "@/modules/payments/components/PaymentRegister";
import { PaymentsHistoryView } from "@/modules/dashboard/components/PaymentsHistoryView";
import { CarteraView } from "@/modules/dashboard/components/CarteraView";
import { StudentPaymentTable } from "@/modules/payments/components/StudentPaymentTable";
import type { StudentWithRelations } from "@/modules/students/types";

export default function RecaudosPage() {
    const [activeTab, setActiveTab] = useState<"lista" | "registrar" | "historial" | "cartera">("lista");
    const [selectedStudent, setSelectedStudent] = useState<StudentWithRelations | null>(null);

    const handleSelectStudent = (student: StudentWithRelations) => {
        setSelectedStudent(student);
        setActiveTab("registrar");
    };

    const handleBackToList = () => {
        setSelectedStudent(null);
        setActiveTab("lista");
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <DashboardHeader
                title="Gestión de Recaudos"
                subtitle="Pagos de estudiantes"
            >
                {activeTab === "registrar" && (
                    <button
                        onClick={handleBackToList}
                        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#1e3a5f] transition-colors"
                    >
                        <ArrowLeft size={16} /> Volver
                    </button>
                )}
            </DashboardHeader>

            {/* Tabs - Responsive */}
            <div className="flex p-1 bg-gray-100 rounded-xl w-full overflow-x-auto">
                <button
                    onClick={() => setActiveTab("lista")}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 sm:flex-none ${activeTab === "lista"
                        ? "bg-white text-[#1e3a5f] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <Users size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="hidden xs:inline">Estudiantes</span>
                    <span className="xs:hidden">Lista</span>
                </button>
                <button
                    onClick={() => setActiveTab("registrar")}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 sm:flex-none ${activeTab === "registrar"
                        ? "bg-white text-[#1e3a5f] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <CreditCard size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="hidden xs:inline">Registrar Pago</span>
                    <span className="xs:hidden">Pago</span>
                </button>
                <button
                    onClick={() => setActiveTab("historial")}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 sm:flex-none ${activeTab === "historial"
                        ? "bg-white text-[#1e3a5f] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <History size={16} className="sm:w-[18px] sm:h-[18px]" />
                    Historial
                </button>
            </div>

            <div className="min-h-[400px] sm:min-h-[500px]">
                {activeTab === "lista" && (
                    <StudentPaymentTable onSelectStudent={handleSelectStudent} />
                )}

                {activeTab === "registrar" && (
                    <PaymentRegister preSelectedStudent={selectedStudent} />
                )}

                {activeTab === "historial" && <PaymentsHistoryView />}

                {activeTab === "cartera" && <CarteraView />}
            </div>
        </div>
    );
}

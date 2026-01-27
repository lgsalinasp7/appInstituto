"use client";

import { useState } from "react";
import { CreditCard, History, Users, ArrowLeft } from "lucide-react";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";
import { PaymentRegister } from "@/modules/payments/components/PaymentRegister";
import { PaymentHistory } from "@/modules/payments/components/PaymentHistory";
import { StudentPaymentTable } from "@/modules/payments/components/StudentPaymentTable";
import type { StudentWithRelations } from "@/modules/students/types";

export default function RecaudosPage() {
    const [activeTab, setActiveTab] = useState<"lista" | "registrar" | "historial">("lista");
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
        <div className="space-y-6">
            <DashboardHeader
                title="Gestión de Recaudos"
                subtitle="Gestiona los pagos de estudiantes matriculados"
            >
                {activeTab === "registrar" && (
                    <button
                        onClick={handleBackToList}
                        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#1e3a5f] transition-colors"
                    >
                        <ArrowLeft size={16} /> Volver a la lista
                    </button>
                )}
            </DashboardHeader>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-xl w-full md:w-fit">
                <button
                    onClick={() => setActiveTab("lista")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "lista"
                        ? "bg-white text-[#1e3a5f] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <Users size={18} />
                    Estudiantes
                </button>
                <button
                    onClick={() => setActiveTab("registrar")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "registrar"
                        ? "bg-white text-[#1e3a5f] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <CreditCard size={18} />
                    Registrar Pago
                </button>
                <button
                    onClick={() => setActiveTab("historial")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "historial"
                        ? "bg-white text-[#1e3a5f] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <History size={18} />
                    Historial
                </button>
            </div>

            <div className="min-h-[500px]">
                {activeTab === "lista" && (
                    <StudentPaymentTable onSelectStudent={handleSelectStudent} />
                )}

                {activeTab === "registrar" && (
                    <PaymentRegister preSelectedStudent={selectedStudent} />
                )}

                {activeTab === "historial" && <PaymentHistory />}
            </div>
        </div>
    );
}

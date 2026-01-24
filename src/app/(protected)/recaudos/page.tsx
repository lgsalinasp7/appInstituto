"use client";

import { useState } from "react";
import { CreditCard, History, AlertCircle } from "lucide-react";
import { PaymentRegister } from "@/modules/payments/components/PaymentRegister";
import { PaymentHistory } from "@/modules/payments/components/PaymentHistory";
import { CarteraView } from "@/modules/payments/components/CarteraView";

export default function RecaudosPage() {
    const [activeTab, setActiveTab] = useState<"registrar" | "historial" | "cartera">("registrar");

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1e3a5f]">Gestión de Recaudos</h1>
                    <p className="text-[#64748b]">Registra pagos, consulta historial y gestiona cartera</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-xl w-full md:w-fit">
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
                <button
                    onClick={() => setActiveTab("cartera")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "cartera"
                        ? "bg-white text-[#1e3a5f] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <AlertCircle size={18} />
                    Cartera
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[500px] p-6">
                {activeTab === "registrar" && <PaymentRegister />}
                {activeTab === "historial" && <PaymentHistory />}
                {activeTab === "cartera" && <CarteraView />}
            </div>
        </div>
    );
}

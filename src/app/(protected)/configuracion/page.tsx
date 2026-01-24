"use client";

import { useState } from "react";
import { Settings, BookOpen } from "lucide-react";
import { SystemSettings } from "@/modules/config/components/SystemSettings";
import { ProgramManager } from "@/modules/config/components/ProgramManager";

export default function ConfiguracionPage() {
    const [activeSubTab, setActiveSubTab] = useState<"general" | "programas">("general");

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1e3a5f]">Configuración del Sistema</h1>
                    <p className="text-[#64748b]">Ajusta parámetros globales y catálogo de programas</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-xl w-full md:w-fit">
                <button
                    onClick={() => setActiveSubTab("general")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeSubTab === "general"
                            ? "bg-white text-[#1e3a5f] shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <Settings size={18} />
                    General
                </button>
                <button
                    onClick={() => setActiveSubTab("programas")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeSubTab === "programas"
                            ? "bg-white text-[#1e3a5f] shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <BookOpen size={18} />
                    Programas
                </button>
            </div>

            <div className="min-h-[400px]">
                {activeSubTab === "general" && <SystemSettings />}
                {activeSubTab === "programas" && <ProgramManager />}
            </div>
        </div>
    );
}

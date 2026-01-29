"use client";

import { useState } from "react";
import { Settings, BookOpen, Users } from "lucide-react";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";
import { SystemSettings } from "@/modules/config/components/SystemSettings";
import { ProgramManager } from "@/modules/config/components/ProgramManager";
import { UsersManager } from "@/modules/config/components/UsersManager";
import { useAuthStore } from "@/lib/store/auth-store";

export default function ConfiguracionPage() {
    const [activeSubTab, setActiveSubTab] = useState<"general" | "programas" | "usuarios">("general");
    const { user } = useAuthStore();
    const isSuperAdmin = user?.role.name === "SUPERADMIN";
    const isAdmin = user?.role.name === "ADMINISTRADOR";
    const canAccessUsers = isSuperAdmin || isAdmin;

    return (
        <div className="space-y-4 sm:space-y-6">
            <DashboardHeader
                title="Configuración"
                subtitle="Gestión global del sistema y programas"
            />

            {/* Tabs - Responsive */}
            <div className="flex p-1 bg-gray-100 rounded-xl w-full overflow-x-auto">
                <button
                    onClick={() => setActiveSubTab("general")}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 sm:flex-none ${activeSubTab === "general"
                        ? "bg-white text-[#1e3a5f] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
                    General
                </button>
                <button
                    onClick={() => setActiveSubTab("programas")}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 sm:flex-none ${activeSubTab === "programas"
                        ? "bg-white text-[#1e3a5f] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <BookOpen size={16} className="sm:w-[18px] sm:h-[18px]" />
                    Programas
                </button>
                {canAccessUsers && (
                    <button
                        onClick={() => setActiveSubTab("usuarios")}
                        className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 sm:flex-none ${activeSubTab === "usuarios"
                            ? "bg-white text-[#1e3a5f] shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <Users size={16} className="sm:w-[18px] sm:h-[18px]" />
                        Usuarios
                    </button>
                )}
            </div>

            <div className="min-h-[400px]">
                {activeSubTab === "general" && <SystemSettings />}
                {activeSubTab === "programas" && <ProgramManager />}
                {activeSubTab === "usuarios" && <UsersManager />}
            </div>
        </div>
    );
}

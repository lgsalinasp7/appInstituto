"use client";

/**
 * MobileSidebar Component
 * Sidebar deslizable para dispositivos móviles y tablets
 */

import Image from "next/image";
import { TrendingUp, Users, CreditCard, FileText, LogOut, Settings, User, X, Wallet, UserPlus } from "lucide-react";
import type { DashboardTab } from "../types";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

const navItems: { id: DashboardTab; label: string; icon: typeof TrendingUp }[] = [
  { id: "dashboard", label: "Panel de Control", icon: TrendingUp },
  { id: "enrollments", label: "Matrículas", icon: Users },
  { id: "payments", label: "Pagos & Recibos", icon: CreditCard },
  { id: "cartera", label: "Control de Cartera", icon: Wallet },
  { id: "prospects", label: "Prospectos", icon: UserPlus },
  { id: "reports", label: "Reportes", icon: FileText },
];

export function MobileSidebar({ isOpen, onClose, activeTab, onTabChange }: MobileSidebarProps) {
  const handleTabChange = (tab: DashboardTab) => {
    onTabChange(tab);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 p-1.5 bg-white rounded-xl shadow-md border border-gray-100">
              <Image
                src="/logo-instituto.png"
                alt="Logo"
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[#1e3a5f] text-sm">Educamos con Valores</span>
              <span className="text-xs text-[#64748b]">Panel de Gestión</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-[#64748b]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider px-3 mb-3">
            Menú Principal
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium text-sm ${
                  isActive
                    ? "bg-gradient-instituto text-white shadow-lg shadow-[#1e3a5f]/20"
                    : "text-[#64748b] hover:bg-gray-50 hover:text-[#1e3a5f] active:bg-gray-100"
                }`}
              >
                <Icon size={20} strokeWidth={2} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Section - User Options */}
        <div className="p-4 border-t border-gray-100 space-y-1">
          <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider px-3 mb-2">
            Cuenta
          </p>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#64748b] hover:bg-gray-50 hover:text-[#1e3a5f] transition-all font-medium text-sm">
            <User size={20} strokeWidth={2} />
            <span>Mi Perfil</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#64748b] hover:bg-gray-50 hover:text-[#1e3a5f] transition-all font-medium text-sm">
            <Settings size={20} strokeWidth={2} />
            <span>Configuración</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium text-sm">
            <LogOut size={20} strokeWidth={2} />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 text-center border-t border-gray-100">
          <p className="text-xs text-[#94a3b8]">
            © {new Date().getFullYear()} Educamos con Valores
          </p>
        </div>
      </aside>
    </>
  );
}

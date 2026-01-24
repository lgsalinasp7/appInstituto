"use client";

/**
 * DashboardSidebar Component
 * Navigation sidebar for desktop - hidden on mobile/tablet
 */

import Image from "next/image";
import { TrendingUp, Users, CreditCard, FileText, Wallet, UserPlus } from "lucide-react";
import type { DashboardTab } from "../types";

interface DashboardSidebarProps {
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

export function DashboardSidebar({ activeTab, onTabChange }: DashboardSidebarProps) {
  return (
    <aside className="hidden lg:flex w-72 bg-white border-r border-gray-200 flex-col fixed h-full z-10 shadow-instituto-lg">
      {/* Header with Logo */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-white to-[#f8fafc]">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0 p-2 bg-white rounded-xl shadow-md border border-gray-100">
            <Image
              src="/logo-instituto.png"
              alt="Educamos con Valores"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[#1e3a5f] leading-tight text-sm">
              Educamos con Valores
            </span>
            <span className="text-xs text-[#64748b] leading-tight">
              Panel de Gestión
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider px-3 mb-3">
          Menú Principal
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold text-sm ${
                isActive
                  ? "bg-gradient-instituto text-white shadow-lg shadow-[#1e3a5f]/20"
                  : "text-[#64748b] hover:bg-gray-50 hover:text-[#1e3a5f]"
              }`}
            >
              <Icon size={20} strokeWidth={2.5} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-[#94a3b8] text-center">
          © {new Date().getFullYear()} Educamos con Valores
        </p>
      </div>
    </aside>
  );
}

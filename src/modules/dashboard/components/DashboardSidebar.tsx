"use client";

/**
 * DashboardSidebar Component
 * Navigation sidebar for desktop - hidden on mobile/tablet
 */

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TrendingUp,
  Users,
  CreditCard,
  FileText,
  Settings
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useBranding } from "@/components/providers/BrandingContext";

const navItems = [
  { href: "/dashboard", label: "Panel de Control", icon: TrendingUp },
  { href: "/matriculas", label: "Matrículas", icon: Users },
  { href: "/recaudos", label: "Gestión de Recaudos", icon: CreditCard },
  { href: "/reportes", label: "Reportes", icon: FileText },
];

// Only Superadmin and Admin can see Configuración
const adminOnlyItems = [
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const branding = useBranding();

  // Filter items based on role
  const filteredNavItems = navItems.filter((item) => {
    const roleName = user?.role?.name?.toUpperCase() || "";

    // Superadmin & Admin see everything
    if (roleName === "SUPERADMIN" || roleName === "ADMINISTRADOR") {
      return true;
    }

    // Ventas: Dashboard + Matriculas
    if (roleName === "VENTAS") {
      return ["/dashboard", "/matriculas"].includes(item.href);
    }

    // Cartera: Dashboard + Recaudos
    if (roleName === "CARTERA") {
      return ["/dashboard", "/recaudos"].includes(item.href);
    }

    // Fallback: only dashboard
    return item.href === "/dashboard";
  });

  // Add admin-only items for Superadmin/Admin
  const allNavItems = [...filteredNavItems];
  const roleName = user?.role?.name?.toUpperCase() || "";
  if (roleName === "SUPERADMIN" || roleName === "ADMINISTRADOR") {
    allNavItems.push(...adminOnlyItems);
  }

  return (
    <aside className="hidden lg:flex w-72 bg-white border-r border-gray-200 flex-col fixed h-full z-10 shadow-instituto-lg">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 p-1.5 bg-white rounded-xl shadow-md border border-gray-50 flex items-center justify-center">
            <Image src={branding.logoUrl || "/logo-instituto.png"} alt={branding.tenantName} width={32} height={32} className="object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg leading-none tracking-tighter" style={{ color: branding.primaryColor }}>{branding.tenantName}</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Gestion v1.0</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-4">Administración</p>

        {allNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${isActive
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-gray-500 hover:bg-gray-50 hover:text-primary"
                }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-50 text-center">
        <p className="text-[10px] text-gray-400 font-medium">Educamos con Valores © 2026</p>
      </div>
    </aside>
  );
}

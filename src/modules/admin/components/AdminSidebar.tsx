"use client";

/**
 * Admin Sidebar Component
 * Barra lateral de navegación para el panel de administración
 * Diseño minimalista y moderno estilo Brevo
 * Menu agrupado por función de negocio con filtrado por platformRole
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useAuthStore } from "@/lib/store/auth-store";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Target,
  Palette,
  BarChart3,
  History,
  Settings,
  ChevronLeft,
} from "lucide-react";

// Const types pattern (typescript skill)
const PLATFORM_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ASESOR_COMERCIAL: "ASESOR_COMERCIAL",
  MARKETING: "MARKETING",
} as const;

type PlatformRoleValue = (typeof PLATFORM_ROLES)[keyof typeof PLATFORM_ROLES];

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: PlatformRoleValue[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    label: "Comercial",
    items: [
      { title: "Dashboard", href: "/admin", icon: LayoutDashboard, roles: [PLATFORM_ROLES.SUPER_ADMIN, PLATFORM_ROLES.ASESOR_COMERCIAL, PLATFORM_ROLES.MARKETING] },
      { title: "Empresas", href: "/admin/empresas", icon: Building2, roles: [PLATFORM_ROLES.SUPER_ADMIN, PLATFORM_ROLES.ASESOR_COMERCIAL] },
      { title: "Suscripciones", href: "/admin/suscripciones", icon: CreditCard, roles: [PLATFORM_ROLES.SUPER_ADMIN, PLATFORM_ROLES.ASESOR_COMERCIAL] },
      { title: "Leads", href: "/admin/leads", icon: Target, roles: [PLATFORM_ROLES.SUPER_ADMIN, PLATFORM_ROLES.ASESOR_COMERCIAL] },
    ],
  },
  {
    label: "Plataforma",
    items: [
      { title: "Usuarios", href: "/admin/users", icon: Users, roles: [PLATFORM_ROLES.SUPER_ADMIN] },
      { title: "Branding", href: "/admin/branding", icon: Palette, roles: [PLATFORM_ROLES.SUPER_ADMIN] },
    ],
  },
  {
    label: "Inteligencia",
    items: [
      { title: "Métricas", href: "/admin/metricas", icon: BarChart3, roles: [PLATFORM_ROLES.SUPER_ADMIN, PLATFORM_ROLES.MARKETING] },
      { title: "Auditoría", href: "/admin/audit", icon: History, roles: [PLATFORM_ROLES.SUPER_ADMIN] },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  // Zustand-5 skill: selector específico
  const logout = useAuthStore((s) => s.logout);
  const platformRole = useAuthStore((s) => s.user?.platformRole);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const isItemVisible = (item: NavItem): boolean => {
    if (!platformRole) return false;
    return item.roles.includes(platformRole as PlatformRoleValue);
  };

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/50 h-full flex flex-col transition-all duration-300">
      {/* Logo Section */}
      <div className="h-20 flex items-center justify-start px-4 border-b border-slate-800/50">
        <Link href="/admin" className="relative w-10 h-10 lg:w-12 lg:h-12">
          <Image
            src="/kaledsoft-logoPpal.png"
            alt="KaledSoft"
            fill
            className="object-contain"
          />
        </Link>
        <span className="ml-3 font-bold text-xl text-gradient">
          Admin
        </span>
      </div>

      {/* Navigation - Grouped Sections */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        {sections.map((section, sectionIndex) => {
          const visibleItems = section.items.filter(isItemVisible);
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.label}>
              {/* Section separator */}
              {sectionIndex > 0 && (
                <div className="border-t border-slate-800/30 my-1.5" />
              )}

              {/* Section label */}
              <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                {section.label}
              </p>

              {/* Section items */}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive = item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group relative flex items-center justify-start gap-3 rounded-xl px-2 py-1.5 text-sm font-medium transition-all duration-300",
                        isActive
                          ? "bg-cyan-500/10 text-cyan-400"
                          : "text-slate-400 hover:bg-slate-900 hover:text-white"
                      )}
                    >
                      {/* Active Indicator Strip */}
                      {isActive ? (
                        <div className="absolute left-0 w-1 h-6 bg-cyan-500 rounded-r-full" />
                      ) : null}

                      <Icon className={cn(
                        "w-5 h-5 transition-colors",
                        isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-white"
                      )} />

                      <span className="">
                        {item.title}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800/50 space-y-0.5">
        {/* Configuración - solo SUPER_ADMIN */}
        {platformRole === PLATFORM_ROLES.SUPER_ADMIN ? (
          <Link
            href="/admin/configuracion"
            className={cn(
              "flex items-center justify-start gap-3 rounded-xl px-2 py-2 text-sm font-medium transition-all duration-300",
              pathname.startsWith("/admin/configuracion")
                ? "bg-cyan-500/10 text-cyan-400"
                : "text-slate-500 hover:bg-slate-900 hover:text-white"
            )}
          >
            <Settings className="w-5 h-5" />
            <span className="">Configuración</span>
          </Link>
        ) : null}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-start gap-3 rounded-xl px-2 py-2 text-sm font-medium text-slate-500 hover:bg-slate-900 hover:text-white transition-all duration-300"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="">
            Salir de Admin
          </span>
        </button>
      </div>
    </aside>
  );
}

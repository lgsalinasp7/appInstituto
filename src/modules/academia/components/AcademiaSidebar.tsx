"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import { BookOpen, Users, MessageSquare, BarChart3, LayoutDashboard, ChevronLeft, ChevronRight, House, CalendarDays, Trophy } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useBranding } from "@/components/providers/BrandingContext";
import { getAcademyRoutesForRole } from "../config/academy-routes.config";
import type { PlatformRole } from "@prisma/client";
import { cn } from "@/lib/utils";

const iconMap: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  "/academia/student": LayoutDashboard,
  "/academia/student/courses": BookOpen,
  "/academia/student/progress": BarChart3,
  "/academia/teacher": LayoutDashboard,
  "/academia/teacher/students": Users,
  "/academia/teacher/courses": BookOpen,
  "/academia/teacher/messages": MessageSquare,
  "/academia/admin": LayoutDashboard,
  "/academia/admin/courses": BookOpen,
  "/academia/admin/cohorts": Users,
  "/academia/admin/users": Users,
  "/academia/admin/analytics": BarChart3,
  "/academia/student/calendar": CalendarDays,
  "/academia/student/leaderboard": Trophy,
  "/academia/admin/calendar": CalendarDays,
  "/academia/admin/leaderboard": Trophy,
  "/academia/teacher/calendar": CalendarDays,
  "/academia/teacher/leaderboard": Trophy,
};

export function AcademiaSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const branding = useBranding();
  const platformRole = (user?.platformRole as PlatformRole) ?? null;
  const routes = getAcademyRoutesForRole(platformRole);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("academy-sidebar-collapsed") === "true";
  });

  useEffect(() => {
    const width = collapsed ? "5.5rem" : "18rem";
    document.documentElement.style.setProperty("--academia-sidebar-width", width);
    window.localStorage.setItem("academy-sidebar-collapsed", String(collapsed));

    return () => {
      document.documentElement.style.setProperty("--academia-sidebar-width", "18rem");
    };
  }, [collapsed]);

  return (
    <aside className={cn(
      "hidden lg:flex fixed h-full z-20 transition-all duration-300 overflow-hidden academy-sidebar-rail-dark flex-col",
      collapsed ? "w-[5.5rem]" : "w-72"
    )}>
      {/* Fila superior: logo fijo + flecha para colapsar/expandir (estilo Henry) */}
      <div className="flex items-center justify-between gap-2 px-3 py-3 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative w-9 h-9 shrink-0 rounded-lg overflow-hidden bg-slate-800/80 border border-slate-700/80 flex items-center justify-center">
            <Image
              src={branding.logoUrl || "/logo-instituto.png"}
              alt={branding.tenantName}
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-black text-sm leading-none tracking-tight text-white font-display truncate">
                {branding.tenantName}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Academia</span>
            </div>
          )}
        </div>
        <button
          type="button"
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          onClick={() => setCollapsed((prev) => !prev)}
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navegación: Inicio y siguiente ítem más arriba (estilo Henry: Home, Gestión de pagos) */}
      <nav className="flex-1 overflow-y-auto pt-2 pb-3 px-2 flex flex-col gap-0.5">
        {!collapsed && (
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-2 mb-1.5">Menú</p>
        )}
        {routes.map((item) => {
          const Icon = iconMap[item.path] || LayoutDashboard;
          const isDashboardRoute = ["/academia/admin", "/academia/student", "/academia/teacher"].includes(item.path);
          const isActive = pathname === item.path || (!isDashboardRoute && pathname.startsWith(item.path + "/"));
          if (collapsed) {
            return (
              <Link
                key={item.path}
                href={item.path}
                title={item.label}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
                  isActive
                    ? "bg-[var(--accent)] text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={18} />
              </Link>
            );
          }
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm font-semibold",
                isActive ? "academy-menu-item-active-dark" : "academy-menu-item-inactive-dark hover:bg-white/5"
              )}
            >
              {isActive && <span className="academy-menu-highlight-dark" />}
              <Icon size={18} className={isActive ? "text-white" : ""} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Pie: Volver al dashboard */}
      <div className="px-2 py-3 border-t border-slate-800/80 shrink-0">
        {collapsed ? (
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Volver al dashboard"
          >
            <House size={18} />
          </Link>
        ) : (
          <Link href="/dashboard" className="text-xs text-slate-400 hover:text-slate-200 font-medium px-2 py-1.5 block rounded-lg hover:bg-white/5">
            ← Volver al dashboard
          </Link>
        )}
      </div>
    </aside>
  );
}

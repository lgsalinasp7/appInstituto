"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Wrench,
  Receipt,
  ChevronLeft,
  ChevronRight,
  House,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useBranding } from "@/components/providers/BrandingContext";
import { getLavaderoRoutesForRole } from "../config/lavadero-routes.config";
import type { PlatformRole } from "@prisma/client";
import { cn } from "@/lib/utils";

const iconMap: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  "/lavadero/admin/dashboard": LayoutDashboard,
  "/lavadero/admin/orders": ClipboardList,
  "/lavadero/admin/customers": Users,
  "/lavadero/admin/services": Wrench,
  "/lavadero/admin/billing": Receipt,
  "/lavadero/supervisor/dashboard": LayoutDashboard,
  "/lavadero/supervisor/orders": ClipboardList,
};

export function LavaderoSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const branding = useBranding();
  const platformRole = (user?.platformRole as PlatformRole) ?? null;
  const routes = getLavaderoRoutesForRole(platformRole);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("lavadero-sidebar-collapsed") === "true";
  });

  useEffect(() => {
    const width = collapsed ? "5.5rem" : "18rem";
    document.documentElement.style.setProperty("--lavadero-sidebar-width", width);
    window.localStorage.setItem("lavadero-sidebar-collapsed", String(collapsed));

    return () => {
      document.documentElement.style.setProperty("--lavadero-sidebar-width", "18rem");
    };
  }, [collapsed]);

  return (
    <aside
      className={cn(
        "hidden lg:flex fixed h-full z-20 transition-all duration-300 overflow-hidden flex-col",
        "bg-gradient-to-b from-cyan-900 via-cyan-950 to-slate-950 border-r border-cyan-800/30",
        collapsed ? "w-[5.5rem]" : "w-72"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 py-3 border-b border-cyan-800/40 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative w-9 h-9 shrink-0 rounded-lg overflow-hidden bg-cyan-800/40 border border-cyan-700/50 flex items-center justify-center">
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
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.2em]">
                Lavadero Pro
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          onClick={() => setCollapsed((prev) => !prev)}
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-cyan-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto pt-2 pb-3 px-2 flex flex-col gap-0.5">
        {!collapsed && (
          <p className="text-[10px] font-bold text-cyan-500/70 uppercase tracking-[0.2em] px-2 mb-1.5">
            Menú
          </p>
        )}
        {routes.map((item) => {
          const Icon = iconMap[item.path] || LayoutDashboard;
          const isDashboardRoute = item.path.endsWith("/dashboard");
          const isActive =
            pathname === item.path || (!isDashboardRoute && pathname?.startsWith(item.path + "/"));

          if (collapsed) {
            return (
              <Link
                key={item.path}
                href={item.path}
                title={item.label}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 mx-auto",
                  isActive
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/40"
                    : "text-cyan-300/70 hover:text-white hover:bg-white/5"
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
                isActive
                  ? "bg-cyan-600/20 text-white border border-cyan-500/30"
                  : "text-cyan-200/70 hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-cyan-400" />
              )}
              <Icon size={18} className={isActive ? "text-cyan-400" : ""} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-cyan-800/40 shrink-0">
        {collapsed ? (
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-cyan-300/70 hover:text-white hover:bg-white/5 transition-colors mx-auto"
            title="Volver al dashboard"
          >
            <House size={18} />
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="text-xs text-cyan-300/70 hover:text-cyan-100 font-medium px-2 py-1.5 block rounded-lg hover:bg-white/5"
          >
            ← Volver al dashboard
          </Link>
        )}
      </div>
    </aside>
  );
}

"use client";

/**
 * MobileSidebar Component
 * Sidebar deslizable para dispositivos móviles y tablets
 * Muestra menú Instituto o Academia según la ruta actual.
 * En Academia usa el sistema de diseño oscuro (academy).
 */

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TrendingUp,
  Users,
  CreditCard,
  FileText,
  LogOut,
  Settings,
  User,
  X,
  BookOpen,
  BarChart3,
  LayoutDashboard,
  MessageSquare,
  CalendarDays,
  Trophy,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { performLogout } from "@/lib/logout";
import { useBranding } from "@/components/providers/BrandingContext";
import { getAcademyRoutesForRole } from "@/modules/academia/config/academy-routes.config";
import type { PlatformRole } from "@prisma/client";
import { cn } from "@/lib/utils";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { href: "/dashboard", label: "Panel de Control", icon: TrendingUp },
  { href: "/matriculas", label: "Matrículas", icon: Users },
  { href: "/recaudos", label: "Gestión de Recaudos", icon: CreditCard },
  { href: "/reportes", label: "Reportes", icon: FileText },
];

const configItem = { href: "/configuracion", label: "Configuración", icon: Settings };

const academyIconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  "/academia/student": LayoutDashboard,
  "/academia/student/courses": BookOpen,
  "/academia/student/progress": BarChart3,
  "/academia/student/calendar": CalendarDays,
  "/academia/student/leaderboard": Trophy,
  "/academia/teacher": LayoutDashboard,
  "/academia/teacher/students": Users,
  "/academia/teacher/courses": BookOpen,
  "/academia/teacher/messages": MessageSquare,
  "/academia/teacher/calendar": CalendarDays,
  "/academia/teacher/leaderboard": Trophy,
  "/academia/admin/analytics": LayoutDashboard,
  "/academia/admin/courses": BookOpen,
  "/academia/admin/calendar": CalendarDays,
  "/academia/admin/leaderboard": Trophy,
  "/academia/admin/users": Users,
};

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const branding = useBranding();
  const isAcademia = pathname?.startsWith("/academia");

  const roleName = user?.role?.name?.toUpperCase() || "";
  const hasFullAccess =
    roleName === "SUPERADMIN" ||
    roleName === "ADMINISTRADOR" ||
    user?.role?.permissions?.includes("all");

  // En rutas academia: usar menú academia
  const academyRoutes = isAcademia ? getAcademyRoutesForRole((user?.platformRole as PlatformRole) ?? null) : [];
  const academyItems = academyRoutes.map((r) => ({
    href: r.path,
    label: r.label,
    icon: academyIconMap[r.path] ?? LayoutDashboard,
  }));

  // En rutas instituto: filtrar items según rol
  const instituteItems = navItems.filter((item) => {
    if (hasFullAccess) return true;
    if (roleName === "VENTAS") return ["/dashboard", "/matriculas"].includes(item.href);
    if (roleName === "CARTERA") return ["/dashboard", "/recaudos"].includes(item.href);
    return item.href === "/dashboard";
  });
  if (hasFullAccess) instituteItems.push(configItem);

  const displayItems = isAcademia ? academyItems : instituteItems;

  // Handler para cerrar después de un pequeño delay para permitir la navegación
  const handleLinkClick = () => {
    setTimeout(() => {
      onClose();
    }, 100);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-[100] transition-opacity duration-300",
          isAcademia ? "bg-black/60 backdrop-blur-sm" : "bg-black/50 backdrop-blur-sm",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar - mismo aspecto que el sidebar de escritorio (academy-sidebar-rail-dark) */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 bottom-0 w-[280px] z-[110] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isAcademia
            ? "academy-sidebar-rail-dark"
            : "bg-white"
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header - igual que desktop: border-slate-800/80 */}
        <div
          className={cn(
            "flex items-center justify-between p-5 border-b shrink-0",
            isAcademia ? "border-slate-800/80" : "border-gray-100"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "relative w-10 h-10 p-1.5 rounded-lg border flex items-center justify-center overflow-hidden",
                isAcademia
                  ? "bg-slate-800/80 border-slate-700/80"
                  : "bg-white shadow-md border-gray-100"
              )}
            >
              <Image
                src={branding.logoUrl || "/logo-instituto.png"}
                alt={branding.tenantName}
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span
                className={cn(
                  "font-black text-base leading-none tracking-tighter",
                  isAcademia ? "text-white" : ""
                )}
                style={!isAcademia ? { color: branding.primaryColor } : undefined}
              >
                {branding.tenantName}
              </span>
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                isAcademia ? "text-slate-400 tracking-[0.2em]" : "text-gray-400"
              )}
            >
                {isAcademia ? "Academia" : "Gestion"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isAcademia
                ? "text-slate-400 hover:text-white hover:bg-white/5"
                : "hover:bg-gray-100 text-gray-500"
            )}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation - mismo estilo que desktop */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <p
            className={cn(
              "text-[10px] font-bold uppercase tracking-[0.2em] px-3 mb-3",
              isAcademia ? "text-slate-500" : "text-gray-400"
            )}
          >
            Menú Principal
          </p>
          {displayItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (isAcademia && pathname?.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold text-sm",
                  isActive
                    ? isAcademia
                      ? "academy-menu-item-active-dark"
                      : "bg-primary text-white shadow-lg shadow-primary/20"
                    : isAcademia
                      ? "academy-menu-item-inactive-dark hover:bg-white/5"
                      : "text-gray-500 hover:bg-gray-50 hover:text-primary active:bg-gray-100"
                )}
              >
                <Icon size={20} strokeWidth={2.5} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section - mismo borde que desktop: border-slate-800/80 */}
        <div
          className={cn(
            "p-4 border-t space-y-1 shrink-0",
            isAcademia ? "border-slate-800/80" : "border-gray-100"
          )}
        >
          <p
            className={cn(
              "text-[10px] font-bold uppercase tracking-[0.2em] px-3 mb-2",
              isAcademia ? "text-slate-500" : "text-gray-400"
            )}
          >
            Cuenta
          </p>
          <Link
            href="/profile"
            onClick={handleLinkClick}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm",
              isAcademia
                ? "academy-menu-item-inactive-dark hover:bg-white/5"
                : "text-gray-500 hover:bg-gray-50 hover:text-primary"
            )}
          >
            <User size={20} strokeWidth={2.5} />
            <span>Mi Perfil</span>
          </Link>
          {hasFullAccess && (
            <Link
              href="/configuracion"
              onClick={handleLinkClick}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm",
                isAcademia
                  ? "academy-menu-item-inactive-dark hover:bg-white/5"
                  : "text-gray-500 hover:bg-gray-50 hover:text-primary"
              )}
            >
              <Settings size={20} strokeWidth={2.5} />
              <span>Configuración</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              onClose();
              performLogout("/auth/login");
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm mt-2",
              isAcademia
                ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                : "text-red-500 hover:bg-red-50"
            )}
          >
            <LogOut size={20} strokeWidth={2.5} />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* Footer - mismo borde que desktop */}
        <div
          className={cn(
            "p-4 text-center border-t shrink-0",
            isAcademia ? "border-slate-800/80" : "border-gray-100"
          )}
        >
          <p
            className={cn(
              "text-[10px]",
              isAcademia ? "text-slate-500" : "text-gray-400"
            )}
          >
            © {new Date().getFullYear()} KaledSoft. Todos los derechos reservados.
          </p>
        </div>
      </aside>
    </>
  );
}

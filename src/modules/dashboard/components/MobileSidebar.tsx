"use client";

/**
 * MobileSidebar Component
 * Sidebar deslizable para dispositivos móviles y tablets
 * Muestra menú Instituto o Academia según la ruta actual
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
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { performLogout } from "@/lib/logout";
import { useBranding } from "@/components/providers/BrandingContext";
import { getAcademyRoutesForRole } from "@/modules/academia/config/academy-routes.config";
import type { PlatformRole } from "@prisma/client";

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
  "/academia/teacher": LayoutDashboard,
  "/academia/teacher/students": Users,
  "/academia/teacher/courses": BookOpen,
  "/academia/teacher/messages": MessageSquare,
  "/academia/admin": LayoutDashboard,
  "/academia/admin/courses": BookOpen,
  "/academia/admin/cohorts": Users,
  "/academia/admin/users": Users,
  "/academia/admin/analytics": BarChart3,
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
        className={`lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[110] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 p-1.5 bg-white rounded-xl shadow-md border border-gray-100">
              <Image
                src={branding.logoUrl || "/logo-instituto.png"}
                alt={branding.tenantName}
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base leading-none tracking-tighter" style={{ color: branding.primaryColor }}>{branding.tenantName}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isAcademia ? "Academia" : "Gestion"}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-3">
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
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm ${isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-gray-500 hover:bg-gray-50 hover:text-primary active:bg-gray-100"
                  }`}
              >
                <Icon size={20} strokeWidth={2.5} />
                <span>{item.label}</span>
              </Link>
            );
          })}

        </nav>

        {/* Bottom Section - User Options */}
        <div className="p-4 border-t border-gray-100 space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
            Cuenta
          </p>
          <Link
            href="/profile"
            onClick={handleLinkClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-primary transition-all font-bold text-sm"
          >
            <User size={20} strokeWidth={2.5} />
            <span>Mi Perfil</span>
          </Link>
          {(hasFullAccess) && (
            <Link
              href="/configuracion"
              onClick={handleLinkClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-primary transition-all font-bold text-sm"
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm mt-2"
          >
            <LogOut size={20} strokeWidth={2.5} />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Educamos con Valores
          </p>
        </div>
      </aside>
    </>
  );
}

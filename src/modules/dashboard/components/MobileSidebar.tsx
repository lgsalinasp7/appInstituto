"use client";

/**
 * MobileSidebar Component
 * Sidebar deslizable para dispositivos móviles y tablets
 */

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Users, CreditCard, FileText, LogOut, Settings, User, X, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { performLogout } from "@/lib/logout";
import { useBranding } from "@/components/providers/BrandingContext";

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

const adminItems = [
  { href: "/admin", label: "Dashboard Admin", icon: TrendingUp },
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/roles", label: "Roles", icon: ShieldCheck },
  { href: "/admin/content", label: "Módulos", icon: FileText },
];

const configItem = { href: "/configuracion", label: "Configuración", icon: Settings };

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const branding = useBranding();

  const roleName = user?.role?.name?.toUpperCase() || "";
  const isAdminSection = pathname.startsWith("/admin");

  // Determine which list to use
  let displayItems = [];

  if (isAdminSection) {
    displayItems = adminItems;
  } else {
    // Filter standard items based on role
    displayItems = navItems.filter((item) => {
      if (roleName === "SUPERADMIN" || roleName === "ADMINISTRADOR") return true;
      if (roleName === "VENTAS") return ["/dashboard", "/matriculas"].includes(item.href);
      if (roleName === "CARTERA") return ["/dashboard", "/recaudos"].includes(item.href);
      return item.href === "/dashboard";
    });

    if (roleName === "SUPERADMIN" || roleName === "ADMINISTRADOR") {
      displayItems.push(configItem);
    }
  }

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
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gestion</span>
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
            {isAdminSection ? "Panel Administración" : "Menú Principal"}
          </p>
          {displayItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
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

          {isAdminSection && (
            <div className="pt-4 mt-4 border-t border-gray-100">
              <Link
                href="/dashboard"
                onClick={handleLinkClick}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-primary transition-all font-bold text-sm"
              >
                <span>← Volver al Dashboard</span>
              </Link>
            </div>
          )}
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
          {(roleName === "SUPERADMIN" || roleName === "ADMINISTRADOR") && (
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

"use client";

/**
 * Admin Sidebar Component
 * Barra lateral de navegación para el panel de administración
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand";
import { useAuthStore } from "@/lib/store/auth-store";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: "📊",
    description: "Resumen del sistema",
  },
  {
    title: "Usuarios",
    href: "/admin/users",
    icon: "👥",
    description: "Gestionar usuarios",
  },
  {
    title: "Roles",
    href: "/admin/roles",
    icon: "🔐",
    description: "Permisos y roles",
  },
  {
    title: "Módulos",
    href: "/admin/content",
    icon: "📚",
    description: "Contenido y entregas",
  },
  {
    title: "Auditoría",
    href: "/admin/audit",
    icon: "📋",
    description: "Registro de actividad",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Filter items based on role - Only SUPERADMIN and ADMINISTRADOR can access admin panel
  const filteredNavItems = navItems.filter((item) => {
    const roleName = user?.role?.name?.toUpperCase() || "";

    // Only SUPERADMIN and ADMINISTRADOR can see admin items
    if (roleName === "SUPERADMIN" || roleName === "ADMINISTRADOR") {
      return true;
    }

    // Other roles should not see admin panel
    return false;
  });

  return (
    <aside className="w-64 border-r bg-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link href="/admin">
          <Logo size="sm" />
        </Link>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-instituto"
                    : "text-gray-500 hover:bg-[#f1f5f9] hover:text-primary"
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{item.title}</span>
                  {!isActive && (
                    <span className="text-xs text-gray-400">
                      {item.description}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer del sidebar */}
      <div className="p-4 border-t">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
        >
          <span>←</span>
          <span>Volver al Dashboard</span>
        </Link>
      </div>
    </aside>
  );
}


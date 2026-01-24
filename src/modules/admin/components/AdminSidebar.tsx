"use client";

/**
 * Admin Sidebar Component
 * Barra lateral de navegación para el panel de administración
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand";

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
    title: "Auditoría",
    href: "/admin/audit",
    icon: "📋",
    description: "Registro de actividad",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

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
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                  isActive
                    ? "bg-[#1e3a5f] text-white shadow-instituto"
                    : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#1e3a5f]"
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{item.title}</span>
                  {!isActive && (
                    <span className="text-xs text-[#94a3b8]">
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
          className="flex items-center gap-2 text-sm text-[#64748b] hover:text-[#1e3a5f] transition-colors"
        >
          <span>←</span>
          <span>Volver al Dashboard</span>
        </Link>
      </div>
    </aside>
  );
}

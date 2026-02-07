"use client";

/**
 * AdminLayoutClient - Client Component
 * Layout del panel de administración de KaledSoft (admin.kaledsoft.tech)
 * Solo accesible por usuarios con platformRole
 */

import { AdminSidebar } from "@/modules/admin";
import { useState } from "react";
import { Menu, X, Shield } from "lucide-react";
import Link from "next/link";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  platformRole: string;
  userName: string;
}

export default function AdminLayoutClient({
  children,
  platformRole,
  userName,
}: AdminLayoutClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const roleLabel =
    platformRole === "SUPER_ADMIN"
      ? "Super Admin"
      : platformRole === "ASESOR_COMERCIAL"
        ? "Asesor Comercial"
        : "Marketing";

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-[#1e3a5f]">KaledSoft Admin</span>
          </div>

          <div className="w-10" />
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-72 h-full bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <AdminSidebar />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block border-r bg-white shadow-sm">
        <AdminSidebar />
      </div>

      <div className="flex-1 flex flex-col pt-16 lg:pt-0">
        {/* Top Bar con info del usuario */}
        <div className="hidden lg:flex items-center justify-end gap-4 px-8 py-3 border-b bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">{userName}</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Admin Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>

        {/* Footer */}
        <footer className="p-4 text-center text-sm text-[#64748b] border-t bg-white">
          &copy; {new Date().getFullYear()} KaledSoft - Plataforma de Gestion
        </footer>
      </div>
    </div>
  );
}

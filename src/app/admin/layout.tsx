"use client";

/**
 * Admin Layout
 * Layout para el panel de administración con diseño institucional
 */

import { AdminSidebar } from "@/modules/admin";
import { AuthGuard } from "@/components/auth";
import { MobileHeader } from "@/modules/dashboard/components/MobileHeader";
import { MobileSidebar } from "@/modules/dashboard/components/MobileSidebar";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen flex bg-[#f8fafc]">
        {/* Mobile Components */}
        <MobileHeader
          isMenuOpen={isMobileMenuOpen}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <MobileSidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Desktop Sidebar */}
        <div className="hidden lg:block border-r bg-white shadow-sm">
          <AdminSidebar />
        </div>

        <div className="flex-1 flex flex-col pt-16 lg:pt-0">
          {/* Admin Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="p-4 text-center text-sm text-[#64748b] border-t bg-white">
            © {new Date().getFullYear()} *EDUTEC* - Educamos con Valores
          </footer>
        </div>
      </div>
    </AuthGuard>
  );
}

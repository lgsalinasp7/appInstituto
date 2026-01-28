"use client";

/**
 * Admin Layout
 * Layout para el panel de administración con diseño institucional
 */

import { AdminSidebar } from "@/modules/admin";
import { AuthGuard } from "@/components/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex bg-[#f8fafc]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          {/* Admin Content */}
          <main className="flex-1 p-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="p-4 text-center text-sm text-[#64748b] border-t bg-white">
            © {new Date().getFullYear()} Educamos con Valores - Panel de Administración
          </footer>
        </div>
      </div>
    </AuthGuard>
  );
}

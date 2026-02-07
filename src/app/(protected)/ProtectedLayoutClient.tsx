"use client";

import { DashboardSidebar } from "@/modules/dashboard/components/DashboardSidebar";
import { MobileHeader } from "@/modules/dashboard/components/MobileHeader";
import { MobileSidebar } from "@/modules/dashboard/components/MobileSidebar";
import { AuthGuard } from "@/components/auth";
import { useState } from "react";

export default function ProtectedLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 flex font-sans text-slate-200 relative overflow-hidden">
        <div className="grain-overlay" />

        {/* Decorative Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        <MobileHeader
          isMenuOpen={isMobileMenuOpen}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <MobileSidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        <DashboardSidebar />

        <main className="flex-1 lg:ml-72 pt-16 lg:pt-0 min-h-screen relative z-10 transition-all duration-500">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

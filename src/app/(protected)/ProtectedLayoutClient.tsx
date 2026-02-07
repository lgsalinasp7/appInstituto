"use client";

import { DashboardSidebar } from "@/modules/dashboard/components/DashboardSidebar";
import { MobileHeader } from "@/modules/dashboard/components/MobileHeader";
import { MobileSidebar } from "@/modules/dashboard/components/MobileSidebar";
import { AuthGuard } from "@/components/auth";
import { useState } from "react";
import { useBranding } from "@/components/providers/BrandingContext";
import { cn } from "@/lib/utils";

export default function ProtectedLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const branding = useBranding();
  const isDark = branding.darkMode !== false;

  return (
    <AuthGuard>
      <div className={cn(
        "min-h-screen flex font-sans relative overflow-hidden transition-colors duration-500",
        isDark ? "bg-slate-950 text-slate-200" : "bg-white text-slate-900"
      )}>
        <div className="grain-overlay" />

        {/* Decorative Background Glows */}
        <div className={cn(
          "absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none -z-10 transition-opacity duration-500",
          isDark ? "bg-cyan-500/5 opacity-100" : "bg-blue-500/5 opacity-40"
        )} />
        <div className={cn(
          "absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none -z-10 transition-opacity duration-500",
          isDark ? "bg-blue-600/5 opacity-100" : "bg-cyan-500/5 opacity-40"
        )} />

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

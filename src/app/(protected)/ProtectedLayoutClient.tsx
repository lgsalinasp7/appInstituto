"use client";

import { DashboardSidebar } from "@/modules/dashboard/components/DashboardSidebar";
import { MobileHeader } from "@/modules/dashboard/components/MobileHeader";
import { MobileSidebar } from "@/modules/dashboard/components/MobileSidebar";
import { UserProfileDropdown } from "@/modules/admin/components/UserProfileDropdown";
import { AuthGuard } from "@/components/auth";
import { useState } from "react";
import { useBranding } from "@/components/providers/BrandingContext";
import { cn } from "@/lib/utils";
import { Search, Bell, HelpCircle, Settings } from "lucide-react";
import { FloatingChatButton } from "@/components/chat/FloatingChatButton";

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
        "min-h-screen flex font-sans relative overflow-x-hidden overflow-y-auto transition-colors duration-500",
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

        <div className="flex-1 flex flex-col min-w-0 lg:ml-72 relative z-10">
          {/* Top Bar - Estilo Amaxoft con colores del tenant */}
          <header
            className={cn(
              "h-16 lg:h-20 hidden lg:flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b sticky top-0 z-40 backdrop-blur-xl",
              isDark
                ? "border-slate-800/50 bg-slate-950/80"
                : "border-slate-200/80 bg-white/80"
            )}
          >
            <div className="flex-1 max-w-2xl">
              <div className="relative group">
                <Search
                  className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                    isDark ? "text-slate-500 group-focus-within:text-cyan-400" : "text-slate-400 group-focus-within:text-blue-600"
                  )}
                />
                <input
                  type="text"
                  placeholder="Buscar en el dashboard..."
                  className={cn(
                    "w-full h-11 pl-11 pr-4 rounded-xl border transition-all outline-none text-sm font-medium",
                    isDark
                      ? "bg-slate-900/30 border-slate-800 placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5"
                      : "bg-slate-50/80 border-slate-200 placeholder:text-slate-400 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5"
                  )}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 ml-6">
              <div className="flex items-center gap-1">
                <button
                  className={cn(
                    "p-2.5 rounded-xl transition-all active:scale-90",
                    isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <Bell className="w-5 h-5" />
                </button>
                <button
                  className={cn(
                    "p-2.5 rounded-xl transition-all active:scale-90",
                    isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
                <button
                  className={cn(
                    "p-2.5 rounded-xl transition-all active:scale-90",
                    isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
              <div className={cn("h-8 w-px", isDark ? "bg-slate-800" : "bg-slate-200")} />
              <UserProfileDropdown configHref="/configuracion" />
            </div>
          </header>

          <main className="flex-1 pt-16 lg:pt-0 min-h-screen transition-all duration-500">
            <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>

        {/* Agente de IA flotante */}
        <FloatingChatButton />
      </div>
    </AuthGuard>
  );
}

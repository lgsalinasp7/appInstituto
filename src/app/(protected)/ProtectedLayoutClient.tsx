"use client";

import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/modules/dashboard/components/DashboardSidebar";
import { AcademiaSidebar } from "@/modules/academia/components/AcademiaSidebar";
import { LavaderoSidebar } from "@/modules/lavadero/components/LavaderoSidebar";
import { MobileHeader } from "@/modules/dashboard/components/MobileHeader";
import { MobileSidebar } from "@/modules/dashboard/components/MobileSidebar";
import { UserProfileDropdown } from "@/modules/admin/components/UserProfileDropdown";
import { AuthGuard } from "@/components/auth";
import { useState } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useBranding } from "@/components/providers/BrandingContext";
import { cn } from "@/lib/utils";
import { Bell, HelpCircle, Settings } from "lucide-react";
// Chat deshabilitado - no mostrar en ningún perfil
// import { FloatingChatButton } from "@/components/chat/FloatingChatButton";

export default function ProtectedLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuthStore();
  const branding = useBranding();
  const isAcademia = pathname?.startsWith("/academia");
  const isLavadero = pathname?.startsWith("/lavadero");
  const isAcademiaRoleRoute =
    pathname?.startsWith("/academia/student") ||
    pathname?.startsWith("/academia/teacher") ||
    pathname?.startsWith("/academia/admin");
  const isDark = branding.darkMode !== false;
  const useAcademiaShell = isAcademia;
  const useLavaderoShell = isLavadero;

  if (isAcademiaRoleRoute) {
    return (
      <AuthGuard>
        <div className="academy-shell-dark min-h-screen flex font-sans relative overflow-x-hidden overflow-y-auto">
          <div className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full bg-cyan-500/8 blur-[100px] pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-0 w-[360px] h-[360px] rounded-full bg-blue-600/8 blur-[100px] pointer-events-none -z-10" />
          {children}
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className={cn(
        "min-h-screen flex font-sans relative overflow-x-hidden overflow-y-auto transition-colors duration-500",
        useAcademiaShell ? "academy-shell-dark" : useLavaderoShell ? "bg-slate-50 text-slate-900" : isDark ? "bg-slate-950 text-slate-200" : "bg-white text-slate-900"
      )}>
        {!useAcademiaShell && <div className="grain-overlay" />}

        {/* Academia: blurs sutiles como en login KaledAcademy */}
        {useAcademiaShell && (
          <>
            <div className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full bg-cyan-500/8 blur-[100px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-[360px] h-[360px] rounded-full bg-blue-600/8 blur-[100px] pointer-events-none -z-10" />
          </>
        )}

        {/* Decorative Background Glows */}
        {!useAcademiaShell && (
          <>
            <div className={cn(
              "absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none -z-10 transition-opacity duration-500",
              isDark ? "bg-cyan-500/5 opacity-100" : "bg-blue-500/5 opacity-40"
            )} />
            <div className={cn(
              "absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none -z-10 transition-opacity duration-500",
              isDark ? "bg-blue-600/5 opacity-100" : "bg-cyan-500/5 opacity-40"
            )} />
          </>
        )}

        <MobileHeader
          isMenuOpen={isMobileMenuOpen}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <MobileSidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {isAcademia ? <AcademiaSidebar /> : isLavadero ? <LavaderoSidebar /> : <DashboardSidebar />}

        <div className={cn(
          "flex-1 flex flex-col min-w-0 relative z-10",
          isLavadero ? "lg:ml-[var(--lavadero-sidebar-width,18rem)]" : "lg:ml-[var(--academia-sidebar-width,18rem)]"
        )}>
          {/* Top Bar - tenant/academia */}
          <header
            className={cn(
              "h-16 lg:h-20 hidden lg:flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b sticky top-0 z-40",
              useAcademiaShell
                ? "academy-topbar-dark"
                : useLavaderoShell
                ? "border-slate-200/80 bg-white/80 backdrop-blur-xl"
                : isDark
                ? "border-slate-800/50 bg-slate-950/80 backdrop-blur-xl"
                : "border-slate-200/80 bg-white/80 backdrop-blur-xl"
            )}
          >
            <div className="flex-1">
              {useAcademiaShell && (
                <h1 className="text-xl font-bold text-white tracking-tight">
                  ¡Hola, {user?.name?.split(" ")[0] ?? "Usuario"}!
                </h1>
              )}
              {useLavaderoShell && (
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Lavadero Pro
                </h1>
              )}
            </div>

            <div className={cn("flex items-center gap-4", (useAcademiaShell || useLavaderoShell) ? "ml-auto" : "ml-6")}>
              <div className="flex items-center gap-1">
                <button
                  className={cn(
                    "p-2.5 rounded-xl transition-all active:scale-90",
                    useAcademiaShell
                      ? "text-slate-400 hover:text-white hover:bg-white/5"
                      : isDark
                      ? "text-slate-400 hover:text-white hover:bg-white/5"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <Bell className="w-5 h-5" />
                </button>
                <button
                  className={cn(
                    "p-2.5 rounded-xl transition-all active:scale-90",
                    useAcademiaShell
                      ? "text-slate-400 hover:text-white hover:bg-white/5"
                      : isDark
                      ? "text-slate-400 hover:text-white hover:bg-white/5"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
                <button
                  className={cn(
                    "p-2.5 rounded-xl transition-all active:scale-90",
                    useAcademiaShell
                      ? "text-slate-400 hover:text-white hover:bg-white/5"
                      : isDark
                      ? "text-slate-400 hover:text-white hover:bg-white/5"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
              <div className={cn("h-8 w-px", useAcademiaShell ? "bg-slate-600" : isDark ? "bg-slate-800" : "bg-slate-200")} />
              <UserProfileDropdown configHref="/configuracion" forceLight={!useAcademiaShell} forceDark={useAcademiaShell} />
            </div>
          </header>

          <main className="flex-1 pt-16 lg:pt-0 min-h-screen transition-all duration-500">
            <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>

        {/* Agente de IA flotante - deshabilitado para no mostrar en ningún perfil */}
        {/* <FloatingChatButton /> */}
      </div>
    </AuthGuard>
  );
}

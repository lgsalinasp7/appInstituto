"use client";

/**
 * AdminLayoutClient - Client Component
 * Premium Modern Dashboard Layout inspired by Brevo
 */

import { AdminSidebar } from "@/modules/admin";
import { UserProfileDropdown } from "@/modules/admin/components/UserProfileDropdown";
import { useState } from "react";
import {
  Menu,
  X,
  Search,
  Sparkles,
  Bell,
  HelpCircle,
  Settings,
  User,
} from "lucide-react";
import { BrandingProvider } from "@/components/providers/BrandingContext";

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
    <div className="h-screen flex bg-slate-950 text-slate-200 overflow-hidden">
      {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 shadow-lg px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <span className="font-bold text-gradient">KaledSoft Admin</span>

          <button className="p-2 rounded-xl bg-slate-800 text-slate-300">
            <User className="w-5 h-5" />
          </button>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="w-64 h-full animate-slide-in-left"
              onClick={(e) => e.stopPropagation()}
            >
              <AdminSidebar />
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden lg:block h-full relative z-20">
          <AdminSidebar />
        </div>

        <BrandingProvider branding={{ darkMode: true }}>
        <div className="flex-1 flex flex-col min-w-0 h-full pt-16 lg:pt-0 relative z-10">
          <div className="grain-overlay" />

          {/* Modern Top Header */}
          <header className="h-20 hidden lg:flex items-center justify-between px-8 border-b border-slate-800/50 bg-slate-950/20 backdrop-blur-xl sticky top-0 z-40">
            {/* AI Search Assistant Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Preguntar a IA o buscar funciones..."
                  className="w-full h-11 pl-11 pr-32 bg-slate-900/30 border border-slate-800 rounded-xl focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all outline-none text-sm placeholder:text-slate-600 font-medium"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg text-xs font-bold hover:bg-cyan-500/20 transition-all border border-cyan-500/20 active:scale-95">
                    <Sparkles className="w-3.5 h-3.5" />
                    Ask IA
                  </button>
                </div>
              </div>
            </div>

            {/* Actions & Profile */}
            <div className="flex items-center gap-6 ml-8">
              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all active:scale-90">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all active:scale-90">
                  <HelpCircle className="w-5 h-5" />
                </button>
                <button className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all active:scale-90">
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              <div className="h-8 w-[1px] bg-slate-800 mx-2" />
              <UserProfileDropdown />
            </div>
          </header>

          {/* Admin Content Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-10 pt-8 sm:pt-10 lg:pt-12 bg-premium-dark relative overflow-y-auto caret-transparent outline-none">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
        </BrandingProvider>
      </div>
  );
}

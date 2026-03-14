"use client";
/**
 * modules/academia/components/student/StudentTopbar.tsx
 * Topbar de la academia - usa academy-topbar-dark del globals.css
 */

import { useState } from "react";
import Link from "next/link";
import { Bell, Search, Menu, X, BookOpen, FolderKanban, Bot, Users } from "lucide-react";

interface Props {
  userName: string;
  userImage?: string;
  cohortName: string;
}

export function StudentTopbar({ userName, userImage, cohortName }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="academy-topbar-dark sticky top-0 z-40 h-14 flex items-center px-4 lg:px-6 gap-3">
        {/* Mobile menu btn */}
        <button
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-sm hidden sm:block">
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2">
            <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Buscar sesiones, conceptos..."
              className="bg-transparent border-none outline-none text-[12px] text-slate-400 placeholder:text-slate-600 w-full"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Bell */}
          <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400" />
          </button>

          <div className="h-6 w-px bg-white/[0.08]" />

          {/* User */}
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <div className="text-[12px] font-semibold text-white leading-none">{userName}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 leading-none">{cohortName}</div>
            </div>
            {userImage ? (
              <img
                src={userImage}
                alt={userName}
                className="w-8 h-8 rounded-full border border-white/10"
              />
            ) : (
              <div className="w-8 h-8 rounded-full border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xs font-bold">
                {userName[0]?.toUpperCase() ?? "A"}
              </div>
            )}
            {/* Online dot */}
            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 academy-sidebar-rail-dark border-r border-white/[0.06] animate-slide-in-left flex flex-col">
            <div className="h-14 flex items-center justify-between px-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-[8px] flex items-center justify-center text-white font-black text-xs"
                  style={{ background: "linear-gradient(135deg, #0891b2, #2563eb)" }}
                >
                  K
                </div>
                <span className="text-white font-bold text-[13px]">KaledAcademy</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {[
                { href: "/academia/student", label: "Dashboard", icon: BookOpen },
                { href: "/academia/student/curso", label: "Mi Curso", icon: BookOpen },
                { href: "/academia/student/proyecto", label: "Mi Proyecto", icon: FolderKanban },
                { href: "/academia/student/tutor", label: "Kaled AI", icon: Bot },
                { href: "/academia/student/comunidad", label: "Comunidad", icon: Users },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/95 border-t border-white/[0.06] backdrop-blur-xl flex items-center justify-around px-4 z-40">
        {[
          { href: "/academia/student", label: "Inicio", icon: BookOpen },
          { href: "/academia/student/curso", label: "Curso", icon: BookOpen },
          { href: "/academia/student/proyecto", label: "Proyecto", icon: FolderKanban },
          { href: "/academia/student/tutor", label: "Kaled", icon: Bot },
          { href: "/academia/student/comunidad", label: "Comunidad", icon: Users },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-cyan-400 transition-colors p-2"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[9px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}

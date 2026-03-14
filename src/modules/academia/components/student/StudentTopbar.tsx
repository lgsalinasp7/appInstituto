"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Search, Menu, X, LayoutDashboard, BookOpen, UserCircle, Calendar, Trophy } from "lucide-react";

interface Props {
  userName: string;
  userImage?: string;
  cohortName: string;
}

const NAV = [
  { href: "/academia/student", label: "Inicio", icon: LayoutDashboard },
  { href: "/academia/student/courses", label: "Cursos", icon: BookOpen },
  { href: "/academia/student/profile", label: "Mi Perfil", icon: UserCircle },
  { href: "/academia/student/calendar", label: "Calendario", icon: Calendar },
  { href: "/academia/student/leaderboard", label: "Ranking", icon: Trophy },
];

export function StudentTopbar({ userName, userImage, cohortName }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="academy-topbar-dark sticky top-0 z-40 h-16 flex items-center px-5 lg:px-8 gap-4">
        <button
          className="lg:hidden p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex-1 max-w-md hidden sm:block">
          <div className="flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Buscar sesiones, conceptos..."
              className="bg-transparent border-none outline-none text-[13px] text-slate-400 placeholder:text-slate-600 w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button className="relative p-2.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400" />
          </button>

          <div className="h-7 w-px bg-white/[0.08]" />

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[13px] font-semibold text-white leading-none">{userName}</div>
              <div className="text-[11px] text-slate-500 mt-1 leading-none">{cohortName}</div>
            </div>
            {userImage ? (
              <img
                src={userImage}
                alt={userName}
                className="w-8 h-8 rounded-full border border-white/10"
              />
            ) : (
              <div className="w-8 h-8 rounded-full border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-sm font-bold">
                {userName[0]?.toUpperCase() ?? "A"}
              </div>
            )}
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
          </div>
        </div>
      </header>

      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-80 academy-sidebar-rail-dark border-r border-white/[0.06] animate-slide-in-left flex flex-col">
            <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm"
                  style={{ background: "linear-gradient(135deg, #0891b2, #2563eb)" }}
                >
                  K
                </div>
                <span className="text-white font-bold text-[15px]">KaledAcademy</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-slate-950/95 border-t border-white/[0.06] backdrop-blur-xl flex items-center justify-around px-4 z-40">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-cyan-400 transition-colors p-3"
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}

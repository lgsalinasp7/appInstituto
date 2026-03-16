"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, Menu, X, LayoutDashboard, Users, BookOpen, MessageSquare, Calendar, Trophy, UserCircle } from "lucide-react";
import { KALED_ACADEMY_CONFIG } from "../../config/academy-tenant.config";

interface Props {
  userName: string;
  userImage?: string;
  cohortName?: string;
}

const NAV = [
  { href: "/academia/teacher", label: "Dashboard", icon: LayoutDashboard },
  { href: "/academia/teacher/students", label: "Estudiantes", icon: Users },
  { href: "/academia/teacher/courses", label: "Cursos", icon: BookOpen },
  { href: "/academia/teacher/messages", label: "Mensajes", icon: MessageSquare },
  { href: "/academia/teacher/calendar", label: "Calendario", icon: Calendar },
  { href: "/academia/teacher/leaderboard", label: "Leaderboard", icon: Trophy },
];

export function TeacherTopbar({ userName, userImage, cohortName }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="academy-topbar-dark sticky top-0 z-40 h-14 flex items-center px-4 lg:px-6 gap-3">
        <button
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-2 ml-auto">
          <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-colors">
            <Bell className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-white/[0.08]" />

          <Link href="/academia/teacher/profile" className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <div className="text-[12px] font-semibold text-white leading-none">{userName}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 leading-none">{cohortName ?? "Instructor"}</div>
            </div>
            {userImage ? (
              <img
                src={userImage}
                alt={userName}
                className="w-8 h-8 rounded-full border border-white/10"
              />
            ) : (
              <div className="w-8 h-8 rounded-full border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xs font-bold">
                {userName[0]?.toUpperCase() ?? "I"}
              </div>
            )}
          </Link>
        </div>
      </header>

      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 academy-sidebar-rail-dark border-r border-white/[0.06] animate-slide-in-left flex flex-col">
            <div className="h-14 flex items-center justify-between px-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="relative w-7 h-7 rounded-[8px] shrink-0 overflow-hidden flex items-center justify-center bg-slate-800/80">
                  <Image
                    src={KALED_ACADEMY_CONFIG.branding.logoUrl}
                    alt="KaledAcademy"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
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
              {NAV.map((item) => (
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

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/95 border-t border-white/[0.06] backdrop-blur-xl flex items-center justify-around px-4 z-40">
        {NAV.slice(0, 5).map((item) => (
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

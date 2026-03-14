"use client";
/**
 * modules/academia/components/student/StudentSidebar.tsx
 * Sidebar de la Academia para estudiantes
 * Usa: academy-shell-dark, academy-sidebar-rail-dark, academy-menu-item-active-dark
 * Design tokens del globals.css existente
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  Bot,
  Users,
  Calendar,
  Trophy,
  LogOut,
} from "lucide-react";

interface Props {
  userName: string;
  userEmail: string;
  userImage?: string;
  progress: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  cohortName: string;
}

const NAV = [
  { href: "/academia/student",           label: "Dashboard",    icon: LayoutDashboard, exact: true },
  { href: "/academia/student/curso",     label: "Mi Curso",     icon: BookOpen },
  { href: "/academia/student/proyecto",  label: "Mi Proyecto",  icon: FolderKanban },
  { href: "/academia/student/tutor",     label: "Kaled AI",     icon: Bot },
  { href: "/academia/student/comunidad", label: "Comunidad",    icon: Users },
  { href: "/academia/student/calendario",label: "Calendario",   icon: Calendar },
  { href: "/academia/student/ranking",   label: "Ranking",      icon: Trophy },
];

function getLevel(progress: number) {
  if (progress >= 90) return "Elite Builder";
  if (progress >= 70) return "Senior Builder";
  if (progress >= 50) return "Builder";
  if (progress >= 25) return "Junior Builder";
  return "Trainee";
}

export function StudentSidebar({
  userName, userEmail, userImage, progress,
  lessonsCompleted, lessonsTotal, cohortName,
}: Props) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden lg:flex flex-col w-[220px] shrink-0 academy-sidebar-rail-dark sticky top-0 h-screen">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/[0.06] gap-3">
        <div
          className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 text-white font-black text-sm"
          style={{ background: "linear-gradient(135deg, #0891b2 0%, #2563eb 100%)" }}
        >
          K
        </div>
        <div>
          <div className="text-white font-bold text-[13px] leading-none tracking-tight">
            KaledAcademy
          </div>
          <div className="text-slate-500 text-[10px] mt-0.5">AI SaaS Bootcamp</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
        <div className="px-2 mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">
            Aprendizaje
          </span>
        </div>

        {NAV.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all",
                active
                  ? "academy-menu-item-active-dark text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              )}
            >
              {active && <span className="academy-menu-highlight-dark" />}
              <item.icon
                className={cn("w-4 h-4 shrink-0", active ? "text-white" : "text-slate-500")}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Progress */}
      <div className="px-3 pb-3">
        <div
          className="rounded-xl p-3 border border-white/[0.08]"
          style={{ background: "rgba(8, 145, 178, 0.06)" }}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] text-slate-400">{getLevel(progress)}</span>
            <span className="text-[11px] font-bold text-cyan-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden mb-1">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #0891b2, #2563eb)",
              }}
            />
          </div>
          <div className="text-[10px] text-slate-600">
            {lessonsCompleted}/{lessonsTotal} sesiones
          </div>
        </div>
      </div>

      {/* User */}
      <div className="px-3 pb-4 border-t border-white/[0.05] pt-3 flex items-center gap-2.5">
        {userImage ? (
          <img
            src={userImage}
            alt={userName}
            className="w-8 h-8 rounded-full border border-white/10 shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xs font-bold shrink-0">
            {userName[0]?.toUpperCase() ?? "A"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-white truncate">{userName}</div>
          <div className="text-[10px] text-slate-500 truncate">{cohortName}</div>
        </div>
        <a
          href="/auth/logout"
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] transition-colors"
          title="Cerrar sesión"
        >
          <LogOut className="w-3.5 h-3.5" />
        </a>
      </div>
    </aside>
  );
}

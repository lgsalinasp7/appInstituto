"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { KALED_ACADEMY_CONFIG } from "../../config/academy-tenant.config";
import { LayoutDashboard, BookOpen, Calendar, Trophy } from "lucide-react";

interface Props {
  progress: number;
  lessonsCompleted: number;
  lessonsTotal: number;
}

const NAV = [
  { href: "/academia/student", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/academia/student/courses", label: "Mis Cursos", icon: BookOpen, also: ["/academia/student/cohort"] },
  { href: "/academia/student/calendar", label: "Calendario", icon: Calendar },
  { href: "/academia/student/leaderboard", label: "Leaderboard", icon: Trophy },
];

export function StudentSidebar({ progress, lessonsCompleted, lessonsTotal }: Props) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean, also?: string[]) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/") || (also?.some((p) => pathname.startsWith(p)) ?? false);

  return (
    <aside className="hidden lg:flex flex-col w-[260px] shrink-0 academy-sidebar-rail-dark fixed left-0 top-0 z-30 h-screen">
      <div className="h-20 flex items-center px-5 border-b border-white/[0.06] gap-3">
        <div className="relative w-10 h-10 rounded-xl shrink-0 overflow-hidden flex items-center justify-center bg-slate-800/80">
          <Image
            src={KALED_ACADEMY_CONFIG.branding.logoUrl}
            alt="KaledAcademy"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
        <div>
          <div className="text-white font-bold text-[15px] leading-none tracking-tight">
            KaledAcademy
          </div>
          <div className="text-slate-500 text-[11px] mt-1">AI SaaS Bootcamp</div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-5 space-y-0.5 overflow-y-auto scrollbar-hide">
        <div className="px-2.5 mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600">
            Aprendizaje
          </span>
        </div>

        {NAV.map((item) => {
          const active = isActive(item.href, item.exact, item.also);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-[14px] font-medium transition-all",
                active
                  ? "academy-menu-item-active-dark text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              )}
            >
              {active && <span className="academy-menu-highlight-dark" />}
              <item.icon
                className={cn("w-5 h-5 shrink-0", active ? "text-white" : "text-slate-500")}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-4">
        <div
          className="rounded-xl p-4 border border-white/[0.08]"
          style={{ background: "rgba(8, 145, 178, 0.06)" }}
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[12px] text-slate-400">Progreso</span>
            <span className="text-[12px] font-bold text-cyan-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-1.5">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #0891b2, #2563eb)",
              }}
            />
          </div>
          <div className="text-[11px] text-slate-600">
            {lessonsCompleted}/{lessonsTotal} sesiones
          </div>
        </div>
      </div>
    </aside>
  );
}

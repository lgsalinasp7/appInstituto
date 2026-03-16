"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { KALED_ACADEMY_CONFIG } from "../../config/academy-tenant.config";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
  Trophy,
  LogOut,
  UserCircle,
} from "lucide-react";

interface Props {
  userName: string;
  userEmail: string;
  userImage?: string;
}

const NAV = [
  { href: "/academia/admin/analytics", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/academia/admin/courses", label: "Cursos", icon: BookOpen },
  { href: "/academia/admin/cohorts", label: "Cohortes", icon: Users },
  { href: "/academia/admin/calendar", label: "Calendario", icon: Calendar },
  { href: "/academia/admin/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/academia/admin/users", label: "Usuarios", icon: Users },
  { href: "/academia/admin/profile", label: "Mi Perfil", icon: UserCircle },
];

export function AcademyAdminSidebar({ userName, userImage }: Props) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden lg:flex flex-col w-[220px] shrink-0 academy-sidebar-rail-dark sticky top-0 h-screen">
      <div className="h-16 flex items-center px-5 border-b border-white/[0.06] gap-3">
        <div className="relative w-8 h-8 rounded-[10px] shrink-0 overflow-hidden flex items-center justify-center bg-slate-800/80">
          <Image
            src={KALED_ACADEMY_CONFIG.branding.logoUrl}
            alt="KaledAcademy"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <div>
          <div className="text-white font-bold text-[13px] leading-none tracking-tight">
            KaledAcademy
          </div>
          <div className="text-slate-500 text-[10px] mt-0.5">Admin</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
        <div className="px-2 mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">
            Administración
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

      <div className="px-3 pb-4 border-t border-white/[0.05] pt-3 flex items-center gap-2.5">
        <Link
          href="/academia/admin/profile"
          className="flex items-center gap-2.5 flex-1 min-w-0"
        >
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
            <div className="text-[10px] text-slate-500 truncate">Administrador</div>
          </div>
        </Link>
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

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { KALED_ACADEMY_CONFIG } from "../../config/academy-tenant.config";
import {
  ACADEMY_ADMIN_NAV_GROUPS,
  isAcademyAdminNavItemActive,
} from "../../config/academy-admin-nav.config";

export function AcademyAdminSidebar() {
  const pathname = usePathname();

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

      <nav className="flex-1 px-4 py-5 overflow-y-auto scrollbar-hide min-h-0 space-y-6">
        {ACADEMY_ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-0.5">
            <div className="px-2.5 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600/90">
                {group.title}
              </span>
            </div>
            {group.items.map((item) => {
              const active = isAcademyAdminNavItemActive(pathname, item);
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
          </div>
        ))}
      </nav>
    </aside>
  );
}

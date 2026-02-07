"use client";

/**
 * StatCard Component
 * Displays a single statistic with icon and trend indicator
 */

import { LucideIcon } from "lucide-react";
import { useBranding } from "@/components/providers/BrandingContext";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: "up" | "down";
  trendValue?: string;
  gradient: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  gradient,
  delay = 0,
}: StatCardProps) {
  const branding = useBranding();
  const isDark = branding.darkMode !== false;

  return (
    <div
      className={cn(
        "group relative p-3 sm:p-4 lg:p-6 rounded-[1.5rem] sm:rounded-[2rem] border transition-[transform,box-shadow,border-color] duration-500 hover:scale-[1.02] hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-6 fill-mode-both overflow-hidden shadow-sm",
        isDark
          ? "bg-slate-900/40 border-white/[0.05] hover:border-cyan-500/30"
          : "bg-white border-slate-200 hover:border-blue-500/30 hover:shadow-lg shadow-slate-200/50"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Glow Effect */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        isDark
          ? "bg-gradient-to-br from-cyan-500/0 to-cyan-500/5"
          : "bg-gradient-to-br from-blue-500/0 to-blue-500/5"
      )} />

      <div className="flex justify-between items-start mb-2 sm:mb-4 relative z-10">
        <div
          className={cn(
            `p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:rotate-6 transition-transform duration-500`
          )}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
        </div>
        {trend && trendValue && (
          <span
            className={cn(
              "hidden sm:flex items-center text-[10px] sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border",
              trend === "up"
                ? (isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-200")
                : (isDark ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-red-50 text-red-600 border-red-200")
            )}
          >
            {trend === "up" ? "↑" : "↓"} {trendValue}
          </span>
        )}
      </div>
      <h3 className={cn(
        "text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] line-clamp-1 font-display relative z-10",
        isDark ? "text-slate-500" : "text-slate-400"
      )}>
        {title}
      </h3>
      <p className={cn(
        "text-lg sm:text-xl lg:text-3xl font-bold mt-1 tracking-tighter truncate font-display relative z-10 drop-shadow-sm",
        isDark ? "text-white" : "text-slate-900"
      )} title={String(value)}>
        {value}
      </p>
    </div>
  );
}

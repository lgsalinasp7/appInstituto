"use client";

/**
 * StatCard Component
 * Estilo Amaxoft con sistema de diseño del tenant
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
        "group relative p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border transition-[transform,box-shadow,border-color] duration-500 hover:scale-[1.02] hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-8 fill-mode-both overflow-hidden",
        isDark
          ? "glass-card hover:border-cyan-500/30"
          : "bg-white/90 backdrop-blur-xl border-slate-200/80 shadow-lg shadow-slate-200/50 hover:border-blue-500/40 hover:shadow-xl"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Glow Effect - colores del tenant */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]"
        style={{
          background: isDark
            ? `linear-gradient(to bottom right, transparent, ${branding.accentColor}08)`
            : `linear-gradient(to bottom right, transparent, ${branding.primaryColor}05)`,
        }}
      />

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div
          className={cn(
            "w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 duration-500",
            `bg-gradient-to-br ${gradient} text-white shadow-lg border-white/10`
          )}
        >
          <Icon className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />
        </div>
        <span
          className={cn(
            "hidden sm:flex items-center text-[10px] font-bold px-2 py-1 rounded-lg border tracking-widest uppercase",
            isDark ? "text-white/80 bg-white/5 border-white/10" : "text-slate-500 bg-slate-100 border-slate-200"
          )}
        >
          Live
        </span>
      </div>
      <div className="space-y-2 relative z-10">
        <p
          className={cn(
            "text-[10px] sm:text-xs font-bold uppercase tracking-widest leading-none font-display",
            isDark ? "text-slate-500" : "text-slate-400"
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            "text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tighter font-display",
            isDark ? "text-white" : "text-slate-900"
          )}
          title={String(value)}
        >
          {value}
        </p>
        {trend != null && trendValue && (
          <p className={cn("text-xs font-medium pt-1", isDark ? "text-slate-500" : "text-slate-400")}>
            {trend === "up" ? "↑" : "↓"} {trendValue}
          </p>
        )}
      </div>
    </div>
  );
}

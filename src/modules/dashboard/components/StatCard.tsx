"use client";

/**
 * StatCard Component
 * Displays a single statistic with icon and trend indicator
 */

import { LucideIcon } from "lucide-react";

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
  return (
    <div
      className="group relative glass-card p-3 sm:p-4 lg:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-white/[0.05] hover:border-cyan-500/30 transition-[transform,box-shadow,border-color] duration-500 hover:scale-[1.02] hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-6 fill-mode-both"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex justify-between items-start mb-2 sm:mb-4 relative z-10">
        <div
          className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
        </div>
        {trend && trendValue && (
          <span
            className={`hidden sm:flex items-center text-[10px] sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg ${trend === "up"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
          >
            {trend === "up" ? "↑" : "↓"} {trendValue}
          </span>
        )}
      </div>
      <h3 className="text-slate-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] line-clamp-1 font-display relative z-10">
        {title}
      </h3>
      <p className="text-lg sm:text-xl lg:text-3xl font-bold text-white mt-1 tracking-tighter truncate font-display relative z-10" title={String(value)}>
        {value}
      </p>
    </div>
  );
}

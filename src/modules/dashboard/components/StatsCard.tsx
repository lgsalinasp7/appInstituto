"use client";

/**
 * Stats Card Component
 * Tarjeta de estadística con diseño institucional
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardCard } from "../types";
import { useBranding } from "@/components/providers/BrandingContext";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  card: DashboardCard;
}

export function StatsCard({ card }: StatsCardProps) {
  const branding = useBranding();
  const isDark = branding.darkMode !== false;

  return (
    <div className={cn(
      "rounded-2xl border p-6 transition-all duration-300 card-hover group",
      isDark
        ? "bg-slate-900/60 border-white/[0.08] shadow-2xl"
        : "bg-white border-slate-200 shadow-instituto"
    )}>
      <div className="flex items-center justify-between mb-4">
        <span className={cn(
          "text-sm font-bold font-display uppercase tracking-widest",
          isDark ? "text-slate-500" : "text-gray-400"
        )}>
          {card.title}
        </span>
        {card.icon && (
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-transform duration-300 group-hover:scale-110 shadow-lg",
            isDark ? "bg-white/5 shadow-white/5" : "bg-gray-50 shadow-gray-200"
          )}>
            {card.icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className={cn(
          "text-3xl font-bold font-display tracking-tighter truncate",
          isDark ? "text-white" : "text-primary"
        )} title={String(card.value)}>
          {card.value}
        </div>
        {card.description && (
          <p className={cn(
            "text-xs font-medium",
            isDark ? "text-slate-500" : "text-gray-400"
          )}>{card.description}</p>
        )}
      </div>

      {card.trend && (
        <div className="mt-4 pt-4 border-t border-dashed border-slate-800/50">
          <p className={cn(
            "text-xs flex items-center gap-1.5 font-bold",
            card.trend.isPositive
              ? (isDark ? "text-emerald-400" : "text-emerald-600")
              : (isDark ? "text-rose-400" : "text-red-600")
          )}>
            <span className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[10px]",
              card.trend.isPositive
                ? (isDark ? "bg-emerald-500/10" : "bg-emerald-100")
                : (isDark ? "bg-rose-500/10" : "bg-red-100")
            )}>
              {card.trend.isPositive ? "↑" : "↓"}
            </span>
            {Math.abs(card.trend.value)}% <span className="opacity-60 font-medium">vs mes pasado</span>
          </p>
        </div>
      )}
    </div>
  );
}

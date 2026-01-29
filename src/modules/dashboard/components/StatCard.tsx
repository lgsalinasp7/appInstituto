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
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  gradient,
}: StatCardProps) {
  return (
    <div className="group relative bg-white p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md">
      <div className="flex justify-between items-start mb-2 sm:mb-4">
        <div
          className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
        </div>
        {trend && trendValue && (
          <span
            className={`hidden sm:flex items-center text-[10px] sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg ${trend === "up"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
              }`}
          >
            {trend === "up" ? "↑" : "↓"} {trendValue}
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider line-clamp-1">
        {title}
      </h3>
      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-primary mt-0.5 sm:mt-1 tracking-tight truncate" title={String(value)}>
        {value}
      </p>
    </div>
  );
}

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
    <div className="group relative bg-white p-6 rounded-2xl border border-gray-100 hover:border-[#1e3a5f]/20 transition-all duration-300 shadow-instituto hover:shadow-instituto-lg">
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}
        >
          <Icon size={22} strokeWidth={2.5} />
        </div>
        {trend && trendValue && (
          <span
            className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-lg ${trend === "up"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
              }`}
          >
            {trend === "up" ? "↑" : "↓"} {trendValue}
          </span>
        )}
      </div>
      <h3 className="text-[#64748b] text-[10px] font-bold uppercase tracking-wider">
        {title}
      </h3>
      <p className="text-2xl font-bold text-[#1e3a5f] mt-1 tracking-tight truncate" title={String(value)}>
        {value}
      </p>
    </div>
  );
}

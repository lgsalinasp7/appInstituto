"use client";

/**
 * RevenueChart Component
 * Bar chart showing revenue growth
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { RevenueData } from "../types";
import { useBranding } from "@/components/providers/BrandingContext";
import { cn } from "@/lib/utils";

interface RevenueChartProps {
  data: RevenueData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const branding = useBranding();
  const isDark = branding.darkMode !== false;

  return (
    <div className={cn(
      "p-4 sm:p-5 lg:p-7 rounded-xl sm:rounded-2xl border transition-colors shadow-sm",
      isDark ? "bg-slate-900/40 border-white/[0.05]" : "bg-white border-slate-200 shadow-slate-200/50"
    )}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h3 className={cn(
          "font-bold text-sm sm:text-base lg:text-lg",
          isDark ? "text-slate-100" : "text-primary"
        )}>
          Crecimiento de Ingresos
        </h3>
        <select className={cn(
          "text-xs font-semibold px-3 sm:px-4 py-2 border rounded-lg sm:rounded-xl outline-none focus:ring-2 cursor-pointer w-full sm:w-auto transition-all",
          isDark
            ? "bg-slate-800 border-slate-700 text-slate-300 focus:ring-cyan-500/20"
            : "bg-gray-50 border-gray-200 text-gray-600 focus:ring-blue-500/20"
        )}>
          <option>Últimos 30 días</option>
          <option>Este mes</option>
        </select>
      </div>
      <div className="h-52 sm:h-64 lg:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDark ? "#1e293b" : "#e2e8f0"}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? "#475569" : "#64748b", fontSize: 10, fontWeight: 600 }}
              dy={8}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? "#475569" : "#64748b", fontSize: 10, fontWeight: 600 }}
              width={40}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                backgroundColor: isDark ? "#0f172a" : "#ffffff",
                boxShadow: isDark ? "0 10px 40px rgba(0, 0, 0, 0.5)" : "0 10px 40px rgba(30, 58, 95, 0.15)",
                fontWeight: 600,
                color: isDark ? "#f1f5f9" : "#1e293b",
              }}
              cursor={{ fill: isDark ? "#1e293b" : "#f1f5f9" }}
            />
            <Bar
              dataKey="total"
              fill="url(#colorGradient)"
              radius={[8, 8, 0, 0]}
              animationDuration={1500}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isDark ? "#06b6d4" : "#1e3a5f"}
                  stopOpacity={1}
                />
                <stop
                  offset="100%"
                  stopColor={isDark ? "#3b82f6" : "#2d4a6f"}
                  stopOpacity={0.8}
                />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

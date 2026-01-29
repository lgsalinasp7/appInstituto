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

interface RevenueChartProps {
  data: RevenueData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="bg-white p-4 sm:p-5 lg:p-7 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h3 className="font-bold text-sm sm:text-base lg:text-lg text-primary">
          Crecimiento de Ingresos
        </h3>
        <select className="bg-gray-50 text-xs font-semibold px-3 sm:px-4 py-2 border border-gray-200 rounded-lg sm:rounded-xl outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer w-full sm:w-auto">
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
              stroke="#e2e8f0"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
              dy={8}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
              width={40}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 40px rgba(30, 58, 95, 0.15)",
                fontWeight: 600,
              }}
              cursor={{ fill: "#f1f5f9" }}
            />
            <Bar dataKey="total" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e3a5f" stopOpacity={1} />
                <stop offset="100%" stopColor="#2d4a6f" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

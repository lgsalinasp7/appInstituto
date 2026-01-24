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
    <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-instituto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-[#1e3a5f]">
          Crecimiento de Ingresos
        </h3>
        <select className="bg-gray-50 text-xs font-semibold px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 cursor-pointer">
          <option>Últimos 30 días</option>
          <option>Este mes</option>
        </select>
      </div>
      <div className="h-80 w-full">
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
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
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

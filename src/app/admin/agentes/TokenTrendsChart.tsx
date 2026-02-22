"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { TokenTrendPoint } from "@/modules/chat/types/agent.types";

const AreaChart = dynamic(
  () =>
    import("recharts").then((m) => {
      const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } = m;

      function Chart({ data }: { data: TokenTrendPoint[] }) {
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "12px",
                  color: "#e2e8f0",
                }}
                labelFormatter={(value) => {
                  const date = new Date(value as string);
                  return date.toLocaleDateString("es-CO");
                }}
                formatter={(value: any, name: any) => {
                  if (name === "tokens") return [value.toLocaleString("es-CO"), "Tokens"];
                  if (name === "messages") return [value.toLocaleString("es-CO"), "Mensajes"];
                  if (name === "cost") return [`$${value.toFixed(2)} COP`, "Costo"];
                  return [value, name];
                }}
              />
              <Area
                type="monotone"
                dataKey="tokens"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTokens)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      }

      return Chart;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] flex items-center justify-center text-slate-500 text-sm">
        Cargando gráfico...
      </div>
    ),
  }
);

export function TokenTrendsChart() {
  const [data, setData] = useState<TokenTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/agents/trends?period=daily&days=30");
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Error fetching token trends:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="lg:col-span-2 glass-card rounded-[2rem] p-8 animate-fade-in-up">
      <h3 className="text-xl font-bold text-white mb-6">
        Consumo de Tokens (últimos 30 días)
      </h3>
      {loading ? (
        <div className="h-[300px] flex items-center justify-center text-slate-500 text-sm">
          Cargando datos...
        </div>
      ) : data.length > 0 ? (
        <AreaChart data={data} />
      ) : (
        <div className="h-[300px] flex items-center justify-center text-slate-500 text-sm">
          No hay datos de consumo disponibles
        </div>
      )}
    </div>
  );
}

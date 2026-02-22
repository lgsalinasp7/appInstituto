"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { ModelDistribution } from "@/modules/chat/types/agent.types";

const PieChart = dynamic(
  () =>
    import("recharts").then((m) => {
      const { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } = m;

      const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

      function Chart({ data }: { data: ModelDistribution[] }) {
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="tokens"
                label={(entry: any) => `${entry.percentage.toFixed(1)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "12px",
                  color: "#e2e8f0",
                }}
                formatter={(value: any, name: any, props: any) => {
                  if (name === "tokens") {
                    return [
                      `${value.toLocaleString("es-CO")} tokens (${props.payload.percentage.toFixed(1)}%)`,
                      props.payload.modelName,
                    ];
                  }
                  return [value, name];
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry: any) => (
                  <span className="text-sm text-slate-300">{entry.payload.modelName}</span>
                )}
              />
            </PieChart>
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

export function ModelDistributionChart() {
  const [data, setData] = useState<ModelDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/agents/models/distribution");
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Error fetching model distribution:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="glass-card rounded-[2rem] p-8 animate-fade-in-up">
      <h3 className="text-xl font-bold text-white mb-6">
        Distribución por Modelo
      </h3>
      {loading ? (
        <div className="h-[300px] flex items-center justify-center text-slate-500 text-sm">
          Cargando datos...
        </div>
      ) : data.length > 0 ? (
        <>
          <PieChart data={data} />
          <div className="mt-6 space-y-2">
            {data.map((model, index) => (
              <div key={model.model} className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{model.modelName}</span>
                <span className="text-white font-medium">
                  {model.tokens.toLocaleString("es-CO")} tokens
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-slate-500 text-sm">
          No hay datos de distribución disponibles
        </div>
      )}
    </div>
  );
}

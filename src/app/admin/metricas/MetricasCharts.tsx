"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// bundle-dynamic-imports: defer recharts loading
const GrowthChart = dynamic(
  () =>
    import("recharts").then((m) => {
      const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } = m;

      function Chart({ data }: { data: { month: string; count: number }[] }) {
        return (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "12px",
                  color: "#e2e8f0",
                }}
              />
              <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      }

      return Chart;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="h-[250px] flex items-center justify-center text-slate-500 text-sm">
        Cargando gráfico...
      </div>
    ),
  }
);

// Const types pattern (typescript skill)
const PLAN_BADGE_COLORS = {
  BASICO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PROFESIONAL: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  EMPRESARIAL: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
} as const;

interface PlanDistItem {
  plan: string;
  count: number;
  percentage: number;
}

interface MonthlyGrowthItem {
  month: string;
  count: number;
}

interface TopItem {
  name: string;
  plan: string;
  count: number;
}

interface MetricasChartsProps {
  planDistribution: PlanDistItem[];
  monthlyGrowth: MonthlyGrowthItem[];
  topStudents: TopItem[];
  topPayments: TopItem[];
}

export function MetricasCharts({
  planDistribution,
  monthlyGrowth,
  topStudents,
  topPayments,
}: MetricasChartsProps) {
  return (
    <div className="space-y-8">
      {/* Row 1: Growth + Distribution */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Growth Chart */}
        <div className="lg:col-span-2 glass-card rounded-[2rem] p-8">
          <h3 className="text-xl font-bold text-white mb-6">
            Crecimiento de Empresas (últimos 6 meses)
          </h3>
          {monthlyGrowth.length > 0 ? (
            <GrowthChart data={monthlyGrowth} />
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-500 text-sm">
              Sin datos de crecimiento disponibles
            </div>
          )}
        </div>

        {/* Plan Distribution */}
        <div className="glass-card rounded-[2rem] p-8">
          <h3 className="text-xl font-bold text-white mb-6">Distribución por Plan</h3>
          <div className="space-y-4">
            {planDistribution.length > 0 ? (
              planDistribution.map((item) => (
                <div key={item.plan} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-xs font-bold px-2.5 py-1 rounded-lg border",
                        PLAN_BADGE_COLORS[item.plan as keyof typeof PLAN_BADGE_COLORS] ??
                          "bg-slate-500/10 text-slate-400 border-slate-500/20"
                      )}
                    >
                      {item.plan}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {item.count}{" "}
                      <span className="text-slate-500 font-normal">({item.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm text-center py-8">Sin datos</p>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Top Lists */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top by Students */}
        <div className="glass-card rounded-[2rem] p-8">
          <h3 className="text-xl font-bold text-white mb-6">Top 5 por Estudiantes</h3>
          <div className="space-y-3">
            {topStudents.length > 0 ? (
              topStudents.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded",
                          PLAN_BADGE_COLORS[item.plan as keyof typeof PLAN_BADGE_COLORS] ??
                            "bg-slate-500/10 text-slate-400"
                        )}
                      >
                        {item.plan}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-white">
                    {item.count.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm text-center py-8">Sin datos</p>
            )}
          </div>
        </div>

        {/* Top by Payments */}
        <div className="glass-card rounded-[2rem] p-8">
          <h3 className="text-xl font-bold text-white mb-6">Top 5 por Pagos Registrados</h3>
          <div className="space-y-3">
            {topPayments.length > 0 ? (
              topPayments.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded",
                          PLAN_BADGE_COLORS[item.plan as keyof typeof PLAN_BADGE_COLORS] ??
                            "bg-slate-500/10 text-slate-400"
                        )}
                      >
                        {item.plan}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-white">
                    {item.count.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm text-center py-8">Sin datos</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

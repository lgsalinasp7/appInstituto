'use client';

import dynamic from 'next/dynamic';

// Dynamic imports for recharts (client-side only)
const BarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { ssr: false }
);
const LineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  { ssr: false }
);
const PieChart = dynamic(
  () => import('recharts').then((mod) => mod.PieChart),
  { ssr: false }
);
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), {
  ssr: false,
});
const Line = dynamic(() => import('recharts').then((mod) => mod.Line), {
  ssr: false,
});
const Pie = dynamic(() => import('recharts').then((mod) => mod.Pie), {
  ssr: false,
});
const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), {
  ssr: false,
});
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), {
  ssr: false,
});
const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), {
  ssr: false,
});
const Legend = dynamic(() => import('recharts').then((mod) => mod.Legend), {
  ssr: false,
});
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

interface KaledAnalyticsChartsProps {
  byStage: Record<string, number>;
  timeline: Array<{ date: string; count: number }>;
  byCampaign: Array<{ name: string; count: number }>;
}

const COLORS = {
  NUEVO: '#06b6d4', // cyan
  CONTACTADO: '#eab308', // yellow
  DEMO: '#a855f7', // purple
  CONVERTIDO: '#22c55e', // green
  PERDIDO: '#ef4444', // red
};

export default function KaledAnalyticsCharts({
  byStage,
  timeline,
  byCampaign,
}: KaledAnalyticsChartsProps) {
  // Prepare data for charts
  const stageData = Object.entries(byStage).map(([stage, count]) => ({
    stage,
    count,
    fill: COLORS[stage as keyof typeof COLORS] || '#94a3b8',
  }));

  const campaignData = byCampaign.map((item, index) => ({
    ...item,
    fill: [
      '#06b6d4',
      '#3b82f6',
      '#8b5cf6',
      '#ec4899',
      '#f59e0b',
      '#10b981',
    ][index % 6],
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Bar Chart: Leads por Estado */}
      <div className="glass-card rounded-[2.5rem] p-6">
        <h3 className="text-xl font-bold text-white mb-6">Leads por Estado</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stageData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="stage" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '0.5rem',
                color: '#fff',
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {stageData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart: Conversión en el Tiempo */}
      <div className="glass-card rounded-[2.5rem] p-6">
        <h3 className="text-xl font-bold text-white mb-6">
          Conversión en el Tiempo
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '0.5rem',
                color: '#fff',
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#06b6d4"
              strokeWidth={3}
              dot={{ fill: '#06b6d4', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart: Leads por Campaña */}
      <div className="glass-card rounded-[2.5rem] p-6 md:col-span-2">
        <h3 className="text-xl font-bold text-white mb-6">
          Leads por Campaña
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={campaignData}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(entry: any) => `${entry.name}: ${entry.count}`}
            >
              {campaignData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '0.5rem',
                color: '#fff',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

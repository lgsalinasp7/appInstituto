"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  BarChart3,
  Users,
  GraduationCap,
  Sparkles,
  Percent,
  Mail,
  Loader2,
  ExternalLink,
} from "lucide-react";

const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), {
  ssr: false,
});

export type TenantOverviewData = {
  openCohortsCount: number;
  totalActiveEnrollments: number;
  trialStudents: number;
  avgProgressGlobal: string;
  pendingInvitations: number;
  cohortSummaries: Array<{
    id: string;
    name: string;
    status: string;
    courseTitle: string;
    activeStudents: number;
    avgProgress: string;
  }>;
};

function truncateLabel(s: string, max = 14) {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function AdminAnalyticsOverview() {
  const [data, setData] = useState<TenantOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // initial useState values (loading=true, error=null) cover the pre-fetch state
    let cancelled = false;
    fetch("/api/academy/admin/analytics/overview", { credentials: "include" })
      .then((r) => r.json())
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) setData(res.data);
        else setError(res.error || "No se pudo cargar el resumen");
      })
      .catch(() => {
        if (!cancelled) setError("Error de red al cargar analytics");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = useMemo(() => {
    if (!data?.cohortSummaries?.length) return [];
    return data.cohortSummaries.map((c) => ({
      label: truncateLabel(c.name, 16),
      fullName: c.name,
      estudiantes: c.activeStudents,
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="academy-card-dark p-8 rounded-xl border border-white/[0.08] text-center">
        <p className="text-slate-400">{error || "Sin datos"}</p>
      </div>
    );
  }

  const kpi = [
    {
      label: "Cohortes abiertos",
      value: data.openCohortsCount,
      sub: "Activos + borrador",
      icon: BarChart3,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
    },
    {
      label: "Matrículas activas",
      value: data.totalActiveEnrollments,
      sub: "Estudiantes con cohorte",
      icon: GraduationCap,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "En prueba",
      value: data.trialStudents,
      sub: "Acceso trial",
      icon: Sparkles,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Progreso medio",
      value: `${data.avgProgressGlobal}%`,
      sub: "Todos los cohortes",
      icon: Percent,
      color: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/20",
    },
    {
      label: "Invitaciones pendientes",
      value: data.pendingInvitations,
      sub: "Por aceptar",
      icon: Mail,
      color: "text-sky-400",
      bg: "bg-sky-500/10 border-sky-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-slate-400 text-sm">
          Vista consolidada del tenant. Gestiona cohortes y usuarios desde el menú lateral.
        </p>
        <Link
          href="/academia/admin/users?tab=trial"
          className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Usuarios de prueba
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpi.map((item) => (
          <div
            key={item.label}
            className={`academy-card-dark p-5 rounded-xl border ${item.bg} border-white/[0.08]`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {item.label}
                </p>
                <p className="text-2xl font-black text-white mt-1 font-display tabular-nums">{item.value}</p>
                <p className="text-[10px] text-slate-500 mt-1">{item.sub}</p>
              </div>
              <div className={`p-2 rounded-lg border border-white/10 ${item.bg}`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="academy-card-dark p-6 rounded-xl border border-white/[0.08]">
        <h2 className="text-lg font-bold text-white font-display mb-1">Estudiantes por cohorte</h2>
        <p className="text-xs text-slate-500 mb-6">Matrículas activas (máx. 50 cohortes recientes)</p>
        {chartData.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">No hay cohortes aún. Crea uno en Cursos o Cohortes.</p>
        ) : (
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  interval={0}
                  angle={-28}
                  textAnchor="end"
                  height={56}
                />
                <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.95)",
                    border: "1px solid rgba(56,189,248,0.25)",
                    borderRadius: 12,
                  }}
                  labelStyle={{ color: "#e2e8f0" }}
                  formatter={(value) => [value ?? 0, "Estudiantes"]}
                  labelFormatter={(_, payload) =>
                    (payload?.[0]?.payload as { fullName?: string })?.fullName ?? ""
                  }
                />
                <Bar dataKey="estudiantes" fill="#22d3ee" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="academy-card-dark p-6 rounded-xl border border-white/[0.08] overflow-x-auto">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold text-white font-display">Detalle por cohorte</h2>
          <Link
            href="/academia/admin/cohorts"
            className="text-xs font-semibold text-cyan-400 hover:underline shrink-0"
          >
            Ir a gestión de cohortes
          </Link>
        </div>
        {data.cohortSummaries.length === 0 ? (
          <p className="text-sm text-slate-500 py-6">Sin cohortes en este instituto.</p>
        ) : (
          <table className="w-full text-sm text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-white/[0.08] text-[11px] uppercase tracking-wider text-slate-500">
                <th className="py-3 pr-4 font-bold">Cohorte</th>
                <th className="py-3 pr-4 font-bold">Curso</th>
                <th className="py-3 pr-4 font-bold">Estado</th>
                <th className="py-3 pr-4 font-bold text-right">Estudiantes</th>
                <th className="py-3 pr-4 font-bold text-right">Progreso ∅</th>
                <th className="py-3 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.cohortSummaries.map((c) => (
                <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="py-3 pr-4 font-medium text-white">{c.name}</td>
                  <td className="py-3 pr-4 text-slate-400">{c.courseTitle}</td>
                  <td className="py-3 pr-4">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums text-slate-300">{c.activeStudents}</td>
                  <td className="py-3 pr-4 text-right tabular-nums text-slate-300">{c.avgProgress}%</td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/academia/admin/cohorts/${c.id}/students`}
                      className="inline-flex items-center gap-1 text-cyan-400 hover:underline text-xs font-semibold"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Estudiantes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

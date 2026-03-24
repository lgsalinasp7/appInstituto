"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Cohort {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  kind?: string;
  maxStudents?: number;
  currentStudents?: number;
  _count?: { enrollments: number };
  course: { title: string };
}

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  ACTIVE: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  COMPLETED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function CohortsManagement() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/academy/cohorts")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCohorts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="academy-card-dark p-8">
        <h1 className="text-2xl font-bold text-white mb-6 font-display tracking-tight">Cohortes</h1>
        <p className="text-slate-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black tracking-tight text-white font-display">Gestión de Cohortes</h1>
      <div className="academy-card-dark p-6 flex flex-col gap-6 rounded-xl border border-white/[0.08] shadow-none">
        <h2 className="text-lg font-bold text-white font-display">Lista de cohortes</h2>
        <div className="space-y-2">
          {cohorts.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
            >
              <div>
                <p className="font-semibold text-white">{c.name}</p>
                <p className="text-sm text-slate-400">{c.course.title}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(c.startDate).toLocaleDateString()} -{" "}
                  {new Date(c.endDate).toLocaleDateString()}
                  {" • "}
                  {c._count?.enrollments ?? c.currentStudents ?? 0}
                  {c.maxStudents != null ? `/${c.maxStudents}` : ""} estudiantes
                  {c.kind === "PROMOTIONAL" ? " · Promocional" : ""}
                </p>
              </div>
              <span className={cn(
                "text-xs font-medium px-2 py-1 rounded-lg border",
                STATUS_STYLE[c.status] ?? "bg-slate-500/20 text-slate-400 border-slate-500/30"
              )}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
        {cohorts.length === 0 && (
          <p className="text-slate-500">No hay cohortes.</p>
        )}
      </div>
    </div>
  );
}

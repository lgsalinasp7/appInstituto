"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Trophy,
  BarChart3,
  FileCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { AdminCohortPicker } from "./AdminCohortPicker";
import { DeliverablesReview } from "../teacher/DeliverablesReview";
import { KaledAlertPanel } from "../teacher/KaledAlertPanel";
import { EvaluationQueue } from "../teacher/EvaluationQueue";

const STORAGE_KEY = "kaledacademy_admin_selected_cohort_id";

export function AdminOperationsClient() {
  const [cohortId, setCohortId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [cohortMeta, setCohortMeta] = useState<{ name: string; courseTitle: string } | null>(null);
  const [stats, setStats] = useState<{ students: number; ranking: number } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard reading from localStorage on mount
    if (stored) setCohortId(stored);
    setHydrated(true);
  }, []);

  const handleCohort = useCallback((id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setCohortId(id);
  }, []);

  useEffect(() => {
    if (!cohortId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset state when cohortId is null
      setCohortMeta(null);
      setStats(null);
      return;
    }
    let cancelled = false;
    Promise.all([
      fetch(`/api/academy/cohorts/${cohortId}/analytics`).then((r) => r.json()),
      fetch(`/api/academy/cohorts/${cohortId}/ranking`).then((r) => r.json()),
      fetch("/api/academy/cohorts", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([analytics, ranking, cohortsRes]) => {
        if (cancelled) return;
        const rankArr = Array.isArray(ranking) ? ranking : [];
        const cohorts = Array.isArray(cohortsRes?.data) ? cohortsRes.data : [];
        const c = cohorts.find((x: { id: string }) => x.id === cohortId);
        setCohortMeta({
          name: typeof c?.name === "string" ? c.name : "Cohorte",
          courseTitle: typeof c?.course?.title === "string" ? c.course.title : "",
        });
        const totalStudents =
          typeof analytics?.totalStudents === "number" ? analytics.totalStudents : rankArr.length;
        setStats({ students: totalStudents, ranking: rankArr.length });
      })
      .catch(() => {
        if (!cancelled) {
          setCohortMeta({ name: "Cohorte", courseTitle: "" });
          setStats(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [cohortId]);

  if (!hydrated) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-black tracking-tight text-white font-display">Operación</h1>
        <p className="text-slate-400">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white font-display">Operación</h1>
        <p className="text-slate-400 mt-1">
          Seguimiento del cohorte, entregables, alertas y cola de evaluaciones sin cambiar al panel de
          profesor.
        </p>
      </div>

      <AdminCohortPicker value={cohortId} onChange={handleCohort} />

      {cohortId ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href={`/academia/admin/cohorts/${cohortId}/students`}
              className="academy-card-dark p-5 flex items-center gap-4 hover:border-cyan-500/20 transition-colors"
            >
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-400">Estudiantes</p>
                <p className="text-lg font-bold tabular-nums text-white leading-snug">
                  {stats?.students ?? "—"}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
            </Link>
            <Link
              href={`/academia/admin/leaderboard?cohortId=${encodeURIComponent(cohortId)}`}
              className="academy-card-dark p-5 flex items-center gap-4 hover:border-cyan-500/20 transition-colors"
            >
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-400">Ranking</p>
                <p className="text-lg font-bold text-white leading-snug">
                  <span className="tabular-nums">{stats?.ranking ?? "—"}</span>
                  <span className="text-sm font-medium text-slate-400"> participantes</span>
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
            </Link>
            <Link
              href="/academia/admin/courses"
              className="academy-card-dark p-5 flex items-center gap-4 hover:border-cyan-500/20 transition-colors"
            >
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <BookOpen className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-400">Cursos</p>
                <p className="text-sm font-semibold text-white truncate">
                  {cohortMeta?.courseTitle || "Ver cursos"}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
            </Link>
            <div className="academy-card-dark p-5 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-400">Cohorte</p>
                <p className="text-sm font-semibold text-white truncate">{cohortMeta?.name ?? "—"}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/academia/admin/deliverables"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300"
            >
              <FileCheck className="w-4 h-4" />
              Vista completa de entregables
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </Link>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <FileCheck className="w-4 h-4 text-cyan-400" />
            <h2 className="text-lg font-bold text-white font-display">Entregables (vista rápida)</h2>
          </div>
          <DeliverablesReview cohortId={cohortId} showQueueTabs />

          <KaledAlertPanel />

          <EvaluationQueue />
        </>
      ) : (
        <div className="academy-card-dark p-8">
          <p className="text-slate-400">Selecciona un cohorte para ver operación y entregables.</p>
        </div>
      )}
    </div>
  );
}

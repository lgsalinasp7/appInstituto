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
} from "lucide-react";
import { DeliverablesReview } from "./DeliverablesReview";

interface CohortSummary {
  id: string;
  name: string;
  courseId: string;
  course?: { id: string; title: string };
  enrollments?: Array<{ user: { id: string; name: string | null; image: string | null } }>;
}

export function TeacherDashboard() {
  const [cohort, setCohort] = useState<CohortSummary | null>(null);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [ranking, setRanking] = useState<Array<{ rank: number; student: { name: string | null }; lessonsCompleted: number }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const cohortRes = await fetch("/api/academy/cohorts/active");
      const cohortData = await cohortRes.json();
      const activeCohort = cohortData?.id ? cohortData : null;
      setCohort(activeCohort);

      if (activeCohort?.id) {
        const [analyticsRes, rankingRes] = await Promise.all([
          fetch(`/api/academy/cohorts/${activeCohort.id}/analytics`),
          fetch(`/api/academy/cohorts/${activeCohort.id}/ranking`),
        ]);
        const analyticsJson = await analyticsRes.json();
        const rankingJson = await rankingRes.json();
        setAnalytics(typeof analyticsJson === "object" && !Array.isArray(analyticsJson) ? analyticsJson : null);
        setRanking(Array.isArray(rankingJson) ? rankingJson : []);
      } else {
        setAnalytics(null);
        setRanking([]);
      }
    } catch {
      setCohort(null);
      setAnalytics(null);
      setRanking([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="academy-card-dark p-8">
        <p className="text-slate-400">Cargando panel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-white font-display">Panel del Instructor</h1>
        <p className="text-slate-400 mt-1">Gestiona tu cohorte activa, estudiantes y entregables.</p>
      </header>

      {cohort ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/academia/teacher/students"
              className="academy-card-dark p-5 flex items-center gap-4 hover:border-cyan-500/20 transition-colors"
            >
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-400">Estudiantes</p>
                <p className="text-xl font-bold text-white">{cohort.enrollments?.length ?? 0}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
            </Link>
            <Link
              href="/academia/teacher/leaderboard"
              className="academy-card-dark p-5 flex items-center gap-4 hover:border-cyan-500/20 transition-colors"
            >
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-400">Ranking</p>
                <p className="text-xl font-bold text-white">{ranking.length} participantes</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
            </Link>
            <Link
              href="/academia/teacher/courses"
              className="academy-card-dark p-5 flex items-center gap-4 hover:border-cyan-500/20 transition-colors"
            >
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <BookOpen className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-400">Curso</p>
                <p className="text-sm font-semibold text-white truncate">{cohort.course?.title ?? cohort.name}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
            </Link>
            <Link
              href="/academia/teacher/calendar"
              className="academy-card-dark p-5 flex items-center gap-4 hover:border-cyan-500/20 transition-colors"
            >
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-400">Cohorte</p>
                <p className="text-sm font-semibold text-white truncate">{cohort.name}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
            </Link>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <FileCheck className="w-4 h-4 text-cyan-400" />
            <h2 className="text-lg font-bold text-white font-display">Entregables pendientes</h2>
          </div>
          <DeliverablesReview cohortId={cohort.id} />
        </>
      ) : (
        <div className="academy-card-dark p-8">
          <p className="text-slate-400 mb-4">No hay cohorte activa.</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/academia/teacher/students"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30"
            >
              <Users className="w-4 h-4" />
              Estudiantes
            </Link>
            <Link
              href="/academia/teacher/courses"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30"
            >
              <BookOpen className="w-4 h-4" />
              Cursos
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

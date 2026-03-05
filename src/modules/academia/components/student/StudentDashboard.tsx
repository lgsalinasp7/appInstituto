"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, CalendarDays, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseSummary {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  cohortId?: string | null;
}

interface CalendarEvent {
  id: string;
  name: string;
  courseTitle: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  rank: number;
}

interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  currentUserEntry: LeaderboardEntry | null;
}

export function StudentDashboard() {
  const [summaries, setSummaries] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCohort, setNextCohort] = useState<CalendarEvent | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);

  useEffect(() => {
    fetch("/api/academy/progress")
      .then((r) => r.json())
      .then((res) => { if (res.success) setSummaries(res.data); setLoading(false); })
      .catch(() => setLoading(false));

    const today = new Date();
    fetch("/api/academy/student/calendar")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          const upcoming = (res.data as CalendarEvent[])
            .filter((e) => new Date(e.endDate) >= today)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
          setNextCohort(upcoming[0] ?? null);
        }
      })
      .catch(() => {});

    fetch("/api/academy/student/leaderboard")
      .then((r) => r.json())
      .then((res) => { if (res.success) setLeaderboard(res.data); })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="academy-card-dark p-8">
        <h1 className="text-2xl font-bold text-white mb-6 font-display tracking-tight">Mi Academia</h1>
        <p className="text-slate-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-white font-display">Bienvenido a Academia</h1>
        <p className="text-slate-400 mt-1.5 text-base">
          Continúa tu aprendizaje y revisa tu progreso.
        </p>
      </header>

      {/* Widgets de resumen: próxima cohorte + posición leaderboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Próxima cohorte */}
        <Link
          href={nextCohort ? `/academia/student/cohort/${nextCohort.id}` : "/academia/student/calendar"}
          className="academy-card-dark p-5 flex items-start gap-4 hover:border-cyan-500/20 transition-colors group"
        >
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shrink-0">
            <CalendarDays className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Próxima Cohorte</p>
            {nextCohort ? (
              <>
                <p className="text-sm font-semibold text-white truncate">{nextCohort.name}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{nextCohort.courseTitle}</p>
                <p className="text-xs text-cyan-400 mt-1">
                  {new Date(nextCohort.startDate).toLocaleDateString("es-CO", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500">Sin cohortes próximas</p>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 shrink-0 mt-0.5" />
        </Link>

        {/* Posición leaderboard */}
        <Link
          href="/academia/student/leaderboard"
          className="academy-card-dark p-5 flex items-start gap-4 hover:border-cyan-500/20 transition-colors group"
        >
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 shrink-0">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mi Posición</p>
            {leaderboard?.currentUserEntry ? (
              <>
                <p className="text-2xl font-black text-white font-display">
                  #{leaderboard.currentUserEntry.rank}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {leaderboard.currentUserEntry.points} pts · {leaderboard.entries.length} participantes
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500">Comienza a completar lecciones</p>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 shrink-0 mt-0.5" />
        </Link>
      </div>

      {/* Mis cursos */}
      <div className="academy-card-dark p-6">
        <h2 className="text-lg font-bold text-white mb-5 font-display tracking-tight">Mis Cursos</h2>
        {summaries.length === 0 ? (
          <p className="text-slate-400">No tienes cursos inscritos.</p>
        ) : (
          <div className="space-y-3">
            {summaries.map((s) => {
              const href = s.cohortId ? `/academia/student/cohort/${s.cohortId}` : `/academia/student/courses/${s.courseId}`;
              return (
              <Link
                key={s.courseId}
                href={href}
                className={cn(
                  "group flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] hover:border-cyan-500/20 hover:bg-white/[0.03] transition-all duration-200"
                )}
              >
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{s.courseTitle}</p>
                  <div className="h-1.5 rounded-full bg-white/10 mt-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                      style={{ width: `${s.progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {s.completedLessons} / {s.totalLessons} lecciones
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
              </Link>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

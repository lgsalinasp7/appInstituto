"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ChevronRight } from "lucide-react";

interface CourseProgressSummary {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
}

export function ProgressView() {
  const [summaries, setSummaries] = useState<CourseProgressSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/academy/progress")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setSummaries(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="academy-card-dark p-8">
        <h1 className="text-2xl font-bold text-white mb-6 font-display tracking-tight">Mi Progreso</h1>
        <p className="text-slate-400">Cargando...</p>
      </div>
    );
  }

  const totalCompleted = summaries.reduce((s, c) => s + c.completedLessons, 0);
  const totalLessons = summaries.reduce((s, c) => s + c.totalLessons, 0);
  const overallPercent = totalLessons > 0 ? (totalCompleted / totalLessons) * 100 : 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black tracking-tight text-white font-display">Mi Progreso</h1>

      <Card className="academy-card-dark border-white/[0.08] shadow-none">
        <CardHeader>
          <CardTitle className="text-white font-display">Progreso General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
          <p className="text-sm text-slate-400 mt-2">
            {totalCompleted} de {totalLessons} lecciones completadas
          </p>
        </CardContent>
      </Card>

      <Card className="academy-card-dark border-white/[0.08] shadow-none">
        <CardHeader>
          <CardTitle className="text-white font-display">Por Curso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {summaries.map((s) => (
            <Link
              key={s.courseId}
              href={`/academia/student/courses/${s.courseId}`}
              className="group flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] hover:border-cyan-500/20 hover:bg-white/[0.03] transition-all duration-200"
            >
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <BookOpen className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{s.courseTitle}</p>
                <div className="h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
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
          ))}
          {summaries.length === 0 && (
            <p className="text-slate-400">No tienes cursos inscritos.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

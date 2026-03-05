"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Clock3, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Enrollment {
  id: string;
  courseId: string;
  cohortId?: string | null;
  progress: number;
  course: {
    id: string;
    title: string;
    description: string;
    level: string;
  };
}

export function CourseList() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/academy/enrollments")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setEnrollments(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="academy-card-dark p-6 md:p-8">
        <h1 className="text-3xl font-black tracking-tight text-white font-display">Mis cursos</h1>
        <p className="text-slate-400 mt-2">Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="academy-banner-dark p-6 md:p-8 flex flex-col sm:flex-row items-start gap-6">
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-cyan-300" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white font-display">Elige tu camino en tecnología</h1>
          <p className="text-slate-300 mt-2 max-w-2xl text-base leading-relaxed">
            Programas con foco en empleabilidad que se adaptan a tus necesidades.
          </p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white font-display tracking-tight">Carreras</h2>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {enrollments.map((e) => {
          const href = e.cohortId ? `/academia/student/cohort/${e.cohortId}` : `/academia/student/courses/${e.courseId}`;
          return (
          <Link key={e.id} href={href} className="group">
            <article className="academy-card-dark overflow-hidden transition-all duration-200 group-hover:border-cyan-500/20 group-hover:-translate-y-0.5">
              <div className="h-36 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_70%_20%,rgba(34,211,238,0.12)_0%,transparent_50%)]" />
                <div className="absolute left-4 top-4 academy-pill-dark px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                  {e.course.level}
                </div>
                <div className="absolute left-4 bottom-4 w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-cyan-300/90" />
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-white font-display">{e.course.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {e.course.description}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="w-3.5 h-3.5" />
                    Progreso {Number(e.progress).toFixed(0)}%
                  </span>
                  <span className="font-semibold text-cyan-400 group-hover:text-cyan-300 inline-flex items-center gap-1 transition-colors">
                    Ver más
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      Number(e.progress) >= 100 ? "bg-emerald-500" : "bg-gradient-to-r from-cyan-500 to-blue-500"
                    )}
                    style={{ width: `${Math.min(Number(e.progress), 100)}%` }}
                  />
                </div>
                <span className="academy-btn-vermas-dark inline-flex items-center justify-center gap-1.5 w-full py-2.5 text-sm group-hover:border-cyan-500/30">
                  Ver más
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </article>
          </Link>
        );
        })}
      </div>
      {enrollments.length === 0 && (
        <div className="academy-card-dark p-8 text-center">
          <p className="text-slate-400">Aún no tienes cursos inscritos.</p>
        </div>
      )}
    </div>
  );
}

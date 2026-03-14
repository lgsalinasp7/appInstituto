"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronDown,
  Lock,
  Clock3,
  CalendarDays,
  BookOpen,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonSummary {
  id: string;
  title: string;
  duration: number;
  order: number;
}

interface ModuleSummary {
  id: string;
  title: string;
  order: number;
  lessons: LessonSummary[];
}

interface CohortSummary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface CourseOverviewData {
  course: {
    id: string;
    title: string;
    description: string;
    description2?: string | null;
    duration: string;
    durationWeeks?: number | null;
    level: string;
    modules: ModuleSummary[];
  };
  cohorts: CohortSummary[];
  completedLessonIds: string[];
  enrollmentStatus: string | null;
}

export function CourseOverview({ data }: { data: CourseOverviewData }) {
  const { course, cohorts, completedLessonIds, enrollmentStatus } = data;
  const [openModuleId, setOpenModuleId] = useState<string | null>(
    course.modules[0]?.id ?? null
  );

  const completedSet = new Set(completedLessonIds);
  const totalLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );
  const progressPercent =
    totalLessons > 0 ? Math.round((completedSet.size / totalLessons) * 100) : 0;

  const totalHours = Math.round(
    course.modules.reduce(
      (acc, m) => acc + m.lessons.reduce((a, l) => a + l.duration, 0),
      0
    ) / 60
  );

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const e = new Date(end).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return `${s} – ${e}`;
  };

  const statusLabel =
    enrollmentStatus === "CANCELLED"
      ? "Cancelado"
      : enrollmentStatus === "PAUSED"
        ? "Pausado"
        : enrollmentStatus
          ? enrollmentStatus
          : null;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Back link */}
      <Link
        href="/academia/student/courses"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        Mis cursos
      </Link>

      {/* Header */}
      <div className="academy-card-dark p-6 sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white font-display">
                {course.title}
              </h1>
              {statusLabel && (
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  {statusLabel}
                </span>
              )}
            </div>
            <p className="text-slate-300 mt-2 max-w-3xl leading-relaxed">
              {course.description}
            </p>
            {course.description2 && (
              <p className="text-slate-400 mt-3 text-sm leading-relaxed">
                {course.description2}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="academy-pill-dark px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5">
            <Clock3 className="w-3.5 h-3.5" />
            {course.duration}
          </span>
          <span className="academy-pill-dark px-3 py-1.5 text-xs font-semibold">
            {course.durationWeeks ?? 24} semanas
          </span>
          <span className="academy-pill-dark px-3 py-1.5 text-xs font-semibold">
            {course.level}
          </span>
          {totalHours > 0 && (
            <span className="academy-pill-dark px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              ~{totalHours}h de contenido
            </span>
          )}
          {enrollmentStatus && (
            <span className="academy-pill-dark px-3 py-1.5 text-xs font-semibold">
              Progreso {progressPercent}%
            </span>
          )}
        </div>

        {enrollmentStatus && (
          <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden max-w-md">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                progressPercent >= 100
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500"
              )}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Temario (locked) */}
      <section className="academy-card-dark p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center rounded-xl bg-white/5 border border-white/10 text-white px-4 py-2 text-sm font-bold">
            Temario
          </div>
          <span className="text-xs text-slate-500">
            {course.modules.length} módulos · {totalLessons} lecciones
          </span>
        </div>

        <div className="space-y-3">
          {course.modules.map((mod) => {
            const isOpen = openModuleId === mod.id;
            return (
              <div
                key={mod.id}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenModuleId((prev) =>
                      prev === mod.id ? null : mod.id
                    )
                  }
                  className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-white font-display">
                      Módulo {mod.order}
                    </h3>
                    <p className="text-slate-200 font-semibold">{mod.title}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {mod.lessons.length} lecciones
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-slate-400 transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 space-y-1">
                    {mod.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400"
                      >
                        <Lock className="w-4 h-4 shrink-0 text-slate-600" />
                        <span className="truncate">{lesson.title}</span>
                        <span className="text-xs text-slate-600 ml-auto">
                          {lesson.duration}m
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-slate-500 text-sm">
          El contenido de las lecciones está disponible solo para estudiantes
          activos con cohorte asignada.
        </p>
      </section>

      {/* Cohortes disponibles */}
      <section className="academy-card-dark p-6 sm:p-8">
        <h2 className="text-2xl font-black tracking-tight text-white font-display">
          Cohortes
        </h2>
        <p className="text-slate-400 mt-1 text-sm">
          Grupos de estudio disponibles para este programa.
        </p>

        <div className="mt-4 space-y-3">
          {cohorts.length > 0 ? (
            cohorts.map((cohort) => (
              <div
                key={cohort.id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-white">{cohort.name}</p>
                  <p className="text-sm text-slate-400">
                    {formatDateRange(cohort.startDate, cohort.endDate)}
                  </p>
                </div>
                <span className="academy-pill-dark px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {cohort.status}
                </span>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-sm text-slate-400">
              No hay cohortes publicadas actualmente.
            </div>
          )}
        </div>
      </section>

      {/* Contacto */}
      <section className="academy-card-dark p-6 sm:p-8">
        <h2 className="text-2xl font-black tracking-tight text-white font-display">
          ¿Tienes dudas?
        </h2>
        <p className="text-slate-400 mt-2 text-sm leading-relaxed">
          Si tienes preguntas sobre el programa o tu inscripción, nuestro equipo
          está listo para ayudarte.
        </p>
        <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-cyan-300/90" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Escríbenos a</p>
              <p className="text-base font-bold text-white">
                admissions@kaledacademy.com
              </p>
            </div>
          </div>
          <a
            href="mailto:admissions@kaledacademy.com"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/5 hover:border-cyan-500/30 hover:text-white transition-colors"
          >
            Contactar
          </a>
        </div>
      </section>
    </div>
  );
}

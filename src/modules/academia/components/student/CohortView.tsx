"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Check,
  Play,
  BookOpen,
  Video,
  Users,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const MODULE_META: Record<number, { color: string; bg: string; border: string; topics: string }> = {
  1: { color: "#38bdf8", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.25)", topics: "HTML - CSS - JS - Git" },
  2: { color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.25)", topics: "React - Tailwind - shadcn" },
  3: { color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.25)", topics: "Prisma - Neon - Clerk" },
  4: { color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.25)", topics: "OpenAI - Pagos - Deploy" },
};

const DAY_LABELS: Record<string, string> = {
  LUNES: "Lunes",
  MARTES: "Martes",
  MIERCOLES: "Miércoles",
  JUEVES: "Jueves",
  VIERNES: "Viernes",
  SABADO: "Sábado",
  DOMINGO: "Domingo",
};

interface Lesson {
  id: string;
  title: string;
  content?: string;
  videoUrl?: string | null;
  duration: number;
  order: number;
  meta?: { weekNumber: number; dayOfWeek: string } | null;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CohortData {
  cohort: { id: string; name: string; startDate: string; endDate: string; status: string };
  course: { id: string; title: string; modules: Module[] };
  events: Array<{ id: string; title: string; type: string; dayOfWeek?: number | null; startTime?: string | null; endTime?: string | null; scheduledAt?: string | null }>;
  assessments: Array<{ id: string; title: string; type: string; scheduledAt: string }>;
  members: Array<{ id: string; name: string | null; email: string; image: string | null }>;
  completedLessonIds: string[];
}

type SectionId = "contenido" | "video" | "miembros" | "datos";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.05 } } };

function getInitialSessionsModuleIdx(data: CohortData): number {
  const mods = data.course?.modules ?? [];
  const firstIncomplete = mods.findIndex(
    (m) => m.lessons.filter((l) => data.completedLessonIds?.includes(l.id)).length < m.lessons.length
  );
  return firstIncomplete >= 0 ? firstIncomplete : 0;
}

interface CohortViewProps {
  data: CohortData;
}

export function CohortView({ data }: CohortViewProps) {
  const [activeSection, setActiveSection] = useState<SectionId>("contenido");
  const [sessionsModuleIdx, setSessionsModuleIdx] = useState(() => getInitialSessionsModuleIdx(data));

  const { cohort, course, events, assessments, members, completedLessonIds } = data;
  const completedSet = new Set(completedLessonIds);
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const progressPercent = totalLessons > 0 ? Math.round((completedSet.size / totalLessons) * 100) : 0;

  // Active module = first with incomplete lessons
  let activeModuleIdx = 0;
  for (let i = 0; i < course.modules.length; i++) {
    const m = course.modules[i];
    const completed = m.lessons.filter((l) => completedSet.has(l.id)).length;
    if (completed < m.lessons.length) {
      activeModuleIdx = i;
      break;
    }
    activeModuleIdx = i;
  }
  const displayModuleIdx = Math.min(sessionsModuleIdx, course.modules.length - 1);
  const displayModule = course.modules[displayModuleIdx] ?? course.modules[0];
  const globalSessionOffset = course.modules
    .slice(0, displayModuleIdx)
    .reduce((acc, m) => acc + m.lessons.length, 0);

  const navItems: Array<{ id: SectionId; label: string; icon: React.ReactNode }> = [
    { id: "contenido", label: "Contenido", icon: <BookOpen className="w-4 h-4" /> },
    { id: "video", label: "Video Feed", icon: <Video className="w-4 h-4" /> },
    { id: "miembros", label: "Miembros", icon: <Users className="w-4 h-4" /> },
    { id: "datos", label: "Datos Académicos", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const months = Math.ceil(totalLessons / 12) || 4;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link
            href="/academia/student"
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Volver a la home
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
            Mi Curso
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {course.title} · {months} meses · {totalLessons} sesiones
          </p>
        </div>
      </motion.div>

      {/* Section tabs */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveSection(item.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
              activeSection === item.id
                ? "academy-menu-item-active-dark text-white"
                : "academy-btn-vermas-dark text-slate-400 hover:text-white"
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </motion.div>

      {activeSection === "contenido" && (
        <>
          {/* Progress bar */}
          <motion.div variants={fadeUp} className="academy-card-dark rounded-xl sm:rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Progreso</span>
              <span className="text-sm font-bold text-white">{progressPercent}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>

          {/* Sessions of active module */}
          {displayModule && (
            <motion.div
              id={`sesiones-modulo-${displayModule.order}`}
              variants={fadeUp}
              className="space-y-4 scroll-mt-8"
            >
              <h2 className="text-lg sm:text-xl font-bold text-white font-display">
                Sesiones del Módulo {displayModule.order} — Semana actual
              </h2>
              <div className="space-y-3">
                {displayModule.lessons.map((lesson, idx) => {
                  const globalNum = globalSessionOffset + idx + 1;
                  const isCompleted = completedSet.has(lesson.id);
                  const prevCompleted = idx === 0 || completedSet.has(displayModule.lessons[idx - 1]?.id);
                  const isInProgress = prevCompleted && !isCompleted;
                  const isPending = !prevCompleted;

                  const dayOfWeek = (lesson.meta?.dayOfWeek as string) ?? ["LUNES", "MIERCOLES", "VIERNES"][idx % 3];
                  const dayLabel = DAY_LABELS[dayOfWeek] ?? dayOfWeek;

                  let statusLabel = "Pendiente";
                  let statusDot = "bg-slate-500";
                  let statusPill = "bg-slate-500/20 text-slate-400 border-slate-500/30";
                  if (isCompleted) {
                    statusLabel = "Completada";
                    statusDot = "bg-emerald-400";
                    statusPill = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
                  } else if (isInProgress) {
                    statusLabel = "En curso";
                    statusDot = "bg-cyan-400";
                    statusPill = "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
                  }

                  return (
                    <Link
                      key={lesson.id}
                      href={isPending ? "#" : `/academia/student/courses/${course.id}/lesson/${lesson.id}`}
                      className={cn(
                        "academy-card-dark rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-all hover:border-white/10",
                        isPending && "opacity-60 pointer-events-none cursor-not-allowed"
                      )}
                    >
                      <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", statusDot)} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white">
                          Sesión {globalNum}: {lesson.title}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {dayLabel} · {lesson.duration} min
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border shrink-0",
                          statusPill
                        )}
                      >
                        {statusLabel}
                      </span>
                      {!isPending && (
                        isCompleted ? (
                          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : (
                          <Play className="w-5 h-5 text-cyan-400 shrink-0" />
                        )
                      )}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Modules grid */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {course.modules.map((module, idx) => {
              const meta = MODULE_META[idx + 1] ?? MODULE_META[1];
              const completedInModule = module.lessons.filter((l) => completedSet.has(l.id)).length;
              const moduleProgress = module.lessons.length > 0
                ? Math.round((completedInModule / module.lessons.length) * 100)
                : 0;
              const isActive = idx === activeModuleIdx;
              const isNext = idx === activeModuleIdx + 1;
              const isLocked = idx > activeModuleIdx + 1;
              const isCompleted = moduleProgress >= 100;

              let statusLabel = "Bloqueado";
              let statusClass = "bg-slate-500/20 text-slate-400 border-slate-500/30";
              if (isCompleted) {
                statusLabel = "Completado";
                statusClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
              } else if (isActive) {
                statusLabel = "Activo";
                statusClass = "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
              } else if (isNext) {
                statusLabel = "Próximo";
                statusClass = "bg-amber-500/20 text-amber-400 border-amber-500/30";
              }

              return (
                <div
                  key={module.id}
                  className={cn(
                    "academy-card-dark rounded-xl sm:rounded-2xl p-5 sm:p-6 transition-all",
                    isActive && "ring-1",
                    isLocked && "opacity-60"
                  )}
                  style={isActive ? { borderColor: meta.border, boxShadow: `0 0 0 1px ${meta.border}` } : {}}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-base sm:text-lg font-bold text-white font-display">
                      Módulo {module.order}: {module.title}
                    </h3>
                    <span
                      className={cn(
                        "text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border shrink-0",
                        statusClass
                      )}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 mb-4">{meta.topics}</p>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${moduleProgress}%`,
                        background: meta.color,
                      }}
                    />
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    {isCompleted
                      ? `${moduleProgress}% completado · ${completedInModule}/${module.lessons.length} sesiones`
                      : isLocked
                        ? "Sin iniciar"
                        : `${moduleProgress}% completado · ${completedInModule}/${module.lessons.length} sesiones`}
                  </p>
                  {!isLocked && (
                    <button
                      type="button"
                      onClick={() => {
                        setSessionsModuleIdx(idx);
                        document.getElementById(`sesiones-modulo-${module.order}`)?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="mt-4 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors text-left"
                    >
                      Ver sesiones <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </motion.div>
        </>
      )}

      {activeSection === "video" && (
        <motion.div variants={fadeUp} className="academy-card-dark rounded-xl sm:rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white font-display mb-4">Video Feed</h2>
          <div className="space-y-3">
            {course.modules.flatMap((m) =>
              m.lessons
                .filter((l) => l.videoUrl)
                .map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]"
                  >
                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                      <Play className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white">{l.title}</p>
                      <p className="text-xs text-slate-500">{l.duration} min</p>
                    </div>
                    <Link
                      href={`/academia/student/courses/${course.id}/lesson/${l.id}`}
                      className="academy-btn-vermas-dark px-4 py-2 text-sm font-semibold shrink-0"
                    >
                      Ver
                    </Link>
                  </div>
                ))
            )}
          </div>
          {course.modules.every((m) => m.lessons.every((l) => !l.videoUrl)) && (
            <p className="text-slate-500 py-8 text-center">No hay videos en las lecciones.</p>
          )}
        </motion.div>
      )}

      {activeSection === "miembros" && (
        <motion.div variants={fadeUp} className="academy-card-dark rounded-xl sm:rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white font-display mb-4">Miembros del cohorte</h2>
          <div className="space-y-3">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
              >
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {m.name?.slice(0, 2).toUpperCase() ?? m.email.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{m.name ?? m.email}</p>
                  <p className="text-xs text-slate-500 truncate">{m.email}</p>
                </div>
              </div>
            ))}
          </div>
          {members.length === 0 && (
            <p className="text-slate-500 py-8 text-center">Aún no hay miembros inscritos.</p>
          )}
        </motion.div>
      )}

      {activeSection === "datos" && (
        <motion.div variants={fadeUp} className="academy-card-dark rounded-xl sm:rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white font-display mb-4">Datos Académicos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Progreso total</p>
              <p className="text-2xl font-black text-cyan-400 mt-1">{progressPercent}%</p>
              <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-cyan-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Lecciones completadas</p>
              <p className="text-2xl font-black text-white mt-1">
                {completedSet.size} / {totalLessons}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

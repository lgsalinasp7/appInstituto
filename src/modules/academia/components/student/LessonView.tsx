"use client";
/**
 * Vista completa de una sesión del bootcamp
 * API: /api/academy/ (lessons, quizzes, cral, deliverables)
 * Diseño: academy-shell-dark + tokens del bootcamp
 */

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Check,
  ExternalLink,
  Bot,
  List,
  Lock,
  Code2,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { KaledChat } from "./KaledChat";
import { CodeReviewPanel } from "./CodeReviewPanel";
import { InteractiveLessonShell } from "./interactive-lessons/InteractiveLessonShell";
import {
  InteractiveLessonRenderer,
  isRegisteredInteractiveSlug,
  warnUnknownInteractiveSlug,
} from "./interactive-lessons/registry";

// ── Tipos ──────────────────────────────────────────────────
interface ConceptItem {
  key: string;
  title: string;
  body: string;
}
interface CRALChallenge {
  id: string;
  phase: string;
  title: string;
  description: string;
  isDone: boolean;
}
interface QuizOption {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
  feedback?: string;
}
interface QuizData {
  id: string;
  question: string;
  options: QuizOption[];
  result: { isCorrect: boolean; selectedOptionId?: string | null } | null;
}
interface DeliverableItem {
  id: string;
  text: string;
}
interface DeliverableData {
  id: string;
  title: string;
  description: string;
  isFinal: boolean;
  items: DeliverableItem[];
  submission: {
    status: string;
    githubUrl?: string;
    deployUrl?: string;
    checkedItems: string[];
  } | null;
}

export interface LessonViewProps {
  userId: string;
  lesson: {
    id: string;
    title: string;
    description: string;
    content?: string;
    videoUrl?: string;
    duration: number;
    moduleTitle: string;
    moduleOrder: number;
    courseTitle: string;
    weekNumber: number;
    dayOfWeek: string;
    sessionType: string;
    videoTitle?: string;
    analogyText?: string;
    kaledIntro?: string;
    concepts: ConceptItem[];
    cralChallenges: CRALChallenge[];
    quizzes: QuizData[];
    deliverable: DeliverableData | null;
    interactiveAnimation?: {
      id: string;
      slug: string;
      title: string;
      description?: string | null;
    } | null;
  };
  isCompleted: boolean;
  videoProgress: number;
  courseId: string;
  moduleLessons: Array<{
    id: string;
    title: string;
    weekNumber: number;
    dayOfWeek: string;
    isCompleted: boolean;
    isLocked?: boolean;
    isCurrent: boolean;
  }>;
  prevLessonId?: string;
  nextLessonId?: string;
}

const MODULE_COLOR: Record<number, string> = {
  1: "#38bdf8",
  2: "#a78bfa",
  3: "#34d399",
  4: "#fbbf24",
};
const CRAL_CFG: Record<string, { icon: string; label: string; color: string; pct: string }> = {
  CONSTRUIR: { icon: "🔨", label: "Construir", color: "#34d399", pct: "70%" },
  ROMPER: { icon: "💥", label: "Romper", color: "#f87171", pct: "10%" },
  AUDITAR: { icon: "🔍", label: "Auditar", color: "#fbbf24", pct: "10%" },
  LANZAR: { icon: "🚀", label: "Lanzar", color: "#38bdf8", pct: "10%" },
};
const SESSION_BADGE: Record<string, { label: string; color: string }> = {
  TEORIA: { label: "Teoría", color: "#38bdf8" },
  PRACTICA: { label: "Práctica", color: "#34d399" },
  ENTREGABLE: { label: "Entregable", color: "#fbbf24" },
  LIVE: { label: "Live", color: "#a78bfa" },
};
const DAY_SHORT: Record<string, string> = {
  LUNES: "Lun",
  MIERCOLES: "Mié",
  VIERNES: "Vie",
};

/** Extrae etiqueta corta para badges (máx 14 chars, sin cortar palabras) */
function shortLabel(text: string, maxLen = 14): string {
  const clean = text.split("—")[0].split(" — ")[0].trim();
  if (clean.length <= maxLen) return clean;
  const cut = clean.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
}

const BASE = "/api/academy";

export function LessonView({
  userId: _userId,
  lesson,
  isCompleted,
  videoProgress,
  courseId,
  moduleLessons,
  prevLessonId,
  nextLessonId,
}: LessonViewProps) {
  const router = useRouter();
  const mc = MODULE_COLOR[lesson.moduleOrder] ?? "#38bdf8";
  const sessionBadge = SESSION_BADGE[lesson.sessionType] ?? SESSION_BADGE.TEORIA;

  const [activeConcept, setActiveConcept] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<
    Record<
      string,
      { selected: string | null; answered: boolean; correct: boolean; feedback?: string }
    >
  >({});
  const [cralDone, setCralDone] = useState<Record<string, boolean>>(
    Object.fromEntries(lesson.cralChallenges.map((c) => [c.id, c.isDone]))
  );
  const [checkedItems, setCheckedItems] = useState<Set<string>>(
    new Set(lesson.deliverable?.submission?.checkedItems ?? [])
  );
  const [githubUrl, setGithubUrl] = useState(lesson.deliverable?.submission?.githubUrl ?? "");
  const [deployUrl, setDeployUrl] = useState(lesson.deliverable?.submission?.deployUrl ?? "");
  const [completed, setCompleted] = useState(isCompleted);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [kaledOpen, setKaledOpen] = useState(false);
  const [codeReviewOpen, setCodeReviewOpen] = useState(false);

  const lessonUrl = (lid: string) => `/academia/student/courses/${courseId}/lesson/${lid}`;

  const markCompleted = useCallback(async () => {
    const res = await fetch(`${BASE}/lessons/${lesson.id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoProgress: 100 }),
    });
    if (res.ok) {
      setCompleted(true);
      toast.success("✓ Sesión marcada como completada", {
        description: "Sigue con la próxima sesión.",
      });
      router.refresh();
    }
  }, [lesson.id, router]);

  const answerQuiz = useCallback(
    async (
      quizId: string,
      optionId: string,
      isCorrect: boolean,
      feedback?: string
    ) => {
      if (quizState[quizId]?.answered) return;
      await fetch(`${BASE}/quizzes/${quizId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedOptionId: optionId }),
      });
      setQuizState((p) => ({
        ...p,
        [quizId]: { selected: optionId, answered: true, correct: isCorrect, feedback },
      }));
      if (isCorrect) toast.success("¡Correcto! 🎯", { description: "Kaled está orgulloso de ti." });
      else toast.error("Incorrecto", { description: "Revisa el concepto e intenta de nuevo." });
    },
    [quizState]
  );

  const completeCRAL = useCallback(async (challengeId: string) => {
    const res = await fetch(`${BASE}/cral/${challengeId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      setCralDone((p) => ({ ...p, [challengeId]: true }));
      toast.success("¡Fase CRAL completada! 🚀");
    }
  }, []);

  const submitDeliverable = useCallback(async () => {
    if (!lesson.deliverable) return;
    setSubmitting(true);
    const res = await fetch(`${BASE}/deliverables/${lesson.deliverable.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ githubUrl, deployUrl, checkedItems: [...checkedItems] }),
    });
    setSubmitting(false);
    if (res.ok) {
      toast.success("¡Entregable enviado! 📦", {
        description: "El instructor lo revisará pronto.",
      });
      router.refresh();
    }
  }, [lesson.deliverable, githubUrl, deployUrl, checkedItems, router]);

  const weeksCount = new Set(moduleLessons.map((l) => l.weekNumber)).size;
  const sessionsCount = moduleLessons.length;
  const hoursEst = Math.round(sessionsCount * 0.75);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full">
      {/* SIDEBAR CURSO — fijo en pantalla, no se mueve al hacer scroll */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Espaciador para que el contenido no quede debajo del sidebar */}
            <motion.div
              key="sidebar-spacer"
              initial={{ width: 0 }}
              animate={{ width: 280 }}
              exit={{ width: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:block shrink-0"
            />
            <motion.aside
              key="sidebar-aside"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:flex flex-col border-r border-white/[0.06] academy-sidebar-rail-dark overflow-hidden fixed left-[260px] top-16 z-20 w-[280px] h-[calc(100vh-4rem)]"
              style={{ background: "rgba(2,6,23,0.98)" }}
            >
            <div className="p-5 border-b border-white/[0.06] shrink-0">
              <div
                className="inline-block text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-lg mb-2"
                style={{ color: mc, background: `${mc}20`, border: `1px solid ${mc}40` }}
              >
                Módulo {lesson.moduleOrder}
              </div>
              <div className="text-[15px] font-bold text-white leading-tight mb-1">
                {lesson.moduleTitle}
              </div>
              <div className="text-[11px] text-slate-500 mb-3">
                {weeksCount} sem · {sessionsCount} sesiones · {hoursEst}h
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(moduleLessons.filter((l) => l.isCompleted).length / Math.max(1, moduleLessons.length)) * 100}%`,
                      background: mc,
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 shrink-0">
                  {Math.round((moduleLessons.filter((l) => l.isCompleted).length / Math.max(1, moduleLessons.length)) * 100)}% · {moduleLessons.filter((l) => l.isCompleted).length}/{sessionsCount}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-3">
              {Array.from(new Set(moduleLessons.map((l) => l.weekNumber))).sort((a, b) => a - b).map((week) => {
                const wl = moduleLessons.filter((l) => l.weekNumber === week);
                return (
                  <div key={week} className="mb-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 px-2 py-2">
                      Semana {week}
                    </div>
                    {wl.map((ml, idx) => {
                      const isLocked = ml.isLocked ?? false;
                      const content = (
                        <>
                          <div
                            className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0"
                            style={{
                              borderColor: ml.isCompleted
                                ? "#34d399"
                                : ml.isCurrent
                                  ? mc
                                  : isLocked
                                    ? "rgba(255,255,255,0.08)"
                                    : "rgba(255,255,255,0.12)",
                              background: ml.isCompleted
                                ? "#34d399"
                                : ml.isCurrent
                                  ? `${mc}30`
                                  : "transparent",
                            }}
                          >
                            {ml.isCompleted && (
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 8 8">
                                <path
                                  d="M1 4l2 2 4-4"
                                  stroke="#000"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                />
                              </svg>
                            )}
                            {!ml.isCompleted && ml.isCurrent && (
                              <div className="w-2 h-2 rounded-full" style={{ background: mc }} />
                            )}
                            {isLocked && !ml.isCompleted && (
                              <Lock className="w-2.5 h-2.5 text-slate-500" />
                            )}
                          </div>
                          <span className="flex-1 truncate leading-tight font-medium">{ml.title}</span>
                          <span className="text-[10px] text-slate-600 shrink-0">S{idx + 1}</span>
                        </>
                      );
                      const baseClass = `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all text-[13px] ${
                        ml.isCurrent
                          ? "text-white"
                          : isLocked
                            ? "text-slate-500 cursor-not-allowed"
                            : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                      }`;
                      const baseStyle = ml.isCurrent
                        ? { background: `${mc}25`, borderLeft: `3px solid ${mc}` }
                        : {};
                      return isLocked ? (
                        <div
                          key={ml.id}
                          className={baseClass}
                          style={baseStyle}
                          title="Contáctanos para desbloquear"
                        >
                          {content}
                        </div>
                      ) : (
                        <Link
                          key={ml.id}
                          href={lessonUrl(ml.id)}
                          className={baseClass}
                          style={baseStyle}
                        >
                          {content}
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="w-full max-w-7xl mx-auto p-5 sm:p-7 lg:p-10 pb-28 lg:pb-10 space-y-6 sm:space-y-8">
            {/* Header sticky — Semana · Sesión · Título */}
            <div className="sticky top-0 z-30 -mx-5 -mt-5 px-5 pt-5 pb-4 sm:-mx-7 sm:-mt-7 sm:px-7 sm:pt-7 lg:-mx-10 lg:-mt-10 lg:px-10 lg:pt-10 bg-[#020617]/95 backdrop-blur-sm border-b border-white/[0.06] mb-2">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">
                    Semana {lesson.weekNumber} · Sesión · {DAY_SHORT[lesson.dayOfWeek] ?? lesson.dayOfWeek}
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display leading-tight">
                    {lesson.title}
                  </h1>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {lesson.concepts.slice(0, 3).map((c) => (
                    <span
                      key={c.key}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border truncate max-w-[120px]"
                      style={{
                        color: mc,
                        borderColor: `${mc}40`,
                        background: `${mc}15`,
                      }}
                      title={c.title}
                    >
                      {shortLabel(c.title)}
                    </span>
                  ))}
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg border"
                    style={{
                      color: sessionBadge.color,
                      borderColor: `${sessionBadge.color}40`,
                      background: `${sessionBadge.color}15`,
                    }}
                  >
                    {sessionBadge.label}
                  </span>
                  <button
                    onClick={() => setMobileSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-colors"
                    title="Menú del curso"
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="hidden lg:flex p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-colors"
                    title={sidebarOpen ? "Ocultar menú del curso" : "Mostrar menú del curso"}
                  >
                    {sidebarOpen ? (
                      <ChevronLeft className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <Link
                href={`/academia/student/courses/${courseId}`}
                className="inline-flex items-center gap-1 mt-2 text-[11px] text-slate-500 hover:text-cyan-400 transition-colors"
              >
                <ChevronRight className="w-3 h-3 rotate-180" />
                {lesson.courseTitle}
              </Link>
            </div>

            <p className="text-slate-500 text-sm leading-relaxed">{lesson.description}</p>

          {/* HISTORIA — Narrativa principal (V3) */}
          {lesson.content && (
            <div
              className="academy-card-dark rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-white/[0.08]"
              style={{
                background: "linear-gradient(135deg, rgba(30,58,138,0.06) 0%, rgba(2,6,23,0.6) 100%)",
                borderColor: "rgba(59,130,246,0.15)",
              }}
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-3">
                📖 Historia
              </div>
              <p
                className="text-[13px] text-slate-400 leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{
                  __html: lesson.content
                    .replace(
                      /\*\*(.+?)\*\*/g,
                      "<strong class='text-white font-semibold'>$1</strong>"
                    )
                    .replace(
                      /`(.+?)`/g,
                      "<code class='bg-slate-900 text-cyan-400 px-1.5 py-0.5 rounded text-[11px] font-mono'>$1</code>"
                    ),
                }}
              />
            </div>
          )}

          {/* SECCIÓN TEORÍA — Kaled Intro, Analogía, Conceptos */}
          {lesson.kaledIntro && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="academy-card-dark rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-white/[0.08]"
              style={{
                background: "linear-gradient(135deg, rgba(8,145,178,0.08) 0%, rgba(2,6,23,0.6) 100%)",
                borderColor: "rgba(8,145,178,0.2)",
              }}
            >
              <div className="flex gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border"
                  style={{ background: "rgba(8,145,178,0.15)", borderColor: "rgba(8,145,178,0.3)" }}
                >
                  🤖
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[13px] font-bold text-white">Kaled AI</span>
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(8,145,178,0.15)", color: "#38bdf8" }}
                    >
                      ARQUITECTO · ONLINE
                    </span>
                  </div>
                  <p
                    className="text-[13px] text-slate-400 leading-relaxed italic"
                    dangerouslySetInnerHTML={{
                      __html: lesson.kaledIntro.replace(
                        /\*\*(.+?)\*\*/g,
                        "<strong class='text-white not-italic font-semibold'>$1</strong>"
                      ),
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setKaledOpen(true)}
                    className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-semibold text-cyan-400 hover:underline"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    Preguntarle a Kaled
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ANALOGÍA */}
          {lesson.analogyText && (
            <div
              className="academy-card-dark rounded-xl sm:rounded-2xl p-5 sm:p-6 border-l-[4px]"
              style={{
                background: "rgba(251,191,36,0.04)",
                borderLeftColor: "#fbbf24",
                borderTop: "1px solid rgba(251,191,36,0.12)",
                borderRight: "1px solid rgba(251,191,36,0.08)",
                borderBottom: "1px solid rgba(251,191,36,0.08)",
              }}
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-amber-400 mb-2">
                🌎 Analogía de Kaled
              </div>
              <p
                className="text-[13px] text-slate-400 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: lesson.analogyText
                    .replace(
                      /\*\*(.+?)\*\*/g,
                      "<strong class='text-white font-semibold'>$1</strong>"
                    )
                    .replace(
                      /`(.+?)`/g,
                      "<code class='bg-slate-900 text-cyan-400 px-1.5 py-0.5 rounded text-[11px] font-mono'>$1</code>"
                    ),
                }}
              />
            </div>
          )}

          {/* CONCEPTOS */}
          {lesson.concepts.length > 0 && (
            <div>
              <h2 className="text-[13px] font-bold text-white mb-3">🔑 Conceptos clave</h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {lesson.concepts.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setActiveConcept(activeConcept === c.key ? null : c.key)}
                    className={`academy-pill px-3 py-1.5 text-[11px] font-medium transition-all ${
                      activeConcept === c.key ? "academy-pill-active-dark" : ""
                    }`}
                    title={c.title}
                  >
                    {shortLabel(c.title, 28)}
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {activeConcept &&
                  (() => {
                    const c = lesson.concepts.find((x) => x.key === activeConcept);
                    return c ? (
                      <motion.div
                        key={activeConcept}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="academy-card-dark rounded-xl sm:rounded-2xl p-4 sm:p-5"
                      >
                        <div className="text-[13px] font-bold text-white mb-2">{c.title}</div>
                        <p
                          className="text-[12px] text-slate-400 leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: c.body
                              .replace(
                                /`(.+?)`/g,
                                "<code class='bg-slate-900 text-cyan-400 px-1.5 py-0.5 rounded text-[11px] font-mono'>$1</code>"
                              )
                              .replace(
                                /\*\*(.+?)\*\*/g,
                                "<strong class='text-white font-semibold'>$1</strong>"
                              ),
                          }}
                        />
                      </motion.div>
                    ) : null;
                  })()}
              </AnimatePresence>
            </div>
          )}

          {/* Animación interactiva (catálogo) y/o video */}
          {(() => {
            const animSlug = lesson.interactiveAnimation?.slug;

            const getYoutubeId = (url: string) => {
              const m = url.match(
                /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
              );
              return m?.[1] ?? null;
            };

            const renderVideoBlock = () => {
              if (!lesson.videoUrl) return null;
              const videoId = getYoutubeId(lesson.videoUrl);
              return (
                <div>
                  <h2 className="mb-3 text-[13px] font-bold text-white">
                    📺 Video recomendado por Kaled
                  </h2>
                  {videoId ? (
                    <div className="academy-card-dark overflow-hidden rounded-xl border border-white/[0.08] sm:rounded-2xl">
                      <div className="relative mx-auto aspect-video w-full max-w-4xl">
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                          title={lesson.videoTitle ?? "Video de la sesión"}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 h-full w-full"
                        />
                      </div>
                      <div className="flex items-center justify-between border-t border-white/[0.05] px-5 py-3 text-[11px]">
                        <span className="text-slate-500">
                          {lesson.videoTitle ?? "Video de la sesión"}
                        </span>
                        <a
                          href={lesson.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-cyan-400 hover:underline"
                        >
                          Abrir en YouTube <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <a
                      href={lesson.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group academy-card-dark block overflow-hidden rounded-xl border border-white/[0.08] transition-all hover:border-cyan-500/30 sm:rounded-2xl"
                      style={{ background: "linear-gradient(135deg, #0d1b33, #1a2a50)" }}
                    >
                      <div className="flex items-center gap-4 p-5">
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-105"
                          style={{ background: "#2563eb" }}
                        >
                          <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 truncate text-[13px] font-semibold text-white">
                            {lesson.videoTitle ?? "Ver video de la sesión"}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            YouTube · Recomendado por Kaled
                          </div>
                        </div>
                        <span className="shrink-0 rounded bg-red-600/80 px-2 py-1 text-[8px] font-bold text-white">
                          YouTube
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/[0.05] px-5 py-2.5 text-[10px]">
                        <span className="text-slate-600">🎯 Ver antes de la práctica</span>
                        <span className="flex items-center gap-1 text-cyan-400">
                          Abrir en YouTube <ExternalLink className="h-3 w-3" />
                        </span>
                      </div>
                    </a>
                  )}
                </div>
              );
            };

            if (animSlug && isRegisteredInteractiveSlug(animSlug)) {
              return (
                <div className="space-y-4">
                  <div>
                    <h2 className="mb-3 text-[13px] font-bold text-white">
                      ✨ {lesson.interactiveAnimation?.title ?? "Animación interactiva"}
                    </h2>
                    {lesson.interactiveAnimation?.description ? (
                      <p className="mb-3 text-[12px] text-slate-500">
                        {lesson.interactiveAnimation.description}
                      </p>
                    ) : null}
                    <InteractiveLessonShell>
                      <InteractiveLessonRenderer
                        slug={animSlug}
                        embedded
                        titleFromLesson={lesson.title}
                      />
                    </InteractiveLessonShell>
                  </div>
                  {lesson.videoUrl ? (
                    <div className="border-t border-white/[0.06] pt-4">
                      <p className="mb-2 text-[11px] text-slate-500">
                        También puedes ver el video complementario:
                      </p>
                      <a
                        href={lesson.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[12px] text-cyan-400 hover:underline"
                      >
                        Abrir en YouTube <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ) : null}
                </div>
              );
            }

            if (animSlug) {
              warnUnknownInteractiveSlug(animSlug);
            }

            return renderVideoBlock();
          })()}

          {/* CRAL */}
          {lesson.cralChallenges.length > 0 && (
            <div>
              <h2 className="text-[13px] font-bold text-white mb-4">
                ⚙️ Construir · Romper · Auditar · Lanzar
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lesson.cralChallenges.map((ch) => {
                  const cfg = CRAL_CFG[ch.phase];
                  const done = cralDone[ch.id] ?? ch.isDone;
                  return (
                    <motion.div
                      key={ch.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="academy-card-dark rounded-xl sm:rounded-2xl p-4 sm:p-5 border transition-all"
                      style={{
                        background: `${cfg?.color}08`,
                        borderColor: done ? cfg?.color : `${cfg?.color}35`,
                      }}
                    >
                      <div className="text-lg mb-1">{cfg?.icon}</div>
                      <div
                        className="text-[9px] font-bold uppercase tracking-[0.1em] mb-1"
                        style={{ color: cfg?.color }}
                      >
                        {cfg?.label} · {cfg?.pct}
                      </div>
                      <div className="text-[12px] font-bold text-white mb-2">{ch.title}</div>
                      <p
                        className="text-[11px] text-slate-500 leading-relaxed mb-3"
                        dangerouslySetInnerHTML={{
                          __html: ch.description.replace(
                            /`(.+?)`/g,
                            "<code class='bg-slate-950 text-cyan-400 px-1 rounded text-[10px] font-mono'>$1</code>"
                          ),
                        }}
                      />
                      <div className="flex gap-2">
                        {done ? (
                          <div
                            className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-center"
                            style={{ color: cfg?.color, background: `${cfg?.color}15` }}
                          >
                            ✓ Completado
                          </div>
                        ) : (
                          <button
                            onClick={() => completeCRAL(ch.id)}
                            className="flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-all hover:opacity-90"
                            style={{
                              color: cfg?.color,
                              borderColor: `${cfg?.color}40`,
                              background: `${cfg?.color}10`,
                            }}
                          >
                            Marcar completado
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setKaledOpen(true)}
                          className="px-3 py-1.5 rounded-lg text-[11px] text-slate-500 border border-white/[0.08] hover:bg-white/[0.05] transition-colors"
                        >
                          Kaled
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setCodeReviewOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold text-cyan-400 border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
                >
                  <Code2 className="w-4 h-4" />
                  Kaled revisa mi código
                </button>
              </div>
            </div>
          )}

          {/* QUIZ */}
          {lesson.quizzes.map((quiz) => {
            const state = quizState[quiz.id];
            const answered = quiz.result != null || !!state?.answered;
            const correct = state?.correct ?? quiz.result?.isCorrect;

            return (
              <div key={quiz.id} className="academy-card-dark rounded-xl sm:rounded-2xl p-5 sm:p-6">
                <h2 className="text-[13px] font-bold text-white mb-4">🧠 Verifica tu comprensión</h2>
                <p className="text-[13px] text-white font-medium leading-relaxed mb-4">
                  {quiz.question}
                </p>
                <div className="space-y-2.5">
                  {quiz.options.map((opt) => {
                    const isSelected =
                      state?.selected === opt.id || quiz.result?.selectedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        disabled={!!answered}
                        onClick={() => answerQuiz(quiz.id, opt.id, opt.isCorrect, opt.feedback)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-[12px] transition-all flex items-center gap-3 ${
                          !answered
                            ? "border-white/[0.08] text-slate-400 hover:border-cyan-500/30 hover:text-white cursor-pointer"
                            : isSelected && opt.isCorrect
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                              : isSelected && !opt.isCorrect
                                ? "border-red-500/40 bg-red-500/10 text-red-400"
                                : "border-white/[0.05] text-slate-600 cursor-not-allowed opacity-50"
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0"
                          style={{
                            borderColor:
                              answered && isSelected
                                ? opt.isCorrect
                                  ? "#34d399"
                                  : "#f87171"
                                : "rgba(255,255,255,0.1)",
                          }}
                        >
                          {opt.label}
                        </span>
                        <span className="flex-1">{opt.text}</span>
                        {answered && isSelected && (
                          <span>{opt.isCorrect ? "✅" : "❌"}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <AnimatePresence>
                  {(state?.feedback || quiz.result) && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 rounded-xl border text-[12px] leading-relaxed"
                      style={{
                        background: correct
                          ? "rgba(52,211,153,0.08)"
                          : "rgba(248,113,113,0.08)",
                        borderColor: correct
                          ? "rgba(52,211,153,0.3)"
                          : "rgba(248,113,113,0.3)",
                        color: correct ? "#34d399" : "#f87171",
                      }}
                    >
                      {state?.feedback ??
                        (correct
                          ? "¡Respuesta correcta! Kaled está orgulloso 🎯"
                          : "Respuesta incorrecta. Revisa el concepto e intenta de nuevo.")}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* ENTREGABLE */}
          {lesson.deliverable && (
            <div
              className="academy-card-dark rounded-xl sm:rounded-2xl p-5 sm:p-6 border"
              style={{
                background: lesson.deliverable.isFinal
                  ? "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(2,6,23,0.5))"
                  : "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(2,6,23,0.5))",
                borderColor: lesson.deliverable.isFinal
                  ? "rgba(251,191,36,0.25)"
                  : "rgba(37,99,235,0.25)",
              }}
            >
              <div
                className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2"
                style={{
                  color: lesson.deliverable.isFinal ? "#fbbf24" : "#38bdf8",
                }}
              >
                {lesson.deliverable.isFinal
                  ? "🏆 Entregable Integrador del Módulo"
                  : "📦 Entregable Semanal"}
              </div>
              <h2 className="text-[15px] font-bold text-white mb-2">{lesson.deliverable.title}</h2>
              <p className="text-[12px] text-slate-500 leading-relaxed mb-5">
                {lesson.deliverable.description}
              </p>

              <div className="space-y-2.5 mb-5">
                {lesson.deliverable.items.map((item) => {
                  const isChecked = checkedItems.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 cursor-pointer group"
                      onClick={() => {
                        setCheckedItems((prev) => {
                          const next = new Set(prev);
                          if (next.has(item.id)) next.delete(item.id);
                          else next.add(item.id);
                          return next;
                        });
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all"
                        style={{
                          borderColor: isChecked ? "#34d399" : "rgba(255,255,255,0.12)",
                          background: isChecked ? "#34d399" : "transparent",
                        }}
                      >
                        {isChecked && <Check className="w-3 h-3 text-black" />}
                      </div>
                      <span
                        className={`text-[12px] leading-relaxed transition-colors ${
                          isChecked
                            ? "text-slate-500 line-through"
                            : "text-slate-300 group-hover:text-white"
                        }`}
                      >
                        {item.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-[10px] text-slate-600 mb-1 block">GitHub URL</label>
                  <input
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/user/proyecto"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-[12px] text-white placeholder:text-slate-700 outline-none focus:border-cyan-500/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-600 mb-1 block">Deploy URL</label>
                  <input
                    value={deployUrl}
                    onChange={(e) => setDeployUrl(e.target.value)}
                    placeholder="https://proyecto.vercel.app"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-[12px] text-white placeholder:text-slate-700 outline-none focus:border-cyan-500/40 transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={submitDeliverable}
                disabled={submitting || checkedItems.size === 0}
                className="w-full py-3 rounded-xl text-[13px] font-bold text-white transition-all disabled:opacity-40 hover:opacity-90"
                style={{
                  background: lesson.deliverable.isFinal
                    ? "linear-gradient(135deg, #d97706, #fbbf24)"
                    : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                }}
              >
                {submitting
                  ? "Enviando..."
                  : lesson.deliverable.submission?.status === "ENTREGADO"
                    ? "✓ Entregado — Actualizar"
                    : `Entregar ${lesson.deliverable.isFinal ? "Proyecto Final" : "Entregable"} →`}
              </button>
            </div>
          )}

          {/* NAVIGATION */}
          <div className="flex items-center justify-between pt-6 border-t border-white/[0.06]">
            {prevLessonId ? (
              <Link
                href={lessonUrl(prevLessonId)}
                className="flex items-center gap-2 academy-btn-vermas-dark px-4 py-2 text-[12px]"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Link>
            ) : (
              <div />
            )}

            <button
              onClick={markCompleted}
              disabled={completed}
              className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={
                completed
                  ? {
                      background: "rgba(52,211,153,0.15)",
                      color: "#34d399",
                      border: "1px solid rgba(52,211,153,0.3)",
                    }
                  : { background: `linear-gradient(135deg, ${mc}cc, ${mc}88)` }
              }
            >
              {completed ? "✓ Sesión completada" : "Marcar como visto →"}
            </button>

            {nextLessonId && (
              <Link
                href={lessonUrl(nextLessonId)}
                className="flex items-center gap-2 academy-btn-vermas-dark px-4 py-2 text-[12px]"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Drawer móvil: menú del curso */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent
          side="left"
          className="w-[280px] max-w-[85vw] p-0 border-r border-white/[0.06] academy-sidebar-rail-dark overflow-hidden"
          style={{ background: "rgba(2,6,23,0.98)" }}
        >
          <SheetHeader className="p-5 border-b border-white/[0.06] text-left">
            <SheetTitle className="text-white font-bold">
              Módulo {lesson.moduleOrder} — {lesson.moduleTitle}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-3">
            {Array.from(new Set(moduleLessons.map((l) => l.weekNumber))).sort((a, b) => a - b).map((week) => {
              const wl = moduleLessons.filter((l) => l.weekNumber === week);
              return (
                <div key={week} className="mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 px-2 py-2">
                    Semana {week}
                  </div>
                  {wl.map((ml, idx) => {
                    const isLocked = ml.isLocked ?? false;
                    const content = (
                      <>
                        <div
                          className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0"
                          style={{
                            borderColor: ml.isCompleted
                              ? "#34d399"
                              : ml.isCurrent
                                ? mc
                                : isLocked
                                  ? "rgba(255,255,255,0.08)"
                                  : "rgba(255,255,255,0.12)",
                            background: ml.isCompleted
                              ? "#34d399"
                              : ml.isCurrent
                                ? `${mc}30`
                                : "transparent",
                          }}
                        >
                          {ml.isCompleted && (
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 8 8">
                              <path
                                d="M1 4l2 2 4-4"
                                stroke="#000"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          )}
                          {!ml.isCompleted && ml.isCurrent && (
                            <div className="w-2 h-2 rounded-full" style={{ background: mc }} />
                          )}
                          {isLocked && !ml.isCompleted && (
                            <Lock className="w-2.5 h-2.5 text-slate-500" />
                          )}
                        </div>
                        <span className="flex-1 truncate leading-tight font-medium">{ml.title}</span>
                        <span className="text-[10px] text-slate-600 shrink-0">S{idx + 1}</span>
                      </>
                    );
                    const baseClass = `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all text-[13px] ${
                      ml.isCurrent
                        ? "text-white"
                        : isLocked
                          ? "text-slate-500 cursor-not-allowed"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                    }`;
                    const baseStyle = ml.isCurrent
                      ? { background: `${mc}25`, borderLeft: `3px solid ${mc}` }
                      : {};
                    return isLocked ? (
                      <div
                        key={ml.id}
                        className={baseClass}
                        style={baseStyle}
                        title="Contáctanos para desbloquear"
                      >
                        {content}
                      </div>
                    ) : (
                      <Link
                        key={ml.id}
                        href={lessonUrl(ml.id)}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={baseClass}
                        style={baseStyle}
                      >
                        {content}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {kaledOpen && (
        <KaledChat onClose={() => setKaledOpen(false)} lessonId={lesson.id} />
      )}
      <CodeReviewPanel
        open={codeReviewOpen}
        onOpenChange={setCodeReviewOpen}
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        weekNumber={lesson.weekNumber}
      />
    </div>
  );
}

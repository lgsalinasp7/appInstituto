"use client";
/**
 * modules/academia/components/student/LessonView.tsx
 * Vista completa de una sesión del bootcamp
 * Diseño: academy-shell-dark + tokens del bootcamp
 * Usa framer-motion (ya instalado), lucide-react, sonner
 */

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft, ChevronRight, Play, Check, Lock,
  ExternalLink, Bot, ChevronDown, ChevronUp,
} from "lucide-react";

// ── Tipos ──────────────────────────────────────────────────
interface ConceptItem { key: string; title: string; body: string }
interface CRALChallenge { id: string; phase: string; title: string; description: string; isDone: boolean }
interface QuizOption { id: string; label: string; text: string; isCorrect: boolean; feedback?: string }
interface QuizData {
  id: string; question: string; options: QuizOption[];
  result: { isCorrect: boolean; selectedOptionId?: string | null } | null;
}
interface DeliverableItem { id: string; text: string }
interface DeliverableData {
  id: string; title: string; description: string; isFinal: boolean;
  items: DeliverableItem[];
  submission: { status: string; githubUrl?: string; deployUrl?: string; checkedItems: string[] } | null;
}

export interface LessonViewProps {
  userId: string;
  lesson: {
    id: string; title: string; description: string;
    videoUrl?: string; duration: number;
    moduleTitle: string; moduleOrder: number; courseTitle: string;
    weekNumber: number; dayOfWeek: string; sessionType: string;
    videoTitle?: string; analogyText?: string; kaledIntro?: string;
    concepts: ConceptItem[];
    cralChallenges: CRALChallenge[];
    quizzes: QuizData[];
    deliverable: DeliverableData | null;
  };
  isCompleted: boolean;
  videoProgress: number;
  moduleLessons: Array<{
    id: string; title: string; weekNumber: number;
    dayOfWeek: string; isCompleted: boolean; isCurrent: boolean;
  }>;
  prevLessonId?: string;
  nextLessonId?: string;
}

// ── Tokens ────────────────────────────────────────────────
const MODULE_COLOR: Record<number, string> = {
  1: "#38bdf8", 2: "#a78bfa", 3: "#34d399", 4: "#fbbf24",
};
const CRAL_CFG: Record<string, { icon: string; label: string; color: string; pct: string }> = {
  CONSTRUIR: { icon: "🔨", label: "Construir", color: "#34d399", pct: "70%" },
  ROMPER:    { icon: "💥", label: "Romper",    color: "#f87171", pct: "10%" },
  AUDITAR:   { icon: "🔍", label: "Auditar",   color: "#fbbf24", pct: "10%" },
  LANZAR:    { icon: "🚀", label: "Lanzar",    color: "#38bdf8", pct: "10%" },
};
const SESSION_BADGE: Record<string, { label: string; color: string }> = {
  TEORIA:     { label: "Teoría",     color: "#38bdf8" },
  PRACTICA:   { label: "Práctica",   color: "#34d399" },
  ENTREGABLE: { label: "Entregable", color: "#fbbf24" },
  LIVE:       { label: "Live",       color: "#a78bfa" },
};
const DAY_SHORT: Record<string, string> = { LUNES: "Lun", MIERCOLES: "Mié", VIERNES: "Vie" };

// ── Main Component ────────────────────────────────────────
export function LessonView({
  userId, lesson, isCompleted, videoProgress, moduleLessons,
  prevLessonId, nextLessonId,
}: LessonViewProps) {
  const router = useRouter();
  const mc = MODULE_COLOR[lesson.moduleOrder] ?? "#38bdf8";
  const sessionBadge = SESSION_BADGE[lesson.sessionType] ?? SESSION_BADGE.TEORIA;

  // State
  const [activeConcept, setActiveConcept] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<Record<string, {
    selected: string | null; answered: boolean; correct: boolean; feedback?: string;
  }>>({});
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

  // ── Handlers ──────────────────────────────────────────
  const markCompleted = useCallback(async () => {
    const res = await fetch(`/api/academia/lessons/${lesson.id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoProgress: 100 }),
    });
    if (res.ok) {
      setCompleted(true);
      toast.success("✓ Sesión marcada como completada", { description: "Sigue con la próxima sesión." });
      router.refresh();
    }
  }, [lesson.id, router]);

  const answerQuiz = useCallback(async (
    quizId: string, optionId: string, isCorrect: boolean, feedback?: string
  ) => {
    if (quizState[quizId]?.answered) return;
    await fetch(`/api/academia/quizzes/${quizId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedOptionId: optionId }),
    });
    setQuizState((p) => ({ ...p, [quizId]: { selected: optionId, answered: true, correct: isCorrect, feedback } }));
    if (isCorrect) toast.success("¡Correcto! 🎯", { description: "Kaled está orgulloso de ti." });
    else toast.error("Incorrecto", { description: "Revisa el concepto e intenta de nuevo." });
  }, [quizState]);

  const completeCRAL = useCallback(async (challengeId: string) => {
    const res = await fetch(`/api/academia/cral/${challengeId}/complete`, {
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
    const res = await fetch(`/api/academia/deliverables/${lesson.deliverable.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ githubUrl, deployUrl, checkedItems: [...checkedItems] }),
    });
    setSubmitting(false);
    if (res.ok) {
      toast.success("¡Entregable enviado! 📦", { description: "El instructor lo revisará pronto." });
      router.refresh();
    }
  }, [lesson.deliverable, githubUrl, deployUrl, checkedItems, router]);

  // ── Render ────────────────────────────────────────────
  return (
    <div className="flex h-full">

      {/* ── LESSON SIDEBAR ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 200, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="hidden xl:flex flex-col border-r border-white/[0.06] h-full overflow-hidden shrink-0"
            style={{ background: "rgba(2,6,23,0.6)" }}
          >
            {/* Module header */}
            <div className="p-4 border-b border-white/[0.05]">
              <div
                className="text-[10px] font-bold uppercase tracking-[0.12em] mb-1"
                style={{ color: mc }}
              >
                Módulo {lesson.moduleOrder}
              </div>
              <div className="text-[12px] font-bold text-white leading-tight mb-2">
                {lesson.moduleTitle}
              </div>
              {/* Mini progress */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(moduleLessons.filter(l => l.isCompleted).length / moduleLessons.length) * 100}%`,
                      background: mc,
                    }}
                  />
                </div>
                <span className="text-[9px] text-slate-600">
                  {moduleLessons.filter(l => l.isCompleted).length}/{moduleLessons.length}
                </span>
              </div>
            </div>

            {/* Lessons grouped by week */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-2">
              {Array.from(new Set(moduleLessons.map(l => l.weekNumber))).map((week) => {
                const wl = moduleLessons.filter(l => l.weekNumber === week);
                return (
                  <div key={week}>
                    <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-700 px-2 py-2">
                      Semana {week}
                    </div>
                    {wl.map((ml) => (
                      <Link
                        key={ml.id}
                        href={`/academia/student/curso/sesion/${ml.id}`}
                        className={`flex items-center gap-2 px-2 py-2 rounded-lg mb-0.5 transition-all text-[11px] border ${
                          ml.isCurrent
                            ? "text-white border-opacity-30"
                            : "text-slate-500 border-transparent hover:bg-white/[0.03] hover:text-slate-300"
                        }`}
                        style={ml.isCurrent ? { borderColor: `${mc}50`, background: `${mc}10` } : {}}
                      >
                        <div
                          className="w-4 h-4 rounded-full border flex items-center justify-center shrink-0"
                          style={{
                            borderColor: ml.isCompleted ? "#34d399" : ml.isCurrent ? mc : "rgba(255,255,255,0.1)",
                            background: ml.isCompleted ? "#34d399" : ml.isCurrent ? `${mc}20` : "transparent",
                          }}
                        >
                          {ml.isCompleted && (
                            <svg className="w-2 h-2" fill="none" viewBox="0 0 8 8">
                              <path d="M1 4l2 2 4-4" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          )}
                          {!ml.isCompleted && ml.isCurrent && (
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: mc }} />
                          )}
                        </div>
                        <span className="flex-1 truncate leading-tight">{ml.title}</span>
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 lg:p-8 pb-20">

          {/* Breadcrumb */}
          <div className="flex items-center justify-between mb-6">
            <nav className="flex items-center gap-2 text-[11px] text-slate-600">
              <Link href="/academia/student/curso" className="hover:text-slate-400 transition-colors">
                Bootcamp
              </Link>
              <span>›</span>
              <span>Módulo {lesson.moduleOrder}</span>
              <span>›</span>
              <span className="text-slate-400">Sem.{lesson.weekNumber} · {DAY_SHORT[lesson.dayOfWeek]}</span>
            </nav>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                style={{
                  color: sessionBadge.color,
                  borderColor: `${sessionBadge.color}40`,
                  background: `${sessionBadge.color}15`,
                }}
              >
                {sessionBadge.label}
              </span>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden xl:flex p-1.5 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] transition-colors"
              >
                {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight font-display mb-2 leading-tight">
            {lesson.title}
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">{lesson.description}</p>

          {/* ── 1. KALED INTRO ── */}
          {lesson.kaledIntro && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-5 mb-8 border"
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
                      __html: lesson.kaledIntro
                        .replace(/\*\*(.+?)\*\*/g, "<strong class='text-white not-italic font-semibold'>$1</strong>")
                    }}
                  />
                  <Link
                    href="/academia/student/tutor"
                    className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-semibold text-cyan-400 hover:underline"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    Preguntarle a Kaled
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── 2. ANALOGÍA ── */}
          {lesson.analogyText && (
            <div
              className="rounded-xl p-4 mb-8 border-l-[3px]"
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
                    .replace(/\*\*(.+?)\*\*/g, "<strong class='text-white font-semibold'>$1</strong>")
                    .replace(/`(.+?)`/g, "<code class='bg-slate-900 text-cyan-400 px-1.5 py-0.5 rounded text-[11px] font-mono'>$1</code>"),
                }}
              />
            </div>
          )}

          {/* ── 3. CONCEPTOS ── */}
          {lesson.concepts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-[13px] font-bold text-white mb-3">🔑 Conceptos clave</h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {lesson.concepts.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setActiveConcept(activeConcept === c.key ? null : c.key)}
                    className={`academy-pill px-3 py-1.5 text-[11px] font-medium transition-all ${
                      activeConcept === c.key ? "academy-pill-active-dark" : ""
                    }`}
                  >
                    {c.title.split("—")[0].split(" — ")[0].trim()}
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {activeConcept && (() => {
                  const c = lesson.concepts.find((c) => c.key === activeConcept);
                  return c ? (
                    <motion.div
                      key={activeConcept}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="academy-card-dark rounded-xl p-4"
                    >
                      <div className="text-[13px] font-bold text-white mb-2">{c.title}</div>
                      <p
                        className="text-[12px] text-slate-400 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: c.body
                            .replace(/`(.+?)`/g, "<code class='bg-slate-900 text-cyan-400 px-1.5 py-0.5 rounded text-[11px] font-mono'>$1</code>")
                            .replace(/\*\*(.+?)\*\*/g, "<strong class='text-white font-semibold'>$1</strong>"),
                        }}
                      />
                    </motion.div>
                  ) : null;
                })()}
              </AnimatePresence>
            </div>
          )}

          {/* ── 4. VIDEO ── */}
          {lesson.videoUrl && (
            <div className="mb-8">
              <h2 className="text-[13px] font-bold text-white mb-3">📺 Video recomendado por Kaled</h2>
              <a
                href={lesson.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl overflow-hidden border border-white/[0.06] hover:border-cyan-500/30 transition-all group"
                style={{ background: "linear-gradient(135deg, #0d1b33, #1a2a50)" }}
              >
                <div className="p-5 flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                    style={{ background: "#2563eb" }}
                  >
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-white truncate mb-0.5">
                      {lesson.videoTitle ?? "Ver video de la sesión"}
                    </div>
                    <div className="text-[11px] text-slate-500">YouTube · Recomendado por Kaled</div>
                  </div>
                  <span className="shrink-0 text-[8px] bg-red-600/80 text-white font-bold px-2 py-1 rounded">
                    YouTube
                  </span>
                </div>
                <div className="px-5 py-2.5 border-t border-white/[0.05] flex items-center justify-between text-[10px]">
                  <span className="text-slate-600">🎯 Ver antes de la práctica</span>
                  <span className="text-cyan-400 flex items-center gap-1">
                    Abrir en YouTube <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </a>
            </div>
          )}

          {/* ── 5. CRAL ── */}
          {lesson.cralChallenges.length > 0 && (
            <div className="mb-8">
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
                      className="rounded-xl p-4 border transition-all"
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
                            style={{ color: cfg?.color, borderColor: `${cfg?.color}40`, background: `${cfg?.color}10` }}
                          >
                            Marcar completado
                          </button>
                        )}
                        <Link
                          href="/academia/student/tutor"
                          className="px-3 py-1.5 rounded-lg text-[11px] text-slate-500 border border-white/[0.08] hover:bg-white/[0.05] transition-colors"
                        >
                          Kaled
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── 6. QUIZ ── */}
          {lesson.quizzes.map((quiz) => {
            const state = quizState[quiz.id];
            const answered = quiz.result != null || state?.answered;
            const correct = state?.correct ?? quiz.result?.isCorrect;

            return (
              <div key={quiz.id} className="academy-card-dark rounded-xl p-5 mb-8">
                <h2 className="text-[13px] font-bold text-white mb-4">🧠 Verifica tu comprensión</h2>
                <p className="text-[13px] text-white font-medium leading-relaxed mb-4">{quiz.question}</p>
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
                            borderColor: answered && isSelected
                              ? opt.isCorrect ? "#34d399" : "#f87171"
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
                        background: correct ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
                        borderColor: correct ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)",
                        color: correct ? "#34d399" : "#f87171",
                      }}
                    >
                      {state?.feedback ?? (correct ? "¡Respuesta correcta! Kaled está orgulloso 🎯" : "Respuesta incorrecta. Revisa el concepto e intenta de nuevo.")}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* ── 7. ENTREGABLE ── */}
          {lesson.deliverable && (
            <div
              className="rounded-2xl p-5 mb-8 border"
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
                style={{ color: lesson.deliverable.isFinal ? "#fbbf24" : "#38bdf8" }}
              >
                {lesson.deliverable.isFinal ? "🏆 Entregable Integrador del Módulo" : "📦 Entregable Semanal"}
              </div>
              <h2 className="text-[15px] font-bold text-white mb-2">{lesson.deliverable.title}</h2>
              <p className="text-[12px] text-slate-500 leading-relaxed mb-5">
                {lesson.deliverable.description}
              </p>

              {/* Checklist */}
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
                          isChecked ? "text-slate-500 line-through" : "text-slate-300 group-hover:text-white"
                        }`}
                      >
                        {item.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* URLs */}
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

          {/* ── NAVIGATION ── */}
          <div className="flex items-center justify-between pt-6 border-t border-white/[0.06]">
            {prevLessonId ? (
              <Link
                href={`/academia/student/curso/sesion/${prevLessonId}`}
                className="flex items-center gap-2 academy-btn-vermas-dark px-4 py-2 text-[12px]"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Link>
            ) : <div />}

            <button
              onClick={markCompleted}
              disabled={completed}
              className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={
                completed
                  ? { background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }
                  : { background: `linear-gradient(135deg, ${mc}cc, ${mc}88)` }
              }
            >
              {completed ? "✓ Sesión completada" : "Marcar como visto →"}
            </button>

            {nextLessonId && (
              <Link
                href={`/academia/student/curso/sesion/${nextLessonId}`}
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
  );
}

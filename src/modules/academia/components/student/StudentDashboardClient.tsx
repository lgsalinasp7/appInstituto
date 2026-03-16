"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Bot,
  Trophy,
  CheckCircle,
  Lock,
  ChevronRight,
  Play,
  Target,
  Clock,
  Code2,
  Brain,
  Video,
  MessageCircle,
  Check,
  RefreshCw,
} from "lucide-react";

const MODULE_META: Record<number, { color: string; bg: string; border: string; label: string }> = {
  1: { color: "#38bdf8", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.25)", label: "Arquitectura Digital" },
  2: { color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.25)", label: "Frontend Next.js" },
  3: { color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.25)", label: "Backend & BD" },
  4: { color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.25)", label: "IA & Lanzamiento" },
};

const CRAL: Record<string, { icon: string; label: string; pct: string; color: string }> = {
  CONSTRUIR: { icon: "🔨", label: "Construir", pct: "70%", color: "#34d399" },
  ROMPER: { icon: "💥", label: "Romper", pct: "10%", color: "#f87171" },
  AUDITAR: { icon: "🔍", label: "Auditar", pct: "10%", color: "#fbbf24" },
  LANZAR: { icon: "🚀", label: "Lanzar", pct: "10%", color: "#38bdf8" },
};

const DAY_SHORT: Record<string, string> = { LUNES: "Lun", MIERCOLES: "Mié", VIERNES: "Vie" };

interface Props {
  userName: string;
  progress: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  quizzesPassed: number;
  deliverablesApproved: number;
  kaledInteractions: number;
  cralCompleted: Record<string, number>;
  modules: Array<{ id: string; title: string; order: number; progress: number }>;
  nextLessons: Array<{
    id: string;
    title: string;
    weekNumber: number;
    dayOfWeek: string;
    sessionType: string;
    moduleOrder: number;
    moduleTitle: string;
  }>;
  badges: Array<{ name: string; icon: string; earnedAt: string }>;
  cohortName: string;
  courseId: string;
  errorSummary?: string;
  nextLessonPhase?: string;
}

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.07 } } };

function getActivePhase(cralCompleted: Record<string, number>): string {
  const total = Object.values(cralCompleted).reduce((a, b) => a + b, 0);
  if (total < 5) return "CONSTRUIR";
  if (total < 10) return "ROMPER";
  if (total < 15) return "AUDITAR";
  return "LANZAR";
}

export function StudentDashboardClient({
  userName,
  progress,
  lessonsCompleted,
  lessonsTotal,
  quizzesPassed,
  deliverablesApproved,
  kaledInteractions,
  cralCompleted,
  modules,
  nextLessons,
  badges,
  cohortName,
  courseId,
  errorSummary = "",
  nextLessonPhase,
}: Props) {
  const [kaledOpen, setKaledOpen] = useState(false);
  const activeModule = Math.min(4, Math.ceil((progress / 100) * 4) + 1);
  const mc = MODULE_META[activeModule] || MODULE_META[1];
  const activePhase = (nextLessonPhase && CRAL[nextLessonPhase]) ? nextLessonPhase : getActivePhase(cralCompleted);
  const cral = CRAL[activePhase];
  const weekCurrent = Math.ceil((lessonsCompleted / lessonsTotal) * 16) || 1;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display mb-1">
          Hola de nuevo, {userName.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500 text-sm">{cohortName} · Lun/Mié/Vie 6:00 PM COT</p>
      </motion.div>

      {/* Summary cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Cohorte", value: cohortName.split(/[\s·]/)[0]?.slice(0, 12) ?? "—", sub: "activa", icon: BookOpen, color: "#38bdf8" },
          { label: "Sesiones", value: `${lessonsCompleted}/${lessonsTotal}`, sub: `${lessonsTotal ? Math.round((lessonsCompleted / lessonsTotal) * 100) : 0}% del bootcamp`,
            icon: Target, color: "#a78bfa" },
          { label: "Semana", value: `${weekCurrent}`, sub: "de 16", icon: Clock, color: "#34d399" },
          { label: "Entregables", value: deliverablesApproved, sub: "pendientes", icon: CheckCircle, color: "#fbbf24" },
        ].map((s) => (
          <div key={s.label} className="academy-card-dark rounded-xl sm:rounded-2xl p-4 sm:p-5 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4 shrink-0" style={{ color: s.color }} />
              <span className="text-[10px] sm:text-xs text-slate-500 truncate">{s.label}</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white truncate">{String(s.value)}</div>
            <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        <div className="xl:col-span-2 space-y-6">
          <motion.div
            variants={fadeUp}
            className="academy-card-dark rounded-xl sm:rounded-2xl p-5 sm:p-6 relative overflow-hidden"
            style={{ borderColor: mc.border }}
          >
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none opacity-30"
              style={{ background: `radial-gradient(ellipse 60% 40% at 30% 30%, ${mc.color}20, transparent)` }}
            />
            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                <div>
                  <div
                    className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2"
                    style={{ color: mc.color }}
                  >
                    Módulo {activeModule} Activo
                  </div>
                  <h2 className="text-xl font-black text-white tracking-tight font-display mb-2">
                    {mc.label}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black" style={{ color: mc.color }}>
                      {Math.round(progress)}%
                    </span>
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full border"
                      style={{ color: cral.color, borderColor: `${cral.color}40`, background: `${cral.color}15` }}
                    >
                      Fase: {cral.label}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500">{lessonsCompleted}/{lessonsTotal} sesiones</div>
                  <div className="text-sm text-slate-500">Semana {weekCurrent} de 16</div>
                </div>
              </div>

              <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden mb-4">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{ background: `linear-gradient(90deg, ${mc.color}, ${mc.color}aa)` }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5">
                {Object.entries(CRAL).map(([key, cfg]) => {
                  const count = cralCompleted[key] ?? 0;
                  const isActive = key === activePhase;
                  const phaseOrder = ["CONSTRUIR", "ROMPER", "AUDITAR", "LANZAR"];
                  const idx = phaseOrder.indexOf(key);
                  const isCompleted = idx < phaseOrder.indexOf(activePhase);
                  const isLocked = idx > phaseOrder.indexOf(activePhase) + 1;
                  return (
                    <div
                      key={key}
                      className="rounded-xl p-2.5 sm:p-3 border text-center transition-all"
                      style={{
                        background: isActive ? `${cfg.color}15` : isCompleted ? `${cfg.color}08` : "rgba(255,255,255,0.02)",
                        borderColor: isActive ? `${cfg.color}40` : "rgba(255,255,255,0.06)",
                      }}
                    >
                      <div className="flex justify-center mb-1">
                        {isCompleted ? (
                          <Check className="w-4 h-4" style={{ color: cfg.color }} />
                        ) : isActive ? (
                          <RefreshCw className="w-4 h-4" style={{ color: cfg.color }} />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-bold" style={{ color: cfg.color }}>
                        {cfg.label}
                      </div>
                      <div className="text-[8px] text-slate-600 mt-0.5">
                        {isCompleted ? "Completado" : isActive ? "En progreso" : "Bloqueado"}
                      </div>
                    </div>
                  );
                })}
              </div>

              {nextLessons[0] ? (
                <Link
                  href={`/academia/student/courses/${courseId}/lesson/${nextLessons[0].id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${mc.color}cc, ${mc.color}88)` }}
                >
                  <Play className="w-4 h-4 fill-white shrink-0" />
                  Continuar Fase: {cral.label} →
                </Link>
              ) : null}
            </div>
          </motion.div>

          {/* Project progress card */}
          <motion.div variants={fadeUp} className="academy-card-dark rounded-xl sm:rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Proyecto</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
                En construcción
              </span>
            </div>
            <div className="text-sm font-bold text-white mb-2">SaaS MVP Builder</div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-2">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress + 20, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ background: "linear-gradient(90deg, #0891b2, #2563eb)" }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Progreso general {Math.round(Math.min(progress + 20, 100))}%</span>
              <span>Activo hace 2h</span>
            </div>
            <Link
              href={`/academia/student/courses/${courseId}`}
              className="mt-3 block text-[11px] text-cyan-400 hover:underline font-medium"
            >
              Ir al proyecto →
            </Link>
          </motion.div>

          {/* Current lesson card */}
          {nextLessons[0] && (
            <motion.div variants={fadeUp} className="academy-card-dark rounded-xl sm:rounded-2xl p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center shrink-0 border"
                    style={{ background: MODULE_META[nextLessons[0].moduleOrder]?.bg ?? mc.bg, borderColor: MODULE_META[nextLessons[0].moduleOrder]?.border ?? mc.border }}
                  >
                    <Clock className="w-4 h-4 text-slate-400 mb-0.5" />
                    <span className="text-[10px] font-bold text-slate-500">3h</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500 mb-0.5">Próxima clase</div>
                    <div className="text-sm sm:text-base font-bold text-white truncate">{nextLessons[0].title}</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Siguiente lección en tu ruta.</p>
                  </div>
                </div>
                <Link
                  href={`/academia/student/courses/${courseId}/lesson/${nextLessons[0].id}`}
                  className="academy-btn-vermas-dark px-4 py-2 text-xs sm:text-sm font-semibold shrink-0 w-full sm:w-auto text-center"
                >
                  Continuar clase
                </Link>
              </div>
            </motion.div>
          )}

          <motion.div variants={fadeUp} className="academy-card-dark rounded-xl sm:rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Módulos del Bootcamp</h3>
              <Link
                href="/academia/student/courses"
                className="text-[11px] text-cyan-400 hover:underline font-medium flex items-center gap-1"
              >
                Ver todo <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((num) => {
                const m = modules.find((mod) => mod.order === num);
                const meta = MODULE_META[num];
                const pct = m?.progress ?? 0;
                const isDone = pct >= 100;
                const isActive = num === activeModule;
                const isLocked = num > activeModule + 1;

                return (
                  <Link
                    key={num}
                    href={isLocked ? "#" : `/academia/student/courses/${courseId}?modulo=${num}`}
                    className={`rounded-xl p-4 border transition-all ${isLocked ? "opacity-35 cursor-not-allowed pointer-events-none" : "hover:border-opacity-60 cursor-pointer"}`}
                    style={{
                      borderColor: isActive ? meta.border : "rgba(255,255,255,0.06)",
                      background: isActive ? meta.bg : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] text-slate-600 font-semibold">Módulo {num}</span>
                      {isLocked ? (
                        <Lock className="w-3 h-3 text-slate-700" />
                      ) : isDone ? (
                        <span className="text-[8px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">
                          ✓ 100%
                        </span>
                      ) : isActive ? (
                        <span
                          className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ color: meta.color, background: meta.bg }}
                        >
                          Activo
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[12px] font-bold text-white mb-2 leading-tight">
                      {meta.label}
                    </div>
                    <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: meta.color }}
                      />
                    </div>
                    <div className="text-[9px] text-slate-600 mt-1">{Math.round(pct)}%</div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div variants={fadeUp} className="academy-card-dark rounded-xl sm:rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/[0.05] flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ background: "rgba(8,145,178,0.15)", border: "1px solid rgba(8,145,178,0.3)" }}
              >
                🤖
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-white">Kaled AI</span>
                  <span className="text-[8px] font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-1.5 py-0.5 rounded-full">
                    AGENTE
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Online · Listo
                </div>
              </div>
            </div>
            <div className="p-4">
              {errorSummary ? (
                <div className="mb-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                    Errores recurrentes
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-line">
                    {errorSummary}
                  </p>
                </div>
              ) : null}
              <p className="text-[11px] text-slate-400 italic leading-relaxed mb-3">
                &quot;Llevas {lessonsCompleted} sesiones. ¡Vas muy bien!
                ¿Practicaste el reto de la fase {cral?.label}?&quot;
              </p>
              <button
                onClick={() => setKaledOpen(true)}
                className="w-full py-2.5 rounded-xl text-[12px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #0891b2, #2563eb)" }}
              >
                Abrir chat
              </button>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => setKaledOpen(true)}
                  className="academy-btn-vermas-dark py-1.5 text-[10px]"
                >
                  Solicitar pista
                </button>
                <button
                  type="button"
                  className="academy-btn-vermas-dark py-1.5 text-[10px] text-slate-500"
                >
                  Ignorar
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="academy-card-dark rounded-xl sm:rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-[12px] font-bold text-white">Próximas</span>
              </div>
              <Link
                href="/academia/student/calendar"
                className="text-[10px] text-cyan-400 hover:underline"
              >
                Calendario
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {nextLessons.length === 0 ? (
                <p className="text-[11px] text-slate-600 text-center py-3">¡Todo al día! 🎉</p>
              ) : (
                nextLessons.map((lesson, i) => (
                  <Link
                    key={lesson.id}
                    href={`/academia/student/courses/${courseId}/lesson/${lesson.id}`}
                    className={`flex gap-3 group ${i > 0 ? "opacity-60" : ""}`}
                  >
                    <div
                      className="w-10 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border"
                      style={{
                        background: i === 0 ? MODULE_META[lesson.moduleOrder]?.bg : "rgba(255,255,255,0.02)",
                        borderColor: i === 0 ? MODULE_META[lesson.moduleOrder]?.border : "rgba(255,255,255,0.06)",
                      }}
                    >
                      <span className="text-[8px] text-slate-500 font-bold uppercase">
                        {DAY_SHORT[lesson.dayOfWeek]}
                      </span>
                      <span className="text-sm font-black text-white">S{lesson.weekNumber * 3}</span>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-white group-hover:text-cyan-400 transition-colors leading-tight">
                        {lesson.title}
                      </div>
                      <div className="text-[9px] text-slate-600 mt-0.5">
                        Mód.{lesson.moduleOrder} · Sem.{lesson.weekNumber}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </motion.div>

          {badges.length > 0 && (
            <motion.div variants={fadeUp} className="academy-card-dark rounded-xl sm:rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-[12px] font-bold text-white">Logros recientes</span>
              </div>
              <div className="space-y-2">
                {badges.map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-base">{b.icon}</span>
                    <span className="text-[11px] text-slate-400 flex-1">{b.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div variants={fadeUp} className="academy-card-dark rounded-xl sm:rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white mb-3">Comunidad</h3>
            <div className="space-y-2">
              <a
                href="https://discord.gg/kaledacademy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[12px] text-slate-400 hover:text-white transition-colors"
              >
                <span className="text-[#5865F2]">◆</span> Discord del Bootcamp
              </a>
              <Link
                href="/academia/student/courses"
                className="flex items-center gap-2 text-[12px] text-slate-400 hover:text-white transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> Foro de Dudas
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick actions */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Link
          href={`/academia/student/courses/${courseId}`}
          className="academy-card-dark rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-start gap-4 hover:border-cyan-500/20 transition-colors group"
        >
          <div className="px-2.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shrink-0">
            <Code2 className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">Abrir Workspace</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Editor y entorno de desarrollo</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setKaledOpen(true)}
          className="academy-card-dark rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-start gap-4 hover:border-violet-500/20 transition-colors group text-left w-full"
        >
          <div className="px-2.5 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 shrink-0">
            <Brain className="w-5 h-5 text-violet-400" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors">Lab de Prompts</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Experimentación y tests IA</p>
          </div>
        </button>
        <Link
          href={`/academia/student/courses/${courseId}`}
          className="academy-card-dark rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-start gap-4 hover:border-amber-500/20 transition-colors group"
        >
          <div className="px-2.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 shrink-0">
            <Video className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">Ver Grabaciones</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Repasa sesiones anteriores</p>
          </div>
        </Link>
      </motion.div>

      {kaledOpen && <KaledModal onClose={() => setKaledOpen(false)} />}
    </motion.div>
  );
}

function KaledModal({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content:
        "¡Hola! Soy Kaled, tu tutor del bootcamp. Antes de ayudarte, cuéntame: ¿qué intentaste primero? Un arquitecto siempre intenta antes de pedir ayuda 🎯",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user" as const, content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/academy/ai/kaled", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("Error al conectar");
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
        }
      }
      setMessages((prev) => [...prev, { role: "assistant", content: full || "Dame un momento... 🤔" }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Tuve un problema de conexión. ¿Puedes intentar de nuevo?" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        className="relative w-full max-w-lg academy-card-dark rounded-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "70vh" }}
      >
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ background: "rgba(8,145,178,0.15)" }}
          >
            🤖
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-bold text-white">Kaled AI</div>
            <div className="text-[10px] text-emerald-400">● Tutor del Bootcamp</div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.05] transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-xl px-3.5 py-2.5 text-[12px] leading-relaxed max-w-[90%] ${
                m.role === "user"
                  ? "ml-auto bg-cyan-600/20 border border-cyan-500/20 text-white"
                  : "bg-white/[0.05] border border-white/[0.06] text-slate-300"
              }`}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="bg-white/[0.05] border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-slate-400 text-[12px] flex items-center gap-2">
              <span className="animate-pulse">●●●</span>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-white/[0.06] flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Pregúntale algo a Kaled..."
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-[12px] text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/40 transition-colors"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="px-4 py-2 rounded-xl text-[12px] font-bold text-white disabled:opacity-40 transition-opacity"
            style={{ background: "linear-gradient(135deg, #0891b2, #2563eb)" }}
          >
            Enviar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

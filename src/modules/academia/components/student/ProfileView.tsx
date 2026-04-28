"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  BookOpen,
  Target,
  Calendar,
  Clock,
  Star,
  Hammer,
  TriangleAlert,
  ShieldCheck,
  Bot,
  SlidersHorizontal,
  Sparkles,
  Lock,
  Camera,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Types ----------

export interface ProfileModule {
  id: string;
  title: string;
  description: string;
  order: number;
  weekNumber: number;
  startDate: string | null;
  endDate: string | null;
  status: "completed" | "active" | "upcoming" | "locked";
  phase: string | null;
  tags: string[];
  lessonsCompleted: number;
  lessonsTotal: number;
}

export interface ProfileBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface ProfileData {
  userName: string;
  userEmail?: string;
  userImage?: string;
  level: string;
  cohortName: string;
  overallProgress: number;
  currentModuleOrder: number;
  totalModules: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  totalTimeSpentHours: number;
  kaledInteractions: number;
  quizzesPassed: number;
  modules: ProfileModule[];
  badges: ProfileBadge[];
}

// ---------- Animations ----------

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

// ---------- Sub-components ----------

function ProgressRing({ percent, size = 96 }: { percent: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#profileGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="profileGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white">{Math.round(percent)}%</span>
        <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400">Completado</span>
      </div>
    </div>
  );
}

function MetricCard({ value, label, icon }: { value: string; label: string; icon?: React.ReactNode }) {
  return (
    <div className="academy-card-dark rounded-xl p-4 flex flex-col justify-between h-24">
      <div className="flex items-center gap-1">
        <span className="text-2xl font-black tracking-tight text-white">{value}</span>
        {icon}
      </div>
      <span className="text-xs font-medium text-slate-400">{label}</span>
    </div>
  );
}

function SkillItem({ name, level, icon }: { name: string; level: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 p-3 academy-card-dark rounded-xl hover:border-cyan-500/30 transition-colors group">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.08] group-hover:border-cyan-500/50 transition-colors"
        style={{ background: "rgba(8,145,178,0.08)" }}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium leading-none mb-1 text-white">{name}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{level}</span>
      </div>
    </div>
  );
}

const PHASE_CONFIG: Record<string, { icon: React.ReactNode; label: string }> = {
  CONSTRUIR: { icon: <Hammer className="w-3.5 h-3.5" />, label: "Fase: Build" },
  ROMPER: { icon: <TriangleAlert className="w-3.5 h-3.5" />, label: "Fase: Break" },
  AUDITAR: { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: "Fase: Audit" },
  LANZAR: { icon: <Sparkles className="w-3.5 h-3.5" />, label: "Fase: Launch" },
};

function TimelineItem({
  mod,
  isLast,
}: {
  mod: ProfileModule;
  isLast: boolean;
}) {
  const isCompleted = mod.status === "completed";
  const isActive = mod.status === "active";
  const isLocked = mod.status === "locked";

  const phaseInfo = mod.phase ? PHASE_CONFIG[mod.phase] : null;
  const statusLabel = isCompleted
    ? "Completado"
    : isLocked
      ? "Bloqueado"
      : phaseInfo?.label ?? "Próximo";

  const dateRange = mod.startDate && mod.endDate
    ? `${formatShortDate(mod.startDate)} - ${formatShortDate(mod.endDate)}`
    : null;

  return (
    <div className={cn("flex gap-4 sm:gap-6 relative", !isLast && "pb-8 sm:pb-12")}>
      {/* Vertical line */}
      {!isLast && (
        <div className="absolute top-8 bottom-0 left-[15px] sm:left-[15px] w-px border-l border-dashed border-white/[0.08]" />
      )}

      {/* Dot */}
      <div className="relative z-10 shrink-0">
        <div
          className={cn(
            "w-8 h-8 rounded-full border-4 border-[#0f1219] flex items-center justify-center shadow-md",
            isCompleted && "bg-gradient-to-br from-cyan-500 to-blue-600",
            isActive && "bg-gradient-to-br from-cyan-500 to-blue-600",
            !isCompleted && !isActive && !isLocked && "bg-gradient-to-br from-cyan-500/60 to-blue-600/60",
            isLocked && "bg-white/[0.04] border-white/[0.1]",
          )}
        >
          {isCompleted ? (
            <Trophy className="w-3.5 h-3.5 text-white" />
          ) : isLocked ? (
            <div className="w-2 h-2 bg-slate-600 rounded-full" />
          ) : (
            <span className="text-xs font-bold text-white">{mod.order}</span>
          )}
        </div>
      </div>

      {/* Card */}
      <div
        className={cn(
          "flex-1 academy-card-dark rounded-2xl p-4 sm:p-5 transition-all duration-300",
          isLocked && "opacity-60",
          !isLocked && "hover:border-cyan-500/20",
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Semana {mod.weekNumber}
            </span>
            {dateRange && (
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <Calendar className="w-3 h-3" />
                <span>{dateRange}</span>
              </div>
            )}
          </div>

          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-tight w-fit",
              isCompleted && "border-white/[0.08] text-white",
              isActive && "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
              !isCompleted && !isActive && !isLocked && "border-white/[0.08] text-slate-300",
              isLocked && "border-white/[0.06] text-slate-500",
            )}
          >
            {isCompleted ? (
              <Trophy className="w-3.5 h-3.5" />
            ) : phaseInfo ? (
              phaseInfo.icon
            ) : isLocked ? (
              <Lock className="w-3 h-3" />
            ) : null}
            <span>{statusLabel}</span>
          </div>
        </div>

        <h4 className={cn("text-base font-bold mb-2", isLocked ? "text-slate-500" : "text-white")}>
          {mod.title}
        </h4>
        <p className="text-sm text-slate-400 leading-relaxed">{mod.description}</p>

        {mod.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3 mt-3 border-t border-white/[0.05]">
            {mod.tags.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium border border-white/[0.08]"
                style={{ background: "rgba(8,145,178,0.06)" }}
              >
                <Star className="w-3 h-3 text-cyan-400" />
                <span className="text-slate-300">{tag}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${day} ${months[d.getMonth()]}`;
}

// ---------- Main Component ----------

export function ProfileView({ data }: { data: ProfileData }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(data.userImage);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await fetch("/api/auth/avatar", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al subir imagen");
      setAvatarUrl(json.imageUrl);
      router.refresh();
    } catch (err: unknown) {
      setAvatarError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleChangePassword() {
    setPasswordMsg(null);
    if (!currentPassword || !newPassword) {
      setPasswordMsg({ type: "error", text: "Completa todos los campos." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "La nueva contraseña debe tener al menos 8 caracteres." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Las contraseñas no coinciden." });
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al cambiar contraseña");
      setPasswordMsg({ type: "success", text: "Contraseña actualizada correctamente." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setShowPasswordForm(false), 2000);
    } catch (err: unknown) {
      setPasswordMsg({ type: "error", text: err instanceof Error ? err.message : String(err) });
    } finally {
      setPasswordLoading(false);
    }
  }

  const badgeIcons: Record<string, React.ReactNode> = {
    LESSONS_COMPLETED: <Target className="w-4 h-4 text-cyan-400" />,
    DELIVERABLES_APPROVED: <BookOpen className="w-4 h-4 text-cyan-400" />,
    STREAK_DAYS: <Star className="w-4 h-4 text-cyan-400" />,
    QUIZ_PERFECT_SCORE: <Trophy className="w-4 h-4 text-cyan-400" />,
    FIRST_DEPLOY: <Sparkles className="w-4 h-4 text-cyan-400" />,
    ALL_CRAL_DONE: <ShieldCheck className="w-4 h-4 text-cyan-400" />,
  };

  const activeModule = data.modules.find((m) => m.status === "active");

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8"
    >
      {/* Title */}
      <motion.section variants={fadeUp}>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display mb-1">
          Perfil y Progreso
        </h1>
        <p className="text-slate-500 text-sm">
          Rastrea tu evolución y gestiona tus preferencias de aprendizaje.
        </p>
      </motion.section>

      {/* Profile Summary Card */}
      <motion.section
        variants={fadeUp}
        className="relative academy-card-dark rounded-2xl p-5 sm:p-6 lg:p-8 overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(8,145,178,0.05)" }} />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative shrink-0 group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white/[0.08] shadow-xl">
                {avatarUrl ? (
                  <img src={avatarUrl} className="w-full h-full object-cover" alt={data.userName} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-cyan-400"
                    style={{ background: "rgba(8,145,178,0.15)" }}>
                    {data.userName[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
              </button>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border border-white/[0.08] shadow-md"
                style={{ background: "#0f1219" }}>
                <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              </div>
              {avatarError && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                  {avatarError}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">{data.userName}</h2>
              {data.userEmail && (
                <p className="text-slate-500 text-sm mt-2">{data.userEmail}</p>
              )}
              <div className="flex items-center gap-1.5 text-slate-400 text-sm mt-1">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Estudiante</span>
              </div>
              <div className="mt-2">
                <div className="px-3 py-1 rounded-lg text-sm font-medium border border-white/[0.08] inline-block"
                  style={{ background: "rgba(8,145,178,0.06)" }}>
                  {data.cohortName}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">Trayectoria Actual</p>
              <p className="text-xs text-slate-400 mt-1">
                Módulo {data.currentModuleOrder} de {data.totalModules} en progreso
              </p>
            </div>
            <ProgressRing percent={data.overallProgress} />
          </div>
        </div>
      </motion.section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Learning Path */}
        <motion.div variants={fadeUp} className="lg:col-span-8 space-y-5">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Ruta de Aprendizaje</h3>
          </div>

          <div className="academy-card-dark rounded-2xl p-4 sm:p-6 lg:p-8">
            {data.modules.map((mod, i) => (
              <TimelineItem key={mod.id} mod={mod} isLast={i === data.modules.length - 1} />
            ))}
            {data.modules.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-8">
                No hay módulos disponibles aún.
              </p>
            )}
          </div>
        </motion.div>

        {/* Right Column: Stats & Panels */}
        <motion.div variants={fadeUp} className="lg:col-span-4 space-y-6">
          {/* Study Metrics */}
          <section className="academy-card-dark rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock className="w-4 h-4 text-slate-400" />
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Métricas de Estudio
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard value={data.totalTimeSpentHours.toFixed(1)} label="Horas Activas" />
              <MetricCard value={String(data.quizzesPassed)} label="Quizzes Pasados" />
              <MetricCard value={String(data.kaledInteractions)} label="Sesiones Kaled" />
              <MetricCard
                value={`${data.lessonsCompleted}/${data.lessonsTotal}`}
                label="Lecciones"
                icon={<BookOpen className="w-4 h-4 text-cyan-400" />}
              />
            </div>
          </section>

          {/* Validated Skills / Badges */}
          <section className="academy-card-dark rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <Trophy className="w-4 h-4 text-slate-400" />
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Insignias Obtenidas
              </h4>
            </div>
            <div className="space-y-3">
              {data.badges.length > 0 ? (
                data.badges.map((b) => (
                  <SkillItem
                    key={b.id}
                    name={b.name}
                    level={b.description}
                    icon={badgeIcons[b.icon] ?? <Star className="w-4 h-4 text-cyan-400" />}
                  />
                ))
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">
                  Completa módulos para ganar insignias.
                </p>
              )}
            </div>
          </section>

          {/* Next Step Card */}
          {activeModule && (
            <section
              className="rounded-2xl p-5 sm:p-6 relative overflow-hidden border border-cyan-500/20"
              style={{ background: "rgba(8,145,178,0.06)" }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-24 h-24 text-cyan-400" />
              </div>
              <div className="inline-block px-2.5 py-1 bg-cyan-500/20 rounded-full text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-4">
                Siguiente Paso
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                {activeModule.title}
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                {activeModule.description}
              </p>
              <div className="w-full h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${activeModule.lessonsTotal > 0 ? (activeModule.lessonsCompleted / activeModule.lessonsTotal) * 100 : 0}%`,
                    background: "linear-gradient(90deg, #0891b2, #2563eb)",
                  }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {activeModule.lessonsCompleted} de {activeModule.lessonsTotal} lecciones
              </p>
            </section>
          )}

          {/* Tutor Inteligente */}
          <section className="academy-card-dark rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Tutor Inteligente
                </h4>
              </div>
              <SlidersHorizontal className="w-4 h-4 text-slate-500 cursor-pointer" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Frecuencia de Check-ins</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-500/10 text-cyan-400">
                Media
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Define con qué frecuencia el agente revisará tu código en el Lab.
            </p>
            <div className="relative h-1.5 rounded-full overflow-hidden mb-2 border border-white/[0.06]"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="absolute top-0 left-0 h-full w-1/2 rounded-full"
                style={{ background: "linear-gradient(90deg, #0891b2, #2563eb)" }} />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
              <span>A demanda</span>
              <span>Semanal</span>
              <span>Diario</span>
            </div>
          </section>

          {/* Cambiar Contraseña */}
          <section className="academy-card-dark rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Seguridad
                </h4>
              </div>
            </div>

            {!showPasswordForm ? (
              <button
                onClick={() => { setShowPasswordForm(true); setPasswordMsg(null); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-white/[0.08] text-slate-300 hover:bg-white/[0.04] hover:text-white transition-colors"
              >
                <KeyRound className="w-4 h-4" />
                Cambiar Contraseña
              </button>
            ) : (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 overflow-hidden">
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    placeholder="Contraseña actual"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/30 pr-10"
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    placeholder="Nueva contraseña (mín. 8 caracteres)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/30 pr-10"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="Confirmar nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/30"
                />

                <AnimatePresence>
                  {passwordMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium",
                        passwordMsg.type === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400",
                      )}
                    >
                      {passwordMsg.type === "success" ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      {passwordMsg.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #0891b2, #2563eb)" }}
                  >
                    {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Guardar
                  </button>
                  <button
                    onClick={() => { setShowPasswordForm(false); setPasswordMsg(null); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            )}
          </section>
        </motion.div>
      </div>
    </motion.div>
  );
}

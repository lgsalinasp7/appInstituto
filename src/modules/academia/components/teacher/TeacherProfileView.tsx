"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Users,
  Calendar,
  Camera,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  X,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface TeacherProfileData {
  userName: string;
  userEmail: string;
  userImage?: string;
  cohortName?: string;
  coursesCount: number;
  studentsCount: number;
  cohortsCount: number;
}

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

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

export function TeacherProfileView({ data }: { data: TeacherProfileData }) {
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
      setAvatarError(err instanceof Error ? err.message : "Error al subir imagen");
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
      setPasswordMsg({ type: "error", text: err instanceof Error ? err.message : "Error" });
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8"
    >
      <motion.section variants={fadeUp}>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display mb-1">
          Mi Perfil
        </h1>
        <p className="text-slate-500 text-sm">
          Información de tu cuenta como instructor de KaledAcademy.
        </p>
      </motion.section>

      <motion.section
        variants={fadeUp}
        className="relative academy-card-dark rounded-2xl p-5 sm:p-6 lg:p-8 overflow-hidden"
      >
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(8,145,178,0.05)" }}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative shrink-0 group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white/[0.08] shadow-xl">
                {avatarUrl ? (
                  <img src={avatarUrl} className="w-full h-full object-cover" alt={data.userName} />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-2xl font-bold text-cyan-400"
                    style={{ background: "rgba(8,145,178,0.15)" }}
                  >
                    {data.userName[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </button>
              <div
                className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border border-white/[0.08] shadow-md"
                style={{ background: "#0f1219" }}
              >
                <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              </div>
              {avatarError && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                  {avatarError}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">{data.userName}</h2>
              <p className="text-slate-400 text-sm mt-1">{data.userEmail}</p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                <div className="px-3 py-1 rounded-lg text-sm font-medium border border-white/[0.08]"
                  style={{ background: "rgba(8,145,178,0.06)" }}>
                  Instructor
                </div>
                {data.cohortName && (
                  <>
                    <span className="text-white/[0.1] hidden sm:inline">•</span>
                    <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                      <Users className="w-4 h-4 text-cyan-400" />
                      <span>{data.cohortName}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <motion.div variants={fadeUp} className="lg:col-span-8 space-y-5">
          <section className="academy-card-dark rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Métricas de Instructor
              </h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <MetricCard
                value={String(data.coursesCount)}
                label="Cursos"
                icon={<BookOpen className="w-4 h-4 text-cyan-400" />}
              />
              <MetricCard value={String(data.cohortsCount)} label="Cohortes" icon={<Calendar className="w-4 h-4 text-cyan-400" />} />
              <MetricCard value={String(data.studentsCount)} label="Estudiantes" icon={<Users className="w-4 h-4 text-cyan-400" />} />
            </div>
          </section>
        </motion.div>

        <motion.div variants={fadeUp} className="lg:col-span-4 space-y-6">
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
                onClick={() => {
                  setShowPasswordForm(true);
                  setPasswordMsg(null);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-white/[0.08] text-slate-300 hover:bg-white/[0.04] hover:text-white transition-colors"
              >
                <KeyRound className="w-4 h-4" />
                Cambiar Contraseña
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3 overflow-hidden"
              >
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    placeholder="Contraseña actual"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/30 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
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
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
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
                        passwordMsg.type === "success"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      )}
                    >
                      {passwordMsg.type === "success" ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
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
                    {passwordLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordMsg(null);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
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

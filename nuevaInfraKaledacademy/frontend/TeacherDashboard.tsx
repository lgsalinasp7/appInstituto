"use client";
/**
 * modules/academia/components/teacher/TeacherDashboard.tsx
 * Dashboard completo del instructor
 * Usa: academy-shell-dark, academy-card-dark, recharts (ya instalado)
 * Reemplaza la implementación anterior vacía
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, BookOpen, CheckCircle, TrendingUp,
  AlertCircle, Clock, Award, ChevronRight,
  BarChart2, Calendar, MessageSquare, FileCheck,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";

// ── Types ──────────────────────────────────────────────────
interface StudentRow {
  id: string;
  name: string;
  email: string;
  image?: string;
  progress: number;
  lessonsCompleted: number;
  deliverablesApproved: number;
  quizzesPassed: number;
  kaledInteractions: number;
  lastActivityAt?: string;
}

interface PendingDeliverable {
  id: string;
  studentName: string;
  deliverableTitle: string;
  weekNumber: number;
  submittedAt: string;
  githubUrl?: string;
  deployUrl?: string;
}

interface TeacherData {
  cohortName: string;
  totalStudents: number;
  activeStudents: number;
  avgProgress: number;
  deliverablesPending: number;
  students: StudentRow[];
  pendingDeliverables: PendingDeliverable[];
  weeklyData: Array<{ week: string; completions: number; deliverables: number }>;
}

// ── Helpers ───────────────────────────────────────────────
function timeAgo(iso?: string): string {
  if (!iso) return "Nunca";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Hace unos min";
  if (h < 24) return `Hace ${h}h`;
  const days = Math.floor(h / 24);
  return `Hace ${days}d`;
}

function getActivityColor(iso?: string): string {
  if (!iso) return "#64748b";
  const h = (Date.now() - new Date(iso).getTime()) / 3600000;
  if (h < 24) return "#34d399";
  if (h < 72) return "#fbbf24";
  return "#f87171";
}

const MODULE_COLOR: Record<number, string> = {
  1: "#38bdf8", 2: "#a78bfa", 3: "#34d399", 4: "#fbbf24",
};

const stagger = { show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

// ── Main Component ────────────────────────────────────────
export function TeacherDashboard() {
  const [data, setData] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "deliverables">("overview");

  useEffect(() => {
    fetch("/api/academia/teacher/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin"
        />
      </div>
    );
  }

  // Fallback data for development
  const d = data ?? {
    cohortName: "Cohorte 2025-1",
    totalStudents: 4,
    activeStudents: 3,
    avgProgress: 33,
    deliverablesPending: 2,
    students: [
      { id: "1", name: "Valentina Ríos", email: "v@demo.co", progress: 52, lessonsCompleted: 25, deliverablesApproved: 4, quizzesPassed: 18, kaledInteractions: 22, lastActivityAt: new Date(Date.now() - 3600000).toISOString() },
      { id: "2", name: "Andrés García", email: "a@demo.co", progress: 35, lessonsCompleted: 17, deliverablesApproved: 3, quizzesPassed: 12, kaledInteractions: 14, lastActivityAt: new Date(Date.now() - 7200000).toISOString() },
      { id: "3", name: "Carlos Herrera", email: "c@demo.co", progress: 28, lessonsCompleted: 13, deliverablesApproved: 2, quizzesPassed: 8, kaledInteractions: 7, lastActivityAt: new Date(Date.now() - 172800000).toISOString() },
      { id: "4", name: "Juliana Pérez", email: "j@demo.co", progress: 20, lessonsCompleted: 9, deliverablesApproved: 1, quizzesPassed: 5, kaledInteractions: 4, lastActivityAt: new Date(Date.now() - 432000000).toISOString() },
    ],
    pendingDeliverables: [
      { id: "d1", studentName: "Andrés García", deliverableTitle: "Página personal en GitHub Pages", weekNumber: 3, submittedAt: new Date(Date.now() - 86400000).toISOString(), githubUrl: "https://github.com/andres/proyecto" },
      { id: "d2", studentName: "Carlos Herrera", deliverableTitle: "Repositorio GitHub con PR", weekNumber: 2, submittedAt: new Date(Date.now() - 172800000).toISOString() },
    ],
    weeklyData: [
      { week: "S1", completions: 12, deliverables: 2 },
      { week: "S2", completions: 18, deliverables: 3 },
      { week: "S3", completions: 15, deliverables: 2 },
      { week: "S4", completions: 22, deliverables: 4 },
      { week: "S5", completions: 9, deliverables: 1 },
    ],
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight font-display mb-1">
            Dashboard Instructor
          </h1>
          <p className="text-slate-500 text-sm">{d.cohortName} · AI SaaS Engineering Bootcamp</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
            INSTRUCTOR
          </span>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Estudiantes", value: d.totalStudents, icon: Users, color: "#38bdf8", sub: `${d.activeStudents} activos` },
          { label: "Progreso prom.", value: `${Math.round(d.avgProgress)}%`, icon: TrendingUp, color: "#34d399", sub: "de toda la cohorte" },
          { label: "Entregables", value: d.deliverablesPending, icon: FileCheck, color: "#fbbf24", sub: "pendientes de revisión", alert: d.deliverablesPending > 0 },
          { label: "Módulo activo", value: "M2", icon: BookOpen, color: "#a78bfa", sub: "Frontend Next.js" },
        ].map((s) => (
          <div
            key={s.label}
            className="academy-card-dark rounded-xl p-4"
            style={s.alert ? { borderColor: "rgba(251,191,36,0.3)", background: "rgba(251,191,36,0.04)" } : {}}
          >
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
              <span className="text-[10px] text-slate-500">{s.label}</span>
              {s.alert && <AlertCircle className="w-3 h-3 text-amber-400 ml-auto" />}
            </div>
            <div className="text-2xl font-black text-white">{s.value}</div>
            <div className="text-[10px] text-slate-600 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} className="border-b border-white/[0.06] mb-6">
        <div className="flex gap-6">
          {(["overview", "students", "deliverables"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-[13px] font-semibold border-b-2 transition-all capitalize ${
                activeTab === tab
                  ? "text-cyan-400 border-cyan-400"
                  : "text-slate-600 border-transparent hover:text-slate-400"
              }`}
            >
              {tab === "overview" ? "Resumen" : tab === "students" ? "Estudiantes" : "Entregables"}
            </button>
          ))}
        </div>
      </motion.div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
          {/* Chart */}
          <motion.div variants={fadeUp} className="academy-card-dark rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-[13px] font-bold text-white">Actividad por semana</h3>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={d.weeklyData} barSize={20} barGap={8}>
                <XAxis
                  dataKey="week"
                  tick={{ fill: "#475569", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "#e2e8f0",
                  }}
                />
                <Bar dataKey="completions" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Sesiones" />
                <Bar dataKey="deliverables" fill="#a78bfa" radius={[4, 4, 0, 0]} name="Entregables" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Quick ranking */}
          <motion.div variants={fadeUp} className="academy-card-dark rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-bold text-white">Ranking rápido</h3>
              <button
                onClick={() => setActiveTab("students")}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                Ver todo <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {d.students.slice(0, 4).map((s, i) => (
                <div key={s.id} className="flex items-center gap-3">
                  <span
                    className="text-[11px] font-bold w-5 text-center"
                    style={{ color: i === 0 ? "#fbbf24" : "#64748b" }}
                  >
                    #{i + 1}
                  </span>
                  <div
                    className="w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}
                  >
                    {s.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-white truncate">{s.name}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${s.progress}%`, background: "#38bdf8" }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-cyan-400 w-8 text-right">
                      {Math.round(s.progress)}%
                    </span>
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: getActivityColor(s.lastActivityAt) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* STUDENTS */}
      {activeTab === "students" && (
        <motion.div variants={fadeUp} className="academy-card-dark rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/[0.05] flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-white">Tabla de estudiantes</h3>
            <Link
              href="/academia/teacher/students"
              className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
            >
              Gestión completa <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["#", "Estudiante", "Progreso", "Sesiones", "Entregables", "Kaled", "Actividad"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-600 text-left"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.students.map((s, i) => (
                  <tr key={s.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className="text-[11px] font-bold"
                        style={{ color: i === 0 ? "#fbbf24" : "#475569" }}
                      >
                        #{i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0"
                          style={{ borderColor: "rgba(255,255,255,0.08)", color: "#94a3b8" }}
                        >
                          {s.name[0]}
                        </div>
                        <div>
                          <div className="text-[12px] font-semibold text-white">{s.name}</div>
                          <div className="text-[10px] text-slate-600">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${s.progress}%`, background: "#38bdf8" }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-cyan-400">{Math.round(s.progress)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-white">{s.lessonsCompleted}/48</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-white">{s.deliverablesApproved}/16</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-slate-400">{s.kaledInteractions}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: getActivityColor(s.lastActivityAt) }}
                        />
                        <span className="text-[10px] text-slate-500">{timeAgo(s.lastActivityAt)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* DELIVERABLES */}
      {activeTab === "deliverables" && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
          {d.pendingDeliverables.length === 0 ? (
            <motion.div variants={fadeUp} className="academy-card-dark rounded-2xl p-8 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <div className="text-[13px] font-semibold text-white">¡Todo al día!</div>
              <div className="text-[11px] text-slate-500 mt-1">No hay entregables pendientes de revisión.</div>
            </motion.div>
          ) : (
            d.pendingDeliverables.map((del) => (
              <motion.div
                key={del.id}
                variants={fadeUp}
                className="academy-card-dark rounded-xl p-5 flex items-center gap-4"
                style={{ borderColor: "rgba(251,191,36,0.2)", background: "rgba(251,191,36,0.04)" }}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-lg shrink-0">
                  📦
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-white">{del.studentName}</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    Sem.{del.weekNumber} · {del.deliverableTitle}
                  </div>
                  <div className="text-[10px] text-slate-600 mt-0.5">{timeAgo(del.submittedAt)}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {del.githubUrl && (
                    <a
                      href={del.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="academy-btn-vermas-dark px-3 py-1.5 text-[11px]"
                    >
                      GitHub
                    </a>
                  )}
                  <button
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                    onClick={async () => {
                      await fetch(`/api/academia/deliverables/${del.id}/review`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "APROBADO" }),
                      });
                    }}
                  >
                    ✓ Aprobar
                  </button>
                  <button className="academy-btn-vermas-dark px-3 py-1.5 text-[11px]">
                    Rechazar
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

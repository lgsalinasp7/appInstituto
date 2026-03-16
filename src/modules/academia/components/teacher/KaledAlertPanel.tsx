"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface InstructorTask {
  id: string;
  studentId: string;
  studentName: string;
  type: string;
  priority: string;
  title: string;
  diagnosis: string;
  suggestion: string;
  status: string;
  createdAt: string;
}

export function KaledAlertPanel() {
  const [tasks, setTasks] = useState<InstructorTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/academy/instructor/tasks");
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const markResolved = async (taskId: string) => {
    setUpdatingId(taskId);
    try {
      const res = await fetch("/api/academy/instructor/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: "RESOLVED" }),
      });
      if (res.ok) {
        toast.success("Alerta marcada como resuelta");
        fetchTasks();
      } else {
        toast.error("Error al actualizar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setUpdatingId(null);
    }
  };

  const priorityColor: Record<string, string> = {
    HIGH: "border-red-500/40 bg-red-500/10",
    MEDIUM: "border-amber-500/40 bg-amber-500/10",
    LOW: "border-slate-500/40 bg-slate-500/10",
  };

  if (loading) {
    return (
      <div className="academy-card-dark p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h2 className="text-lg font-bold text-white font-display">Alertas de Kaled</h2>
        </div>
        <p className="text-slate-400 text-sm">Cargando...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="academy-card-dark p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h2 className="text-lg font-bold text-white font-display">Alertas de Kaled</h2>
        </div>
        <p className="text-slate-400 text-sm">No hay alertas pendientes.</p>
      </div>
    );
  }

  return (
    <div className="academy-card-dark p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <h2 className="text-lg font-bold text-white font-display">Alertas de Kaled</h2>
        <span className="text-[11px] text-slate-500">({tasks.length} pendientes)</span>
      </div>
      <div className="space-y-3">
        {tasks.map((t) => (
          <div
            key={t.id}
            className={`rounded-xl p-4 border ${priorityColor[t.priority] ?? priorityColor.LOW}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {t.priority}
                </p>
                <p className="text-sm font-semibold text-white">{t.title}</p>
                <p
                  className="text-[12px] text-slate-400 mt-2 line-clamp-2"
                  dangerouslySetInnerHTML={{
                    __html: t.diagnosis
                      .replace(/\*\*(.+?)\*\*/g, "<strong class='text-white'>$1</strong>"),
                  }}
                />
                <p className="text-[11px] text-cyan-400 mt-2 line-clamp-1">{t.suggestion}</p>
              </div>
              <button
                onClick={() => markResolved(t.id)}
                disabled={updatingId === t.id}
                className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {updatingId === t.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                Resolver
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

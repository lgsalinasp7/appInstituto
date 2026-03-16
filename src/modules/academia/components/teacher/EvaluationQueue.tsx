"use client";

import { useCallback, useEffect, useState } from "react";
import { FileCheck, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PendingEvaluation {
  id: string;
  studentName: string;
  deliverableTitle: string;
  lessonTitle: string;
  overallFeedback: string;
  feedbackConstruir: string | null;
  feedbackRomper: string | null;
  feedbackAuditar: string | null;
  feedbackLanzar: string | null;
  strengths: string[];
  improvements: string[];
  socraticQuestions: string[];
  status: string;
}

export function EvaluationQueue() {
  const [evaluations, setEvaluations] = useState<PendingEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchEvaluations = useCallback(async () => {
    try {
      const res = await fetch("/api/academy/instructor/evaluations");
      const data = await res.json();
      setEvaluations(Array.isArray(data) ? data : []);
    } catch {
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  const approve = async (evaluationId: string, visibleToStudent: boolean) => {
    setUpdatingId(evaluationId);
    try {
      const res = await fetch("/api/academy/instructor/approve-evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evaluationId,
          approved: true,
          visibleToStudent,
        }),
      });
      if (res.ok) {
        toast.success("Evaluación aprobada");
        fetchEvaluations();
      } else {
        toast.error("Error al aprobar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setUpdatingId(null);
    }
  };

  const reject = async (evaluationId: string) => {
    setUpdatingId(evaluationId);
    try {
      const res = await fetch("/api/academy/instructor/approve-evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evaluationId, approved: false }),
      });
      if (res.ok) {
        toast.success("Evaluación rechazada");
        fetchEvaluations();
      } else {
        toast.error("Error al rechazar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="academy-card-dark p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileCheck className="w-4 h-4 text-cyan-400" />
          <h2 className="text-lg font-bold text-white font-display">Evaluaciones pendientes</h2>
        </div>
        <p className="text-slate-400 text-sm">Cargando...</p>
      </div>
    );
  }

  if (evaluations.length === 0) {
    return (
      <div className="academy-card-dark p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileCheck className="w-4 h-4 text-cyan-400" />
          <h2 className="text-lg font-bold text-white font-display">Evaluaciones pendientes</h2>
        </div>
        <p className="text-slate-400 text-sm">No hay evaluaciones pendientes de aprobar.</p>
      </div>
    );
  }

  return (
    <div className="academy-card-dark p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileCheck className="w-4 h-4 text-cyan-400" />
        <h2 className="text-lg font-bold text-white font-display">Evaluaciones pendientes</h2>
        <span className="text-[11px] text-slate-500">({evaluations.length})</span>
      </div>
      <div className="space-y-4">
        {evaluations.map((e) => (
          <div
            key={e.id}
            className="rounded-xl p-4 border border-white/[0.08] bg-white/[0.02]"
          >
            <p className="text-sm font-semibold text-white truncate">{e.deliverableTitle}</p>
            <p className="text-[11px] text-slate-500 mb-2">{e.studentName} · {e.lessonTitle}</p>
            <p className="text-[12px] text-slate-400 line-clamp-2 mb-3">{e.overallFeedback}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {e.feedbackConstruir && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  C: {e.feedbackConstruir.slice(0, 40)}...
                </span>
              )}
              {e.feedbackRomper && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  R: {e.feedbackRomper.slice(0, 40)}...
                </span>
              )}
              {e.feedbackAuditar && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  A: {e.feedbackAuditar.slice(0, 40)}...
                </span>
              )}
              {e.feedbackLanzar && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  L: {e.feedbackLanzar.slice(0, 40)}...
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => approve(e.id, true)}
                disabled={updatingId === e.id}
                className="flex-1 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {updatingId === e.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                Aprobar y mostrar al estudiante
              </button>
              <button
                onClick={() => reject(e.id)}
                disabled={updatingId === e.id}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <X className="w-3 h-3" />
                Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

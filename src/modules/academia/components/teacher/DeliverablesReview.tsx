"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, X, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type DeliverableReviewQueueTab = "delivered" | "in_review" | "rejected_recent";

interface PendingSubmission {
  id: string;
  userId: string;
  status: string;
  githubUrl: string | null;
  deployUrl: string | null;
  submittedAt: string | null;
  feedback: string | null;
  user: { id: string; name: string | null; email: string };
  deliverable: { title: string; weekNumber: number };
}

interface DeliverablesReviewProps {
  cohortId: string | null;
  /** Si es false, solo se consulta la cola ENTREGADO (compatibilidad). Por defecto: pestañas completas. */
  showQueueTabs?: boolean;
}

const TAB_LABELS: Record<DeliverableReviewQueueTab, string> = {
  delivered: "Por revisar",
  in_review: "En revisión",
  rejected_recent: "Rechazados recientes",
};

export function DeliverablesReview({ cohortId, showQueueTabs = true }: DeliverablesReviewProps) {
  const [queue, setQueue] = useState<DeliverableReviewQueueTab>("delivered");
  const [pending, setPending] = useState<PendingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const fetchPending = useCallback(() => {
    if (!cohortId) {
      setLoading(false);
      return;
    }
    const q = showQueueTabs ? queue : "delivered";
    setLoading(true);
    fetch(`/api/academy/cohorts/${cohortId}/deliverables/pending?queue=${q}`)
      .then((r) => r.json())
      .then((data: PendingSubmission[] | { error?: string }) => {
        if (Array.isArray(data)) {
          setPending(data);
        } else {
          setPending([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setPending([]);
      });
  }, [cohortId, queue, showQueueTabs]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const review = async (submissionId: string, status: "APROBADO" | "RECHAZADO", feedback?: string) => {
    setReviewingId(submissionId);
    try {
      const res = await fetch(`/api/academy/deliverables/${submissionId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback, score: status === "APROBADO" ? 100 : 0 }),
      });
      if (res.ok) {
        toast.success(status === "APROBADO" ? "Entregable aprobado" : "Entregable rechazado");
        fetchPending();
      } else {
        const err = await res.json();
        toast.error(err?.error ?? "Error al revisar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setReviewingId(null);
    }
  };

  const canReview = queue === "delivered" || queue === "in_review";

  if (!cohortId) {
    return (
      <div className="academy-card-dark p-8">
        <h2 className="text-lg font-bold text-white font-display mb-4">Entregables pendientes</h2>
        <p className="text-slate-400">Selecciona una cohorte para revisar entregables.</p>
      </div>
    );
  }

  return (
    <div className="academy-card-dark p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-lg font-bold text-white font-display">Revisión de entregables</h2>
        {showQueueTabs ? (
          <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            {(Object.keys(TAB_LABELS) as DeliverableReviewQueueTab[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setQueue(key)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                  queue === key
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-white border border-transparent"
                )}
              >
                {TAB_LABELS[key]}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {loading ? (
        <p className="text-slate-400">Cargando...</p>
      ) : pending.length === 0 ? (
        <p className="text-slate-400">No hay entregables en esta cola.</p>
      ) : (
        <div className="space-y-4">
          {pending.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">{s.user.name ?? s.user.email}</p>
                  <p className="text-sm text-slate-400">{s.user.email}</p>
                  <p className="text-sm text-cyan-400 mt-1">
                    {s.deliverable.title} · Semana {s.deliverable.weekNumber}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-wide">{s.status}</p>
                  {s.submittedAt && (
                    <p className="text-xs text-slate-500 mt-1">
                      Enviado: {new Date(s.submittedAt).toLocaleString("es-CO")}
                    </p>
                  )}
                  {s.feedback ? (
                    <p className="text-xs text-slate-400 mt-2 border-l-2 border-amber-500/40 pl-2">
                      Feedback: {s.feedback}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {s.githubUrl && (
                      <a
                        href={s.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline"
                      >
                        GitHub <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {s.deployUrl && (
                      <a
                        href={s.deployUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline"
                      >
                        Deploy <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
                {canReview ? (
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => review(s.id, "APROBADO")}
                      disabled={reviewingId === s.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-50"
                    >
                      {reviewingId === s.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Aprobar
                    </button>
                    <button
                      type="button"
                      onClick={() => review(s.id, "RECHAZADO")}
                      disabled={reviewingId === s.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 disabled:opacity-50"
                    >
                      {reviewingId === s.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      Rechazar
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

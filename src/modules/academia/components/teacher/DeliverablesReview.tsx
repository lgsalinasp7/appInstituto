"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, X, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PendingSubmission {
  id: string;
  userId: string;
  githubUrl: string | null;
  deployUrl: string | null;
  submittedAt: string | null;
  user: { id: string; name: string | null; email: string };
  deliverable: { title: string; weekNumber: number };
}

interface DeliverablesReviewProps {
  cohortId: string | null;
}

export function DeliverablesReview({ cohortId }: DeliverablesReviewProps) {
  const [pending, setPending] = useState<PendingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const fetchPending = useCallback(() => {
    if (!cohortId) {
      setLoading(false);
      return;
    }
    fetch(`/api/academy/cohorts/${cohortId}/deliverables/pending`)
      .then((r) => r.json())
      .then((data: PendingSubmission[] | { error?: string }) => {
        if (Array.isArray(data)) {
          setPending(data);
        } else {
          setPending([]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [cohortId]);

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

  if (!cohortId) {
    return (
      <div className="academy-card-dark p-8">
        <h2 className="text-lg font-bold text-white font-display mb-4">Entregables pendientes</h2>
        <p className="text-slate-400">No hay cohorte activa. Selecciona una cohorte para revisar entregables.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="academy-card-dark p-8">
        <h2 className="text-lg font-bold text-white font-display mb-4">Entregables pendientes</h2>
        <p className="text-slate-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="academy-card-dark p-6">
      <h2 className="text-lg font-bold text-white font-display mb-4">Entregables pendientes</h2>
      {pending.length === 0 ? (
        <p className="text-slate-400">No hay entregables pendientes de revisión.</p>
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
                  {s.submittedAt && (
                    <p className="text-xs text-slate-500 mt-1">
                      Enviado: {new Date(s.submittedAt).toLocaleString("es-CO")}
                    </p>
                  )}
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
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => review(s.id, "APROBADO")}
                    disabled={reviewingId === s.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-50"
                  >
                    {reviewingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Aprobar
                  </button>
                  <button
                    type="button"
                    onClick={() => review(s.id, "RECHAZADO")}
                    disabled={reviewingId === s.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 disabled:opacity-50"
                  >
                    {reviewingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

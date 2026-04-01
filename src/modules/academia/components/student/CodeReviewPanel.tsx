"use client";

import { useState } from "react";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CodeReviewResult {
  feedback: string;
  socraticQuestions: string[];
  strengths: string[];
  improvements: string[];
  errorPatternsDetected: string[];
  cralAlignment: string;
}

interface CodeReviewPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId?: string;
  lessonTitle: string;
  weekNumber: number;
}

function ResultBlock({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-slate-900/40 px-4 py-3 backdrop-blur-sm",
        className
      )}
    >
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      {children}
    </div>
  );
}

export function CodeReviewPanel({
  open,
  onOpenChange,
  lessonId,
  lessonTitle,
  weekNumber,
}: CodeReviewPanelProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CodeReviewResult | null>(null);

  const submit = async () => {
    if (!code.trim()) {
      toast.error("Pega tu código primero");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/academy/ai/kaled/review-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), lessonId }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        toast.error(data?.error ?? "Error al revisar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "flex max-h-[min(92dvh,900px)] w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] flex-col gap-0 overflow-hidden border border-white/[0.12] bg-slate-950 p-0 shadow-2xl shadow-black/50 sm:max-w-2xl lg:max-w-3xl"
        )}
      >
        <div
          className="h-1 w-full shrink-0 bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500"
          aria-hidden
        />

        <DialogHeader className="shrink-0 space-y-0 border-b border-white/[0.06] bg-slate-950/95 px-5 pb-4 pt-5 text-left sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:pr-10">
            <div className="flex gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/15 to-violet-600/20 shadow-inner shadow-cyan-500/10">
                <Bot className="h-6 w-6 text-cyan-300" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="text-lg font-bold tracking-tight text-white sm:text-xl">
                    Kaled revisa mi código
                  </DialogTitle>
                  <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-200/90">
                    <Sparkles className="h-3 w-3" />
                    IA asistida
                  </span>
                </div>
                <DialogDescription className="text-[13px] leading-relaxed text-slate-400">
                  Pega un fragmento o diff (sin secretos). Kaled devuelve feedback estructurado para que
                  tú decidas qué aplicar.
                </DialogDescription>
              </div>
            </div>
          </div>
          <p className="mt-3 rounded-xl border border-white/[0.06] bg-slate-900/50 px-3 py-2 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-400">Sesión:</span> {lessonTitle}
            <span className="mx-2 text-slate-600">·</span>
            <span className="font-semibold text-slate-400">Semana</span> {weekNumber}
          </p>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          <label htmlFor="kaled-code-input" className="sr-only">
            Código a revisar
          </label>
          <textarea
            id="kaled-code-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Pega aquí tu código o diff…&#10;&#10;No incluyas .env, tokens ni datos personales."
            className="mb-4 min-h-[min(200px,28vh)] w-full resize-y rounded-2xl border border-white/[0.1] bg-slate-900/60 px-4 py-3 font-mono text-[13px] leading-relaxed text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/35 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 sm:min-h-[220px]"
            disabled={loading}
            spellCheck={false}
          />

          {result && (
            <div className="space-y-3 pb-2">
              <ResultBlock label="Retroalimentación">
                <p className="whitespace-pre-line text-[13px] leading-relaxed text-slate-300">
                  {result.feedback}
                </p>
              </ResultBlock>

              {result.strengths.length > 0 && (
                <ResultBlock label="Fortalezas" className="border-emerald-500/15 bg-emerald-500/[0.04]">
                  <ul className="list-inside list-disc space-y-1 text-[12px] text-slate-300">
                    {result.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </ResultBlock>
              )}

              {result.improvements.length > 0 && (
                <ResultBlock label="Mejoras" className="border-amber-500/15 bg-amber-500/[0.04]">
                  <ul className="list-inside list-disc space-y-1 text-[12px] text-slate-300">
                    {result.improvements.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </ResultBlock>
              )}

              {result.errorPatternsDetected.length > 0 && (
                <ResultBlock
                  label="Patrones / riesgos detectados"
                  className="border-rose-500/20 bg-rose-500/[0.05]"
                >
                  <ul className="list-inside list-disc space-y-1 text-[12px] text-rose-100/90">
                    {result.errorPatternsDetected.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </ResultBlock>
              )}

              {result.socraticQuestions.length > 0 && (
                <ResultBlock label="Preguntas para reflexionar" className="border-cyan-500/15 bg-cyan-500/[0.04]">
                  <ul className="list-inside list-disc space-y-1 text-[12px] text-slate-300">
                    {result.socraticQuestions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </ResultBlock>
              )}

              {result.cralAlignment ? (
                <p className="rounded-xl border border-white/[0.06] bg-slate-900/30 px-3 py-2 text-[11px] italic leading-relaxed text-slate-500">
                  {result.cralAlignment}
                </p>
              ) : null}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t border-white/[0.08] bg-slate-950/95 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-500/35 bg-gradient-to-r from-cyan-500/20 to-violet-600/20 py-3.5 text-sm font-bold text-cyan-100 shadow-lg shadow-cyan-950/30 transition-all hover:from-cyan-500/30 hover:to-violet-600/30 hover:border-cyan-400/45 disabled:opacity-50 sm:w-auto sm:min-w-[240px] sm:px-8"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Kaled está revisando…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Kaled, revisa mi código
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

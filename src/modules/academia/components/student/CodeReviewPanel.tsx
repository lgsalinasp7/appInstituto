"use client";

import { useState } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl bg-[#0f172a] border-l border-white/[0.08] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-white font-display">
            <Bot className="w-5 h-5 text-cyan-400" />
            Kaled revisa mi código
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <p className="text-[12px] text-slate-400">
            Sesión: {lessonTitle} · Semana {weekNumber}
          </p>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Pega aquí el código que quieres que Kaled revise..."
            className="w-full h-40 px-4 py-3 rounded-xl bg-slate-900/50 border border-white/[0.08] text-slate-400 text-[13px] font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/30 resize-none"
            disabled={loading}
          />
          <button
            onClick={submit}
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Kaled está revisando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Kaled, revisa mi código
              </>
            )}
          </button>

          {result && (
            <div className="space-y-4 pt-4 border-t border-white/[0.08]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Retroalimentación
                </p>
                <p className="text-[13px] text-slate-300 leading-relaxed whitespace-pre-line">
                  {result.feedback}
                </p>
              </div>
              {result.strengths.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mb-1">
                    Fortalezas
                  </p>
                  <ul className="list-disc list-inside text-[12px] text-slate-400 space-y-0.5">
                    {result.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.improvements.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-1">
                    Mejoras
                  </p>
                  <ul className="list-disc list-inside text-[12px] text-slate-400 space-y-0.5">
                    {result.improvements.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.socraticQuestions.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-500 mb-1">
                    Preguntas para reflexionar
                  </p>
                  <ul className="list-disc list-inside text-[12px] text-slate-400 space-y-0.5">
                    {result.socraticQuestions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-[11px] text-slate-500 italic">{result.cralAlignment}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

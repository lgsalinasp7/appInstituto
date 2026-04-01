"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type InteractiveLessonShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function InteractiveLessonShell({ children, className }: InteractiveLessonShellProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [fallbackOpen, setFallbackOpen] = useState(false);

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      await el.requestFullscreen();
    } catch {
      setFallbackOpen(true);
    }
  }, []);

  return (
    <>
      <div
        className={`rounded-2xl bg-gradient-to-br from-cyan-500/[0.12] via-white/[0.04] to-violet-600/[0.1] p-[1px] shadow-lg shadow-black/20 ${className ?? ""}`}
      >
        <div
          ref={wrapRef}
          className="relative overflow-hidden rounded-[15px] border border-white/[0.06] bg-slate-950/95 ring-1 ring-inset ring-white/[0.04]"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.08),transparent)]"
            aria-hidden
          />
          <div className="absolute right-2 top-2 z-20 flex gap-1">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.12] bg-slate-950/90 text-slate-200 shadow-md backdrop-blur-md transition-colors hover:border-cyan-500/25 hover:bg-slate-900 hover:text-cyan-100"
              title={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              aria-label={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
          <div className="relative max-h-[min(80vh,860px)] overflow-y-auto overflow-x-hidden">
            {children}
          </div>
        </div>
      </div>

      <Dialog open={fallbackOpen} onOpenChange={setFallbackOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pantalla completa</DialogTitle>
            <DialogDescription>
              Este navegador no permitió entrar en pantalla completa desde la página. Puedes usar F11
              o el modo pantalla completa del navegador, o ampliar la ventana manualmente.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

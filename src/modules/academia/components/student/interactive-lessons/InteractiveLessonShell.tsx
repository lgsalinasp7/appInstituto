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
        ref={wrapRef}
        className={`relative overflow-hidden rounded-xl border border-white/[0.08] bg-slate-950/40 ${className ?? ""}`}
      >
        <div className="absolute right-2 top-2 z-20 flex gap-1">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.12] bg-slate-900/90 text-slate-200 shadow-sm backdrop-blur hover:bg-slate-800"
            title={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            aria-label={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
        <div className="max-h-[min(85vh,900px)] overflow-y-auto overflow-x-hidden">{children}</div>
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

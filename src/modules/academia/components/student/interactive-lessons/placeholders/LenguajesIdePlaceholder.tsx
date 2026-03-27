"use client";

import type { InteractiveLessonBaseProps } from "../interactive-lesson-types";

export function LenguajesIdePlaceholder(_props: InteractiveLessonBaseProps) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-slate-950/80 p-12 text-center">
      <p className="text-[14px] font-medium text-slate-300">Lenguajes e IDE</p>
      <p className="mt-2 text-[12px] text-slate-500">
        La animación interactiva de esta lección se publicará en una próxima versión.
      </p>
    </div>
  );
}

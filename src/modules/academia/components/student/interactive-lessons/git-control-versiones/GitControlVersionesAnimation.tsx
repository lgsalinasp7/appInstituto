"use client";

export type GitControlVersionesAnimationProps = {
  embedded?: boolean;
  titleFromLesson?: string;
  className?: string;
};

export function GitControlVersionesAnimation({
  embedded,
  titleFromLesson: _titleFromLesson,
  className,
}: GitControlVersionesAnimationProps) {
  const frameHeight = embedded ? "min(85vh, 900px)" : "calc(100vh - 160px)";
  return (
    <div className={`relative w-full ${className ?? ""}`}>
      <iframe
        title="Git: Control de Versiones"
        src="/interactive/git-control-versiones.html"
        className="w-full rounded-xl border border-white/10 bg-slate-950"
        style={{ height: frameHeight }}
      />
    </div>
  );
}

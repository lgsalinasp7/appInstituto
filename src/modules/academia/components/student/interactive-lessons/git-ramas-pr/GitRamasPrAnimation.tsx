"use client";

export type GitRamasPrAnimationProps = {
  embedded?: boolean;
  titleFromLesson?: string;
  className?: string;
};

export function GitRamasPrAnimation({
  embedded,
  titleFromLesson: _titleFromLesson,
  className,
}: GitRamasPrAnimationProps) {
  const frameHeight = embedded ? "min(85vh, 900px)" : "calc(100vh - 160px)";
  return (
    <div className={`relative w-full ${className ?? ""}`}>
      <iframe
        title="Git: Ramas, PRs y Colaboración"
        src="/interactive/git-ramas-pr.html"
        className="w-full rounded-xl border border-white/10 bg-slate-950"
        style={{ height: frameHeight }}
      />
    </div>
  );
}

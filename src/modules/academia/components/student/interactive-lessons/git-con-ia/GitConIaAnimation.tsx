"use client";

export type GitConIaAnimationProps = {
  embedded?: boolean;
  titleFromLesson?: string;
  className?: string;
};

export function GitConIaAnimation({
  embedded,
  titleFromLesson: _titleFromLesson,
  className,
}: GitConIaAnimationProps) {
  const frameHeight = embedded ? "min(76vh, 780px)" : "calc(100vh - 160px)";
  return (
    <div className={`relative w-full ${className ?? ""}`}>
      <iframe
        title="Git con IA: criterio técnico"
        src="/interactive/git-con-ia.html"
        className="w-full rounded-none border-0 bg-slate-950 sm:rounded-b-[13px]"
        style={{ height: frameHeight }}
      />
    </div>
  );
}

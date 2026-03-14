export default function CourseDetailLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-3">
        <div className="h-4 w-20 rounded bg-white/[0.06]" />
        <div className="h-8 w-80 rounded bg-white/[0.06]" />
        <div className="h-4 w-full max-w-lg rounded bg-white/[0.06]" />
      </div>

      {/* Info pills */}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-7 w-24 rounded-full bg-white/[0.06]" />
        ))}
      </div>

      {/* Modules */}
      <div className="academy-card-dark rounded-xl sm:rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="h-5 w-24 rounded bg-white/[0.06]" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-xl border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-4 w-52 rounded bg-white/[0.06]" />
              <div className="w-5 h-5 rounded bg-white/[0.06]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

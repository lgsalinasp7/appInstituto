export default function CohortLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-32 rounded bg-white/[0.06]" />
        <div className="h-8 w-48 rounded bg-white/[0.06]" />
        <div className="h-4 w-72 rounded bg-white/[0.06]" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-28 rounded-xl bg-white/[0.06]" />
        ))}
      </div>

      {/* Progress bar skeleton */}
      <div className="academy-card-dark rounded-xl sm:rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="h-3 w-16 rounded bg-white/[0.06]" />
          <div className="h-4 w-8 rounded bg-white/[0.06]" />
        </div>
        <div className="h-2.5 rounded-full bg-white/[0.06]" />
      </div>

      {/* Sessions skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-64 rounded bg-white/[0.06]" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="academy-card-dark rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center gap-4"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white/[0.06]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 rounded bg-white/[0.06]" />
                <div className="h-3 w-32 rounded bg-white/[0.06]" />
              </div>
              <div className="h-6 w-16 rounded-full bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </div>

      {/* Modules grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="academy-card-dark rounded-xl sm:rounded-2xl p-5 sm:p-6 space-y-3">
            <div className="flex items-start justify-between">
              <div className="h-5 w-40 rounded bg-white/[0.06]" />
              <div className="h-5 w-16 rounded-full bg-white/[0.06]" />
            </div>
            <div className="h-3 w-32 rounded bg-white/[0.06]" />
            <div className="h-1.5 rounded-full bg-white/[0.06]" />
            <div className="h-3 w-48 rounded bg-white/[0.06]" />
          </div>
        ))}
      </div>
    </div>
  );
}

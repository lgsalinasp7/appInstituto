export default function DashboardLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded bg-white/[0.06]" />
          <div className="h-4 w-36 rounded bg-white/[0.06]" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="academy-card-dark rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 rounded bg-white/[0.06]" />
              <div className="w-8 h-8 rounded-lg bg-white/[0.06]" />
            </div>
            <div className="h-7 w-12 rounded bg-white/[0.06]" />
          </div>
        ))}
      </div>

      {/* Module progress */}
      <div className="academy-card-dark rounded-xl sm:rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="h-5 w-40 rounded bg-white/[0.06]" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-3 w-28 rounded bg-white/[0.06]" />
              <div className="flex-1 h-2 rounded-full bg-white/[0.06]" />
              <div className="h-3 w-8 rounded bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </div>

      {/* Two column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="academy-card-dark rounded-xl sm:rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="h-5 w-36 rounded bg-white/[0.06]" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06]">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06]" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-40 rounded bg-white/[0.06]" />
                <div className="h-3 w-28 rounded bg-white/[0.06]" />
              </div>
            </div>
          ))}
        </div>
        <div className="academy-card-dark rounded-xl sm:rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="h-5 w-24 rounded bg-white/[0.06]" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/[0.06]">
                <div className="w-8 h-8 rounded-full bg-white/[0.06]" />
                <div className="h-3 w-14 rounded bg-white/[0.06]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalendarLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-pulse">
      <div className="space-y-1">
        <div className="h-8 w-36 rounded bg-white/[0.06]" />
        <div className="h-4 w-64 rounded bg-white/[0.06]" />
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="academy-card-dark rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white/[0.06]" />
              <div className="h-3 w-16 rounded bg-white/[0.06]" />
            </div>
            <div className="h-7 w-8 rounded bg-white/[0.06]" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="academy-card-dark rounded-xl sm:rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-white/[0.06]" />
            <div className="h-6 w-32 rounded bg-white/[0.06]" />
            <div className="w-9 h-9 rounded-xl bg-white/[0.06]" />
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-4 rounded bg-white/[0.06]" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="min-h-[52px] rounded-xl bg-white/[0.03]" />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="academy-card-dark rounded-xl sm:rounded-2xl p-5 space-y-3">
            <div className="h-4 w-32 rounded bg-white/[0.06]" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-xl border border-white/[0.06] space-y-2">
                <div className="h-4 w-36 rounded bg-white/[0.06]" />
                <div className="h-3 w-28 rounded bg-white/[0.06]" />
              </div>
            ))}
          </div>
          <div className="academy-card-dark rounded-xl sm:rounded-2xl p-4 space-y-2">
            <div className="h-3 w-16 rounded bg-white/[0.06]" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white/[0.06]" />
                <div className="h-3 w-16 rounded bg-white/[0.06]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

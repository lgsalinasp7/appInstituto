export default function LeaderboardLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-pulse">
      <div className="space-y-1">
        <div className="h-8 w-40 rounded bg-white/[0.06]" />
        <div className="h-4 w-72 rounded bg-white/[0.06]" />
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="academy-card-dark rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white/[0.06]" />
              <div className="h-3 w-20 rounded bg-white/[0.06]" />
            </div>
            <div className="h-7 w-10 rounded bg-white/[0.06]" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="academy-card-dark rounded-xl sm:rounded-2xl flex flex-col items-center gap-2 p-4 pt-6">
            <div className="w-9 h-9 rounded-full bg-white/[0.06]" />
            <div className="h-4 w-6 rounded bg-white/[0.06]" />
            <div className="h-4 w-16 rounded bg-white/[0.06]" />
            <div className="h-3 w-10 rounded bg-white/[0.06]" />
          </div>
        ))}
      </div>

      <div className="academy-card-dark rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center gap-4">
        <div className="h-4 w-20 rounded bg-white/[0.06]" />
        <div className="w-9 h-9 rounded-full bg-white/[0.06]" />
        <div className="flex-1 space-y-1">
          <div className="h-4 w-32 rounded bg-white/[0.06]" />
          <div className="h-3 w-40 rounded bg-white/[0.06]" />
        </div>
        <div className="h-8 w-10 rounded bg-white/[0.06]" />
      </div>

      <div className="academy-card-dark rounded-xl sm:rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <div className="h-4 w-32 rounded bg-white/[0.06]" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3 border-b border-white/[0.04]">
            <div className="w-8 h-8 rounded-xl bg-white/[0.06]" />
            <div className="w-9 h-9 rounded-full bg-white/[0.06]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-28 rounded bg-white/[0.06]" />
              <div className="h-1.5 w-32 rounded-full bg-white/[0.06]" />
            </div>
            <div className="h-4 w-8 rounded bg-white/[0.06]" />
          </div>
        ))}
      </div>
    </div>
  );
}

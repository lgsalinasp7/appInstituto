export default function CoursesLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-9 w-36 rounded bg-white/[0.06]" />
        <div className="h-4 w-52 rounded bg-white/[0.06]" />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="academy-card-dark rounded-xl sm:rounded-2xl overflow-hidden">
            <div className="h-36 bg-white/[0.04]" />
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <div className="h-5 w-3/4 rounded bg-white/[0.06]" />
                <div className="h-3 w-full rounded bg-white/[0.06]" />
                <div className="h-3 w-5/6 rounded bg-white/[0.06]" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-16 rounded bg-white/[0.06]" />
                  <div className="h-3 w-8 rounded bg-white/[0.06]" />
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfileLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-pulse">
      {/* Title */}
      <div>
        <div className="h-8 w-56 bg-white/[0.06] rounded-lg" />
        <div className="h-4 w-80 bg-white/[0.04] rounded mt-2" />
      </div>

      {/* Profile Summary */}
      <div className="academy-card-dark rounded-2xl p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/[0.06]" />
            <div className="space-y-3">
              <div className="h-7 w-48 bg-white/[0.06] rounded-lg" />
              <div className="h-4 w-64 bg-white/[0.04] rounded" />
            </div>
          </div>
          <div className="w-24 h-24 rounded-full bg-white/[0.06]" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Timeline */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <div className="h-6 w-52 bg-white/[0.06] rounded-lg" />
            <div className="h-4 w-36 bg-white/[0.04] rounded" />
          </div>
          <div className="academy-card-dark rounded-2xl p-4 sm:p-6 lg:p-8 space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-5">
                <div className="w-8 h-8 rounded-full bg-white/[0.06] shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-40 bg-white/[0.04] rounded" />
                  <div className="h-5 w-3/4 bg-white/[0.06] rounded" />
                  <div className="h-3 w-full bg-white/[0.03] rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Metrics */}
          <div className="academy-card-dark rounded-2xl p-5 sm:p-6">
            <div className="h-4 w-36 bg-white/[0.04] rounded mb-5" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="academy-card-dark rounded-xl p-4 h-24">
                  <div className="h-7 w-16 bg-white/[0.06] rounded mb-3" />
                  <div className="h-3 w-20 bg-white/[0.04] rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="academy-card-dark rounded-2xl p-5 sm:p-6">
            <div className="h-4 w-40 bg-white/[0.04] rounded mb-5" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06]" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 bg-white/[0.06] rounded" />
                    <div className="h-3 w-20 bg-white/[0.04] rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Step */}
          <div className="rounded-2xl p-5 sm:p-6 border border-white/[0.06]" style={{ background: "rgba(8,145,178,0.03)" }}>
            <div className="h-5 w-28 bg-white/[0.06] rounded-full mb-4" />
            <div className="h-6 w-48 bg-white/[0.06] rounded mb-3" />
            <div className="h-3 w-full bg-white/[0.04] rounded mb-2" />
            <div className="h-3 w-3/4 bg-white/[0.04] rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

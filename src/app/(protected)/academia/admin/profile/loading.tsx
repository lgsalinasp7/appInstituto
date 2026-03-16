export default function AdminProfileLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-56 bg-white/[0.06] rounded-lg" />
        <div className="h-4 w-80 bg-white/[0.04] rounded mt-2" />
      </div>

      <div className="academy-card-dark rounded-2xl p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/[0.06]" />
            <div className="space-y-3">
              <div className="h-7 w-48 bg-white/[0.06] rounded-lg" />
              <div className="h-4 w-64 bg-white/[0.04] rounded" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-8 space-y-5">
          <div className="academy-card-dark rounded-2xl p-5 sm:p-6">
            <div className="h-4 w-36 bg-white/[0.04] rounded mb-5" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="academy-card-dark rounded-xl p-4 h-24">
                  <div className="h-7 w-16 bg-white/[0.06] rounded mb-3" />
                  <div className="h-3 w-20 bg-white/[0.04] rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="academy-card-dark rounded-2xl p-5 sm:p-6">
            <div className="h-4 w-24 bg-white/[0.04] rounded mb-4" />
            <div className="h-10 w-full bg-white/[0.06] rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

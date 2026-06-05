export default function Loading() {
  return (
    <div className="px-4 pt-6 pb-28 max-w-lg mx-auto space-y-5 animate-pulse">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-28 bg-stone/50 rounded-lg" />
          <div className="h-4 w-44 bg-linen rounded-md mt-1.5" />
        </div>
        <div className="w-9 h-9 bg-stone/50 rounded-xl" />
      </div>

      {/* 2Ã—2 metric grid */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-linen border border-stone/40 rounded-xl p-4 h-[88px]" />
        ))}
      </div>

      {/* Stats preview section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="h-3.5 w-10 bg-linen rounded" />
          <div className="h-3 w-14 bg-linen rounded" />
        </div>
        <div className="space-y-3">
          <div className="bg-linen border border-stone/40 rounded-2xl p-4 h-[140px]" />
          <div className="bg-linen border border-stone/40 rounded-2xl p-4 h-[148px]" />
          <div className="bg-linen border border-stone/40 rounded-2xl p-4 h-[100px]" />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="h-3.5 w-28 bg-linen rounded" />
          <div className="h-3 w-12 bg-linen rounded" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-linen border border-stone/40 rounded-xl">
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-36 bg-stone/50 rounded" />
                <div className="h-3 w-24 bg-linen rounded" />
              </div>
              <div className="w-4 h-4 bg-stone/50 rounded" />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}


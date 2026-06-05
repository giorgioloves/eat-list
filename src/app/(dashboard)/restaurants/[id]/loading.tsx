export default function Loading() {
  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-stone/50 rounded-lg" />
          <div className="h-7 w-40 bg-stone/50 rounded-lg" />
        </div>
        <div className="h-8 w-14 bg-stone/50 rounded-lg" />
      </div>
      <div className="bg-linen border border-stone/50 rounded-2xl p-5 mb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="h-7 w-48 bg-stone/50 rounded mb-2" />
            <div className="h-4 w-24 bg-linen rounded mb-2" />
            <div className="h-4 w-36 bg-linen rounded" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="h-6 w-8 bg-stone/50 rounded" />
            <div className="h-4 w-16 bg-linen rounded" />
          </div>
        </div>
        <div className="h-5 w-20 bg-stone/50 rounded-full" />
      </div>
      <div className="bg-linen border border-stone/50 rounded-2xl p-5">
        <div className="h-4 w-24 bg-stone/50 rounded mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-stone/50 last:border-0">
            <div className="h-4 w-24 bg-stone/50 rounded" />
            <div className="h-4 w-16 bg-linen rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

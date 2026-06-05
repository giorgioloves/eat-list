export default function Loading() {
  return (
    <div className="px-4 pt-8 pb-28 max-w-lg mx-auto space-y-4 animate-pulse">

      {/* Header */}
      <div>
        <div className="h-9 w-16 bg-stone/50 rounded-xl" />
        <div className="h-4 w-52 bg-linen rounded-lg mt-2" />
      </div>

      {/* Segmented control */}
      <div className="h-[60px] bg-linen border border-stone/40 rounded-xl" />

      {/* Hero card */}
      <div className="bg-linen border border-stone/40 rounded-2xl p-5 h-32" />

      {/* 2Ã—2 metric grid */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-linen border border-stone/40 rounded-2xl p-4 h-24" />
        ))}
      </div>

      {/* Rating chart */}
      <div className="bg-linen border border-stone/40 rounded-2xl p-5 h-44" />

      {/* Cuisine list */}
      <div className="bg-linen border border-stone/40 rounded-2xl p-5 h-56" />

      {/* Ranked lists */}
      <div className="bg-linen border border-stone/40 rounded-2xl h-64" />

    </div>
  )
}


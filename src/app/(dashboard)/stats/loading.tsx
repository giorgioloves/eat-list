export default function Loading() {
  return (
    <div className="px-4 pt-8 pb-28 max-w-lg mx-auto space-y-4 animate-pulse">

      {/* Header */}
      <div>
        <div className="h-9 w-16 bg-espresso-700 rounded-xl" />
        <div className="h-4 w-52 bg-espresso-800 rounded-lg mt-2" />
      </div>

      {/* Segmented control */}
      <div className="h-[60px] bg-espresso-800 border border-espresso-700/60 rounded-xl" />

      {/* Hero card */}
      <div className="bg-espresso-800 border border-espresso-700/60 rounded-2xl p-5 h-32" />

      {/* 2×2 metric grid */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-espresso-800 border border-espresso-700/60 rounded-2xl p-4 h-24" />
        ))}
      </div>

      {/* Rating chart */}
      <div className="bg-espresso-800 border border-espresso-700/60 rounded-2xl p-5 h-44" />

      {/* Cuisine list */}
      <div className="bg-espresso-800 border border-espresso-700/60 rounded-2xl p-5 h-56" />

      {/* Ranked lists */}
      <div className="bg-espresso-800 border border-espresso-700/60 rounded-2xl h-64" />

    </div>
  )
}

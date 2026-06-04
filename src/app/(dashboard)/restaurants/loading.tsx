export default function Loading() {
  return (
    <div className="px-4 pt-8 pb-28 max-w-lg mx-auto animate-pulse">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="h-9 w-44 bg-espresso-700 rounded-xl" />
          <div className="h-4 w-20 bg-espresso-800 rounded-lg mt-2" />
        </div>
        <div className="w-12 h-12 bg-espresso-700 rounded-full flex-shrink-0" />
      </div>

      {/* Search + filter + sort row */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 h-11 bg-espresso-800 border border-espresso-700/60 rounded-xl" />
        <div className="w-11 h-11 bg-espresso-800 border border-espresso-700/60 rounded-xl flex-shrink-0" />
        <div className="w-28 h-11 bg-espresso-800 border border-espresso-700/60 rounded-xl flex-shrink-0" />
      </div>

      {/* Result count */}
      <div className="h-4 w-32 bg-espresso-800 rounded mb-4" />

      {/* Cards */}
      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3.5 p-4 bg-espresso-800 border border-espresso-700/60 rounded-2xl">
            <div className="w-11 h-11 rounded-full bg-espresso-700 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="h-4 w-36 bg-espresso-700 rounded-lg" />
                <div className="h-6 w-20 bg-espresso-700 rounded-full flex-shrink-0" />
              </div>
              <div className="h-3.5 w-24 bg-espresso-700/60 rounded mb-2" />
              <div className="h-3 w-32 bg-espresso-700/40 rounded" />
            </div>
            <div className="w-4 h-4 bg-espresso-700 rounded flex-shrink-0 mt-1" />
          </div>
        ))}
      </div>
    </div>
  )
}

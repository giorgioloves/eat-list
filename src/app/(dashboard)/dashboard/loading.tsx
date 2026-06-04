export default function Loading() {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-7 w-36 bg-espresso-700 rounded-lg" />
          <div className="h-4 w-44 bg-espresso-800 rounded mt-1.5" />
        </div>
        <div className="h-9 w-16 bg-espresso-700 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-espresso-800 border border-espresso-700 rounded-xl p-4">
            <div className="h-3 w-16 bg-espresso-700 rounded mb-3" />
            <div className="h-8 w-10 bg-espresso-700 rounded" />
          </div>
        ))}
      </div>
      <div className="h-4 w-28 bg-espresso-800 rounded mb-3" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-espresso-800 border border-espresso-700 rounded-xl">
            <div className="w-10 h-10 bg-espresso-700 rounded-lg flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 w-40 bg-espresso-700 rounded mb-2" />
              <div className="h-3 w-24 bg-espresso-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-7 w-32 bg-espresso-700 rounded-lg" />
          <div className="h-4 w-16 bg-espresso-800 rounded mt-1.5" />
        </div>
        <div className="h-9 w-16 bg-espresso-700 rounded-lg" />
      </div>
      <div className="h-10 w-full bg-espresso-800 border border-espresso-700 rounded-xl mb-3" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 bg-espresso-800 border border-espresso-700 rounded-xl">
            <div className="flex-1">
              <div className="h-4 w-48 bg-espresso-700 rounded mb-2" />
              <div className="flex gap-2">
                <div className="h-3 w-16 bg-espresso-700 rounded" />
                <div className="h-3 w-20 bg-espresso-800 rounded" />
              </div>
            </div>
            <div className="h-6 w-6 bg-espresso-700 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

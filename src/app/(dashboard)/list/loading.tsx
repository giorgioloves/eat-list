export default function Loading() {
  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto animate-pulse">
      <div className="mb-6">
        <div className="h-7 w-20 bg-espresso-700 rounded-lg" />
        <div className="h-4 w-40 bg-espresso-800 rounded mt-1.5" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-espresso-800 border border-espresso-700 rounded-2xl p-5">
            <div className="h-4 w-24 bg-espresso-700 rounded mb-3" />
            <div className="h-10 w-full bg-espresso-700 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

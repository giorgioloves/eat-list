export default function Loading() {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-pulse">
      <div className="mb-6">
        <div className="h-7 w-14 bg-espresso-700 rounded-lg" />
        <div className="h-4 w-48 bg-espresso-800 rounded mt-1.5" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-espresso-800 border border-espresso-700 rounded-xl p-4">
            <div className="h-3 w-16 bg-espresso-700 rounded mb-3" />
            <div className="h-8 w-12 bg-espresso-700 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-espresso-800 border border-espresso-700 rounded-2xl p-5 h-52" />
        ))}
      </div>
    </div>
  )
}

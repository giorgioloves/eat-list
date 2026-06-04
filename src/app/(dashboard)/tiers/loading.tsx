export default function Loading() {
  return (
    <div className="p-4 sm:p-6 animate-pulse">
      <div className="mb-4">
        <div className="h-7 w-10 bg-espresso-700 rounded-lg" />
        <div className="h-4 w-52 bg-espresso-800 rounded mt-1.5" />
      </div>
      <div className="space-y-3">
        {['S', 'A', 'B', 'C', 'D', 'F'].map((tier) => (
          <div key={tier} className="flex gap-3 items-stretch">
            <div className="w-12 bg-espresso-800 border border-espresso-700 rounded-xl flex items-center justify-center">
              <span className="text-sm font-bold text-espresso-600">{tier}</span>
            </div>
            <div className="flex-1 min-h-[4rem] bg-espresso-800 border border-espresso-700 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}

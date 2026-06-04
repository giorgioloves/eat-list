export default function Loading() {
  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto animate-pulse">
      <div className="mb-6">
        <div className="h-7 w-32 bg-espresso-700 rounded-lg" />
        <div className="h-4 w-48 bg-espresso-800 rounded mt-1.5" />
      </div>
      <div className="bg-espresso-800 border border-espresso-700 rounded-2xl p-6 text-center">
        <div className="w-16 h-16 bg-espresso-700 rounded-2xl mx-auto mb-4" />
        <div className="h-6 w-40 bg-espresso-700 rounded mx-auto mb-2" />
        <div className="h-4 w-56 bg-espresso-800 rounded mx-auto" />
      </div>
    </div>
  )
}

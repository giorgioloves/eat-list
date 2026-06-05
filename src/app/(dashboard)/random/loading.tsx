export default function Loading() {
  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto animate-pulse">
      <div className="mb-6">
        <div className="h-7 w-32 bg-stone/50 rounded-lg" />
        <div className="h-4 w-48 bg-linen rounded mt-1.5" />
      </div>
      <div className="bg-linen border border-stone/50 rounded-2xl p-6 text-center">
        <div className="w-16 h-16 bg-stone/50 rounded-2xl mx-auto mb-4" />
        <div className="h-6 w-40 bg-stone/50 rounded mx-auto mb-2" />
        <div className="h-4 w-56 bg-linen rounded mx-auto" />
      </div>
    </div>
  )
}


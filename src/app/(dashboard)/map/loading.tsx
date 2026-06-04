export default function Loading() {
  return (
    <div className="flex flex-col h-[100dvh] lg:h-screen p-4 sm:p-6 animate-pulse">
      <div className="mb-4 flex-shrink-0">
        <div className="h-7 w-12 bg-espresso-700 rounded-lg" />
        <div className="h-4 w-40 bg-espresso-800 rounded mt-1.5" />
      </div>
      <div className="flex-1 min-h-0 bg-espresso-800 border border-espresso-700 rounded-2xl" />
    </div>
  )
}

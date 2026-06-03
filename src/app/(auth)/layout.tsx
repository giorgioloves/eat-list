import { UtensilsCrossed } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-espresso-900 flex flex-col">
      <div className="flex items-center justify-center flex-1 px-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-gold-500 rounded-2xl flex items-center justify-center mb-4">
              <UtensilsCrossed className="w-6 h-6 text-espresso-900" />
            </div>
            <h1 className="text-2xl font-bold text-espresso-50">Eat List</h1>
            <p className="text-espresso-300 text-sm mt-1">Your shared restaurant tracker</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

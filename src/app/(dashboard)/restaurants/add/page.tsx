import { RestaurantForm } from '@/components/restaurants/restaurant-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AddRestaurantPage() {
  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/restaurants"
          className="p-1.5 rounded-lg text-espresso-300 hover:text-espresso-50 hover:bg-espresso-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-espresso-50">Add Restaurant</h1>
          <p className="text-sm text-espresso-300 mt-0.5">Add a new place to your list</p>
        </div>
      </div>

      <div className="bg-espresso-800 border border-espresso-700 rounded-2xl p-4 sm:p-6">
        <RestaurantForm />
      </div>
    </div>
  )
}

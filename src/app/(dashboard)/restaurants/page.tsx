'use client'

import Link from 'next/link'
import { Plus, UtensilsCrossed } from 'lucide-react'
import RestaurantListClient from './list-client'
import { useRestaurants } from '@/contexts/restaurants'

export default function RestaurantsPage() {
  const { restaurants, loading } = useRestaurants()

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-espresso-50">Restaurants</h1>
          {!loading && <p className="text-sm text-espresso-300 mt-0.5">{restaurants.length} total</p>}
        </div>
        <Link
          href="/restaurants/add"
          className="flex items-center gap-1.5 bg-gold-500 hover:bg-gold-400 text-espresso-900 font-semibold text-sm px-3 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add
        </Link>
      </div>

      {!loading && restaurants.length === 0 ? (
        <div className="text-center py-16 bg-espresso-800 border border-espresso-700 rounded-2xl">
          <UtensilsCrossed className="w-12 h-12 text-espresso-500 mx-auto mb-3" />
          <p className="text-espresso-200 font-medium">No restaurants yet</p>
          <p className="text-espresso-400 text-sm mt-1">Add your first restaurant to start building your list</p>
          <Link
            href="/restaurants/add"
            className="inline-flex items-center gap-2 mt-4 bg-gold-500 hover:bg-gold-400 text-espresso-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Restaurant
          </Link>
        </div>
      ) : (
        <RestaurantListClient restaurants={restaurants} />
      )}
    </div>
  )
}

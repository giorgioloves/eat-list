'use client'

import Link from 'next/link'
import { Plus, UtensilsCrossed } from 'lucide-react'
import RestaurantListClient from './list-client'
import { useRestaurants } from '@/contexts/restaurants'

export default function RestaurantsPage() {
  const { restaurants, loading } = useRestaurants()

  return (
    <div className="px-4 pt-8 pb-28 max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-espresso-50">Restaurants</h1>
          {!loading && (
            <p className="text-sm text-espresso-400 mt-1">
              {restaurants.length} {restaurants.length === 1 ? 'place' : 'places'}
            </p>
          )}
        </div>
        <Link
          href="/restaurants/add"
          className="w-12 h-12 rounded-full flex items-center justify-center bg-gold-500/10 border border-gold-500/35 hover:bg-gold-500/20 active:bg-gold-500/25 transition-colors flex-shrink-0"
          aria-label="Add restaurant"
        >
          <Plus className="w-5 h-5 text-gold-400" />
        </Link>
      </div>

      {/* Empty state */}
      {!loading && restaurants.length === 0 ? (
        <div className="text-center py-16 bg-espresso-800 border border-espresso-700/60 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-espresso-700/60 flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-7 h-7 text-espresso-500" />
          </div>
          <p className="text-espresso-100 font-semibold">No restaurants yet</p>
          <p className="text-espresso-400 text-sm mt-1.5 px-8">
            Add your first restaurant to start building your list
          </p>
          <Link
            href="/restaurants/add"
            className="inline-flex items-center gap-2 mt-5 bg-gold-500/10 border border-gold-500/35 text-gold-400 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-gold-500/20 transition-colors"
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

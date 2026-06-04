'use client'

import { TierBoardDynamic } from './tier-board-dynamic'
import { useRestaurants } from '@/contexts/restaurants'

export default function TiersPage() {
  const { restaurants } = useRestaurants()

  const visited = restaurants.filter((r) => r.status === 'visited')

  return (
    <div className="tier-page p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-espresso-50">Tier List</h1>
        <p className="text-sm text-espresso-300 mt-0.5">Drag restaurants between tiers · saves automatically</p>
      </div>

      {visited.length === 0 ? (
        <div className="text-center py-16 bg-espresso-800 border border-espresso-700 rounded-2xl">
          <p className="text-espresso-300">Add some restaurants first to build your tier list</p>
        </div>
      ) : (
        <TierBoardDynamic restaurants={visited} />
      )}
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { RestaurantCard } from '@/components/restaurants/restaurant-card'
import { RestaurantFilters } from '@/components/restaurants/restaurant-filters'
import type { Restaurant, RestaurantFilters as Filters, Tier } from '@/types'

const DEFAULT_FILTERS: Filters = {
  search: '',
  status: [],
  cuisine: [],
  suburb: [],
  tier: [],
  sortBy: 'newest',
}

const STATE_TO_CITY: Record<string, { label: string; color: string }> = {
  WA:  { label: 'Perth',     color: '#59D67A' },
  VIC: { label: 'Melbourne', color: '#B983FF' },
  NSW: { label: 'Sydney',    color: '#5FA8FF' },
  QLD: { label: 'Brisbane',  color: '#E8A87C' },
  SA:  { label: 'Adelaide',  color: '#FF8FAB' },
  TAS: { label: 'Hobart',    color: '#7AB8F5' },
  ACT: { label: 'Canberra',  color: '#7A8A6B' },
  NT:  { label: 'Darwin',    color: '#FF9B54' },
}

export default function RestaurantListClient({ restaurants }: { restaurants: Restaurant[] }) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [selectedState, setSelectedState] = useState<string>('')

  const suburbs = useMemo(
    () => [...new Set(restaurants.map((r) => r.suburb).filter(Boolean) as string[])].sort(),
    [restaurants]
  )

  const availableCities = useMemo(() => {
    const states = new Set(restaurants.map((r) => r.state).filter(Boolean) as string[])
    return Object.entries(STATE_TO_CITY)
      .filter(([state]) => states.has(state))
      .map(([state, { label, color }]) => ({ state, label, color }))
  }, [restaurants])

  const filtered = useMemo(() => {
    let result = [...restaurants]

    if (selectedState) {
      result = result.filter((r) => r.state === selectedState)
    }

    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine?.toLowerCase().includes(q) ||
          r.suburb?.toLowerCase().includes(q) ||
          r.notes?.toLowerCase().includes(q) ||
          r.city?.toLowerCase().includes(q)
      )
    }

    if (filters.status.length > 0) {
      result = result.filter((r) => filters.status.includes(r.status))
    }

    if (filters.cuisine.length > 0) {
      result = result.filter((r) => r.cuisine && filters.cuisine.includes(r.cuisine))
    }

    if (filters.suburb.length > 0) {
      result = result.filter((r) => r.suburb && filters.suburb.includes(r.suburb))
    }

    if (filters.tier.length > 0) {
      result = result.filter((r) => r.tier && filters.tier.includes(r.tier as Tier))
    }

    const tierOrder = { S: 0, A: 1, B: 2, C: 3, D: 4, E: 5, F: 6 }

    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'rating':
          return (b.rating ?? -1) - (a.rating ?? -1)
        case 'most_visited':
          return b.visit_count - a.visit_count
        case 'last_visited':
          if (!a.last_visit_date) return 1
          if (!b.last_visit_date) return -1
          return new Date(b.last_visit_date).getTime() - new Date(a.last_visit_date).getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        case 'tier':
          if (!a.tier && !b.tier) return 0
          if (!a.tier) return 1
          if (!b.tier) return -1
          return tierOrder[a.tier] - tierOrder[b.tier]
        default:
          return 0
      }
    })

    return result
  }, [restaurants, filters, selectedState])

  return (
    <div className="space-y-4">
      <RestaurantFilters filters={filters} onChange={setFilters} suburbs={suburbs} />

      {availableCities.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {availableCities.map((c) => (
            <button
              key={c.state}
              onClick={() => setSelectedState((prev) => prev === c.state ? '' : c.state)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
              style={
                selectedState === c.state
                  ? {
                      backgroundColor: `${c.color}22`,
                      borderColor: `${c.color}66`,
                      color: c.color,
                    }
                  : {
                      backgroundColor: 'transparent',
                      borderColor: `${c.color}44`,
                      color: `${c.color}CC`,
                    }
              }
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-espresso-400 text-sm">
          No restaurants match your filters
        </div>
      ) : (
        <>
          <p className="text-xs text-espresso-400">
            Showing {filtered.length} of {restaurants.length}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

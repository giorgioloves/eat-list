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

const CAPITAL_CITIES = [
  { label: 'Sydney',    states: ['NSW', 'New South Wales', 'Sydney'],                    color: '#5FA8FF' },
  { label: 'Melbourne', states: ['VIC', 'Victoria', 'Melbourne'],                        color: '#B983FF' },
  { label: 'Brisbane',  states: ['QLD', 'Queensland', 'Brisbane'],                       color: '#E8A87C' },
  { label: 'Perth',     states: ['WA', 'Western Australia', 'Perth'],                    color: '#59D67A' },
  { label: 'Adelaide',  states: ['SA', 'South Australia', 'Adelaide'],                   color: '#FF8FAB' },
  { label: 'Hobart',    states: ['TAS', 'Tasmania', 'Hobart'],                           color: '#7AB8F5' },
  { label: 'Canberra',  states: ['ACT', 'Australian Capital Territory', 'Canberra'],     color: '#7A8A6B' },
  { label: 'Darwin',    states: ['NT', 'Northern Territory', 'Darwin'],                  color: '#FF9B54' },
]

export default function RestaurantListClient({ restaurants }: { restaurants: Restaurant[] }) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [selectedCity, setSelectedCity] = useState<string>('')

  const suburbs = useMemo(
    () => [...new Set(restaurants.map((r) => r.suburb).filter(Boolean) as string[])].sort(),
    [restaurants]
  )

  const availableCities = useMemo(
    () => CAPITAL_CITIES.filter((c) =>
      restaurants.some((r) => r.city && c.states.some((s) => r.city!.includes(s)))
    ),
    [restaurants]
  )

  const filtered = useMemo(() => {
    let result = [...restaurants]

    if (selectedCity) {
      const entry = CAPITAL_CITIES.find((c) => c.label === selectedCity)
      if (entry) result = result.filter((r) => r.city && entry.states.some((s) => r.city!.includes(s)))
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
  }, [restaurants, filters, selectedCity])

  return (
    <div className="space-y-4">
      <RestaurantFilters filters={filters} onChange={setFilters} suburbs={suburbs} />

      {availableCities.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {availableCities.map((c) => (
            <button
              key={c.label}
              onClick={() => setSelectedCity((prev) => prev === c.label ? '' : c.label)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
              style={
                selectedCity === c.label
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

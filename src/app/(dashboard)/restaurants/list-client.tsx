'use client'

import { useState, useMemo, useEffect } from 'react'
import { RestaurantCard } from '@/components/restaurants/restaurant-card'
import { RestaurantFilters } from '@/components/restaurants/restaurant-filters'
import type { Restaurant, RestaurantFilters as Filters, Tier } from '@/types'
import { TIERS } from '@/types'

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

function applyFilters(
  list: Restaurant[],
  search: string,
  status: string[],
  cuisine: string[],
  suburb: string[],
  tier: string[],
  state: string,
): Restaurant[] {
  let r = list
  if (state) r = r.filter(x => x.state === state)
  if (search) {
    const q = search.toLowerCase()
    r = r.filter(x =>
      x.name.toLowerCase().includes(q) ||
      x.cuisine?.toLowerCase().includes(q) ||
      x.suburb?.toLowerCase().includes(q) ||
      x.city?.toLowerCase().includes(q)
    )
  }
  if (status.length) r = r.filter(x => status.includes(x.status))
  if (cuisine.length) r = r.filter(x => x.cuisine != null && cuisine.includes(x.cuisine))
  if (suburb.length) r = r.filter(x => x.suburb != null && suburb.includes(x.suburb))
  if (tier.length) r = r.filter(x => x.tier != null && tier.includes(x.tier as Tier))
  return r
}

export default function RestaurantListClient({ restaurants }: { restaurants: Restaurant[] }) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [selectedState, setSelectedState] = useState<string>('')

  const { search, status, cuisine, suburb, tier } = filters

  const baseNoState = useMemo(() =>
    applyFilters(restaurants, search, status, cuisine, suburb, tier, ''),
    [restaurants, search, status, cuisine, suburb, tier]
  )
  const baseNoCuisine = useMemo(() =>
    applyFilters(restaurants, search, status, [], suburb, tier, selectedState),
    [restaurants, search, status, suburb, tier, selectedState]
  )
  const baseNoSuburb = useMemo(() =>
    applyFilters(restaurants, search, status, cuisine, [], tier, selectedState),
    [restaurants, search, status, cuisine, tier, selectedState]
  )
  const baseNoTier = useMemo(() =>
    applyFilters(restaurants, search, status, cuisine, suburb, [], selectedState),
    [restaurants, search, status, cuisine, suburb, selectedState]
  )

  const availableCities = useMemo(() => {
    const states = new Set(baseNoState.map(r => r.state).filter(Boolean) as string[])
    return Object.entries(STATE_TO_CITY)
      .filter(([s]) => states.has(s))
      .map(([st, { label, color }]) => ({ state: st, label, color }))
  }, [baseNoState])

  const availableSuburbs = useMemo(() =>
    [...new Set(baseNoSuburb.map(r => r.suburb).filter(Boolean) as string[])].sort(),
    [baseNoSuburb]
  )
  const availableCuisines = useMemo(() =>
    [...new Set(baseNoCuisine.map(r => r.cuisine).filter(Boolean) as string[])].sort(),
    [baseNoCuisine]
  )
  const availableTiers = useMemo(() =>
    TIERS.filter(t => baseNoTier.some(r => r.tier === t)),
    [baseNoTier]
  )

  useEffect(() => {
    setFilters(prev => {
      const newSuburb = prev.suburb.filter(s => availableSuburbs.includes(s))
      const newCuisine = prev.cuisine.filter(c => availableCuisines.includes(c))
      const newTier = prev.tier.filter(t => availableTiers.includes(t as Tier))
      if (
        newSuburb.length === prev.suburb.length &&
        newCuisine.length === prev.cuisine.length &&
        newTier.length === prev.tier.length
      ) return prev
      return { ...prev, suburb: newSuburb, cuisine: newCuisine, tier: newTier }
    })
    setSelectedState(prev => (!prev || availableCities.some(c => c.state === prev)) ? prev : '')
  }, [availableSuburbs, availableCuisines, availableTiers, availableCities])

  const filtered = useMemo(() => {
    const result = [...applyFilters(restaurants, search, status, cuisine, suburb, tier, selectedState)]
    const tierOrder: Record<string, number> = { S: 0, A: 1, B: 2, C: 3, D: 4, E: 5, F: 6 }
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':       return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'rating':       return (b.rating ?? -1) - (a.rating ?? -1)
        case 'most_visited': return b.visit_count - a.visit_count
        case 'last_visited':
          if (!a.last_visit_date) return 1
          if (!b.last_visit_date) return -1
          return new Date(b.last_visit_date).getTime() - new Date(a.last_visit_date).getTime()
        case 'name':         return a.name.localeCompare(b.name)
        case 'tier':
          if (!a.tier && !b.tier) return 0
          if (!a.tier) return 1
          if (!b.tier) return -1
          return tierOrder[a.tier] - tierOrder[b.tier]
        default:             return 0
      }
    })
    return result
  }, [restaurants, filters, selectedState, search, status, cuisine, suburb, tier])

  const hasActiveFilters =
    filters.search !== '' ||
    filters.status.length > 0 ||
    filters.cuisine.length > 0 ||
    filters.suburb.length > 0 ||
    filters.tier.length > 0 ||
    selectedState !== ''

  function clearAll() {
    setFilters(DEFAULT_FILTERS)
    setSelectedState('')
  }

  return (
    <div className="space-y-4">

      {/* Search · Filter · Sort */}
      <RestaurantFilters
        filters={filters}
        onChange={setFilters}
        suburbs={availableSuburbs}
        cuisines={availableCuisines}
        tiers={availableTiers}
      />

      {/* City chips — horizontal scroll, breaks out of parent px-4 */}
      {availableCities.length > 0 && (
        <div className="-mx-4 px-4 overflow-x-auto scrollbar-none">
          <div className="flex gap-2 pb-0.5">
            {availableCities.map(c => (
              <button
                key={c.state}
                onClick={() => setSelectedState(prev => prev === c.state ? '' : c.state)}
                className="h-10 px-4 rounded-full text-sm font-semibold border transition-all whitespace-nowrap flex-shrink-0 min-w-[44px]"
                style={
                  selectedState === c.state
                    ? { backgroundColor: `${c.color}22`, borderColor: `${c.color}70`, color: c.color }
                    : { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.45)' }
                }
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result count + clear */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-espresso-500">
          {filtered.length === restaurants.length
            ? `${restaurants.length} restaurants`
            : `${filtered.length} of ${restaurants.length}`}
        </p>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-sm font-semibold text-gold-400 hover:text-gold-300 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-espresso-500 text-sm">
          No restaurants match your filters
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      )}
    </div>
  )
}

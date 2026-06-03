'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CUISINES, TIERS, STATUS_LABELS } from '@/types'
import type { RestaurantFilters, RestaurantStatus, Tier } from '@/types'

interface FiltersProps {
  filters: RestaurantFilters
  onChange: (filters: RestaurantFilters) => void
  suburbs: string[]
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'most_visited', label: 'Most Visited' },
  { value: 'last_visited', label: 'Last Visited' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'tier', label: 'Tier' },
]

const STATUSES: RestaurantStatus[] = ['want_to_try', 'visited']

export function RestaurantFilters({ filters, onChange, suburbs }: FiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  function toggle<T extends string>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]
  }

  const activeCount =
    filters.status.length +
    filters.cuisine.length +
    filters.suburb.length +
    filters.tier.length

  function clearAll() {
    onChange({ ...filters, status: [], cuisine: [], suburb: [], tier: [] })
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso-400 pointer-events-none" />
          <input
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search by name, cuisine, suburb…"
            className="w-full bg-espresso-800 border border-espresso-600 rounded-lg pl-9 pr-3 py-2 text-sm text-espresso-50 placeholder-espresso-400
              focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors',
            showFilters || activeCount > 0
              ? 'bg-gold-500/10 text-gold-400 border-gold-500/30'
              : 'bg-espresso-800 text-espresso-300 border-espresso-600 hover:text-espresso-100 hover:border-espresso-500'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeCount > 0 && <span className="text-xs font-bold">{activeCount}</span>}
        </button>
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value as RestaurantFilters['sortBy'] })}
          className="bg-espresso-800 border border-espresso-600 rounded-lg px-2 py-2 text-sm text-espresso-200 focus:outline-none focus:ring-1 focus:ring-gold-500 appearance-none cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-espresso-800">{o.label}</option>
          ))}
        </select>
      </div>

      {showFilters && (
        <div className="bg-espresso-800 border border-espresso-700 rounded-xl p-4 space-y-4">
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 text-xs text-espresso-300 hover:text-gold-400 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear all filters
            </button>
          )}

          <FilterSection label="Status">
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <FilterChip
                  key={s}
                  label={STATUS_LABELS[s]}
                  active={filters.status.includes(s)}
                  onClick={() => onChange({ ...filters, status: toggle(filters.status, s) })}
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection label="Tier">
            <div className="flex flex-wrap gap-1.5">
              {TIERS.map((t) => (
                <FilterChip
                  key={t}
                  label={t}
                  active={filters.tier.includes(t)}
                  onClick={() => onChange({ ...filters, tier: toggle(filters.tier, t) })}
                />
              ))}
            </div>
          </FilterSection>

          {suburbs.length > 0 && (
            <FilterSection label="Suburb">
              <div className="flex flex-wrap gap-1.5">
                {suburbs.map((s) => (
                  <FilterChip
                    key={s}
                    label={s}
                    active={filters.suburb.includes(s)}
                    onClick={() => onChange({ ...filters, suburb: toggle(filters.suburb, s) })}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          <FilterSection label="Cuisine">
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {CUISINES.map((c) => (
                <FilterChip
                  key={c}
                  label={c}
                  active={filters.cuisine.includes(c)}
                  onClick={() => onChange({ ...filters, cuisine: toggle(filters.cuisine, c) })}
                />
              ))}
            </div>
          </FilterSection>
        </div>
      )}
    </div>
  )
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-espresso-300 uppercase tracking-wider mb-2">{label}</p>
      {children}
    </div>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-xs px-2.5 py-1 rounded-full border transition-all',
        active
          ? 'bg-gold-500/20 text-gold-400 border-gold-500/40'
          : 'bg-espresso-700 text-espresso-300 border-espresso-600 hover:border-espresso-500 hover:text-espresso-100'
      )}
    >
      {label}
    </button>
  )
}

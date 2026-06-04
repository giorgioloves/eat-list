'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUS_LABELS } from '@/types'
import type { RestaurantFilters, RestaurantStatus, Tier } from '@/types'

interface FiltersProps {
  filters: RestaurantFilters
  onChange: (filters: RestaurantFilters) => void
  suburbs: string[]
  cuisines: string[]
  tiers: Tier[]
}

const SORT_OPTIONS = [
  { value: 'newest',       label: 'Newest'       },
  { value: 'rating',       label: 'Top Rated'    },
  { value: 'most_visited', label: 'Most Visited' },
  { value: 'last_visited', label: 'Last Visited' },
  { value: 'name',         label: 'Name A–Z'     },
  { value: 'tier',         label: 'Tier'         },
]

const STATUSES: RestaurantStatus[] = ['want_to_try', 'visited']

export function RestaurantFilters({ filters, onChange, suburbs, cuisines, tiers }: FiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  function toggle<T extends string>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
  }

  const activeCount =
    filters.status.length +
    filters.cuisine.length +
    filters.suburb.length +
    filters.tier.length

  function clearFacets() {
    onChange({ ...filters, status: [], cuisine: [], suburb: [], tier: [] })
  }

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === filters.sortBy)?.label ?? 'Sort'

  return (
    <div className="space-y-3">

      {/* ── Search · Filter · Sort row ── */}
      <div className="flex items-center gap-2">

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso-500 pointer-events-none" />
          <input
            value={filters.search}
            onChange={e => onChange({ ...filters, search: e.target.value })}
            placeholder="Search restaurants…"
            className="w-full h-11 bg-espresso-800 border border-espresso-700/60 rounded-xl pl-9 pr-3 text-sm text-espresso-50 placeholder-espresso-500
              focus:outline-none focus:ring-1 focus:ring-gold-500/40 focus:border-gold-500/50 transition-colors"
          />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'relative w-11 h-11 flex items-center justify-center rounded-xl border transition-colors flex-shrink-0',
            showFilters || activeCount > 0
              ? 'bg-gold-500/10 text-gold-400 border-gold-500/40'
              : 'bg-espresso-800 text-espresso-400 border-espresso-700/60 hover:text-espresso-200 hover:border-espresso-600'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gold-500 text-espresso-900 text-[9px] font-black rounded-full flex items-center justify-center leading-none">
              {activeCount}
            </span>
          )}
        </button>

        {/* Sort pill */}
        <div className="relative flex-shrink-0">
          <div className="flex items-center gap-1.5 h-11 px-3 bg-espresso-800 border border-espresso-700/60 rounded-xl pointer-events-none select-none">
            <span className="text-sm text-espresso-200 font-medium whitespace-nowrap">{currentSortLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-espresso-500" />
          </div>
          <select
            value={filters.sortBy}
            onChange={e => onChange({ ...filters, sortBy: e.target.value as RestaurantFilters['sortBy'] })}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <div className="bg-espresso-800 border border-espresso-700/60 rounded-2xl p-4 space-y-4">
          {activeCount > 0 && (
            <button
              onClick={clearFacets}
              className="flex items-center gap-1.5 text-xs text-espresso-400 hover:text-gold-400 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear filters
            </button>
          )}

          <FilterSection label="Status">
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map(s => (
                <FilterChip
                  key={s}
                  label={STATUS_LABELS[s]}
                  active={filters.status.includes(s)}
                  onClick={() => onChange({ ...filters, status: toggle(filters.status, s) })}
                />
              ))}
            </div>
          </FilterSection>

          {tiers.length > 0 && (
            <FilterSection label="Tier">
              <div className="flex flex-wrap gap-1.5">
                {tiers.map(t => (
                  <FilterChip
                    key={t}
                    label={t}
                    active={filters.tier.includes(t)}
                    onClick={() => onChange({ ...filters, tier: toggle(filters.tier, t) })}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {suburbs.length > 0 && (
            <FilterSection label="Suburb">
              <div className="flex flex-wrap gap-1.5">
                {suburbs.map(s => (
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

          {cuisines.length > 0 && (
            <FilterSection label="Cuisine">
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {cuisines.map(c => (
                  <FilterChip
                    key={c}
                    label={c}
                    active={filters.cuisine.includes(c)}
                    onClick={() => onChange({ ...filters, cuisine: toggle(filters.cuisine, c) })}
                  />
                ))}
              </div>
            </FilterSection>
          )}
        </div>
      )}
    </div>
  )
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-espresso-400 uppercase tracking-wider mb-2">{label}</p>
      {children}
    </div>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-xs px-3 py-1.5 rounded-full border transition-all min-h-[32px]',
        active
          ? 'bg-gold-500/15 text-gold-400 border-gold-500/40'
          : 'bg-transparent text-espresso-400 border-espresso-700/60 hover:border-espresso-500 hover:text-espresso-200'
      )}
    >
      {label}
    </button>
  )
}

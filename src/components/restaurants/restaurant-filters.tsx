'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { STATUS_LABELS } from '@/types'
import type { RestaurantFilters, RestaurantStatus, Tier } from '@/types'

const T = {
  parchment:  '#f5f0e8',
  linen:      '#ede5d8',
  espresso:   '#3b2f27',
  terracotta: '#c4927a',
  stone:      '#c4b8a8',
  mist:       '#a08070',
  ghost:      '#b8a898',
  border:     '#c4b8a8',
}

interface FiltersProps {
  filters: RestaurantFilters
  onChange: (filters: RestaurantFilters) => void
  suburbs: string[]
  cuisines: string[]
  tiers: Tier[]
}

const SORT_OPTIONS = [
  { value: 'newest',       label: 'newest'       },
  { value: 'rating',       label: 'top rated'    },
  { value: 'most_visited', label: 'most visited' },
  { value: 'last_visited', label: 'last visited' },
  { value: 'name',         label: 'name a–z'     },
  { value: 'tier',         label: 'tier'         },
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

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === filters.sortBy)?.label ?? 'sort'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Search · Filter · Sort row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <Search style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            width: 13, height: 13, color: T.stone, pointerEvents: 'none',
          }} />
          <input
            value={filters.search}
            onChange={e => onChange({ ...filters, search: e.target.value })}
            placeholder="search restaurants…"
            style={{
              width:           '100%',
              height:          40,
              backgroundColor: T.linen,
              border:          `0.5px solid ${T.border}`,
              borderRadius:    10,
              paddingLeft:     30,
              paddingRight:    10,
              fontFamily:      'var(--font-dm-mono), ui-monospace, monospace',
              fontSize: 11,
              color:           T.espresso,
              letterSpacing:   '0.06em',
              outline:         'none',
              boxSizing:       'border-box',
            }}
          />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            width:           38,
            height:          40,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            flexShrink:      0,
            position:        'relative',
            backgroundColor: showFilters || activeCount > 0 ? T.terracotta : T.linen,
            border:          `0.5px solid ${showFilters || activeCount > 0 ? T.terracotta : T.border}`,
            borderRadius:    10,
            cursor:          'pointer',
          }}
        >
          <SlidersHorizontal style={{ width: 13, height: 13, color: showFilters || activeCount > 0 ? T.parchment : T.mist }} />
          {activeCount > 0 && (
            <span style={{
              position:        'absolute',
              top:             -4,
              right:           -4,
              width:           14,
              height:          14,
              borderRadius:    7,
              backgroundColor: T.espresso,
              color:           T.parchment,
              fontFamily:      'var(--font-dm-mono), ui-monospace, monospace',
              fontSize: 9,
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              lineHeight:      1,
            }}>{activeCount}</span>
          )}
        </button>

        {/* Sort */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            display:         'flex',
            alignItems:      'center',
            gap:             4,
            height:          40,
            padding:         '0 10px',
            backgroundColor: T.linen,
            border:          `0.5px solid ${T.border}`,
            borderRadius:    10,
            pointerEvents:   'none',
            userSelect:      'none',
          }}>
            <span style={{
              fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
              fontSize: 10,
              color:         T.espresso,
              letterSpacing: '0.06em',
              whiteSpace:    'nowrap',
            }}>{currentSortLabel}</span>
            <ChevronDown style={{ width: 10, height: 10, color: T.mist }} />
          </div>
          <select
            value={filters.sortBy}
            onChange={e => onChange({ ...filters, sortBy: e.target.value as RestaurantFilters['sortBy'] })}
            style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer' }}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div style={{
          backgroundColor: T.linen,
          border:          `0.5px solid ${T.border}`,
          borderRadius:    10,
          padding:         14,
          display:         'flex',
          flexDirection:   'column',
          gap:             14,
        }}>
          {activeCount > 0 && (
            <button
              onClick={clearFacets}
              style={{
                display:     'flex',
                alignItems:  'center',
                gap:         4,
                fontFamily:  'var(--font-dm-mono), ui-monospace, monospace',
                fontSize: 10,
                color:       T.terracotta,
                background:  'none',
                border:      'none',
                cursor:      'pointer',
                padding:     0,
                letterSpacing: '0.06em',
              }}
            >
              <X style={{ width: 10, height: 10 }} />
              clear filters
            </button>
          )}

          <FilterSection label="status">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
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
            <FilterSection label="tier">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
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
            <FilterSection label="suburb">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
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
            <FilterSection label="cuisine">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 96, overflowY: 'auto' }}>
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
      <p style={{
        fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
        fontSize: 9,
        color:         T.mist,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        marginBottom:  8,
      }}>{label}</p>
      {children}
    </div>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding:         '5px 12px',
        borderRadius:    6,
        border:          `0.5px solid ${active ? T.terracotta : T.border}`,
        backgroundColor: active ? T.terracotta : T.linen,
        color:           active ? T.parchment : T.mist,
        fontFamily:      'var(--font-dm-mono), ui-monospace, monospace',
        fontSize: 10,
        letterSpacing:   '0.06em',
        cursor:          'pointer',
        whiteSpace:      'nowrap',
        minHeight:       30,
      }}
    >
      {label}
    </button>
  )
}

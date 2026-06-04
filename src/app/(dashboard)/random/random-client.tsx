'use client'

import { useState, useMemo, useEffect } from 'react'
import { Shuffle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { RestaurantRoulette } from './restaurant-roulette'
import { WinnerReveal } from './winner-reveal'
import type { Restaurant, RestaurantStatus } from '@/types'

interface Filters {
  state: string
  cuisine: string
  suburb: string
  status: RestaurantStatus | ''
  excludeCafesBakeriesGelaterias: boolean
}

const STATE_TO_CITY: Record<string, string> = {
  WA:  'Perth',
  VIC: 'Melbourne',
  NSW: 'Sydney',
  QLD: 'Brisbane',
  SA:  'Adelaide',
  TAS: 'Hobart',
  ACT: 'Canberra',
  NT:  'Darwin',
}

type Phase = 'idle' | 'spinning' | 'revealing'

function applyPool(
  list: Restaurant[],
  state: string,
  cuisine: string,
  suburb: string,
  status: string,
  excludeCafes: boolean,
): Restaurant[] {
  let r = list
  if (state) r = r.filter(x => x.state === state)
  if (cuisine) r = r.filter(x => x.cuisine === cuisine)
  if (suburb) r = r.filter(x => x.suburb === suburb)
  if (status) r = r.filter(x => x.status === status)
  if (excludeCafes) r = r.filter(x => !['Cafe', 'Bakery', 'Gelato', 'Sandwiches'].includes(x.cuisine ?? ''))
  return r
}

export function RandomPicker({ restaurants }: { restaurants: Restaurant[] }) {
  const [filters, setFilters] = useState<Filters>({
    state: '',
    cuisine: '',
    suburb: '',
    status: 'want_to_try',
    excludeCafesBakeriesGelaterias: false,
  })
  const [phase, setPhase] = useState<Phase>('idle')
  const [winner, setWinner] = useState<Restaurant | null>(null)
  const [history, setHistory] = useState<string[]>([])

  const { state, cuisine, suburb, status, excludeCafesBakeriesGelaterias: excludeCafes } = filters

  // Base sets for each facet
  const baseNoState = useMemo(() =>
    applyPool(restaurants, '', cuisine, suburb, status, excludeCafes),
    [restaurants, cuisine, suburb, status, excludeCafes]
  )
  const baseNoCuisine = useMemo(() =>
    applyPool(restaurants, state, '', suburb, status, excludeCafes),
    [restaurants, state, suburb, status, excludeCafes]
  )
  const baseNoSuburb = useMemo(() =>
    applyPool(restaurants, state, cuisine, '', status, excludeCafes),
    [restaurants, state, cuisine, status, excludeCafes]
  )

  // Derive available options
  const availableCities = useMemo(() => {
    const states = new Set(baseNoState.map(r => r.state).filter(Boolean) as string[])
    return Object.entries(STATE_TO_CITY)
      .filter(([s]) => states.has(s))
      .map(([s, label]) => ({ value: s, label }))
  }, [baseNoState])

  const availableCuisines = useMemo(() =>
    [...new Set(baseNoCuisine.map(r => r.cuisine).filter(Boolean) as string[])].sort(),
    [baseNoCuisine]
  )

  const availableSuburbs = useMemo(() =>
    [...new Set(baseNoSuburb.map(r => r.suburb).filter(Boolean) as string[])].sort(),
    [baseNoSuburb]
  )

  // Auto-reset stale single-select values
  useEffect(() => {
    setFilters(prev => {
      const stateOk  = !prev.state   || availableCities.some(c => c.value === prev.state)
      const cuisineOk = !prev.cuisine || availableCuisines.includes(prev.cuisine)
      const suburbOk  = !prev.suburb  || availableSuburbs.includes(prev.suburb)
      if (stateOk && cuisineOk && suburbOk) return prev
      return {
        ...prev,
        state:   stateOk   ? prev.state   : '',
        cuisine: cuisineOk ? prev.cuisine : '',
        suburb:  suburbOk  ? prev.suburb  : '',
      }
    })
  }, [availableCities, availableCuisines, availableSuburbs])

  const pool = useMemo(() =>
    applyPool(restaurants, state, cuisine, suburb, status, excludeCafes),
    [restaurants, state, cuisine, suburb, status, excludeCafes]
  )

  function handlePick() {
    if (pool.length === 0 || phase !== 'idle') return
    const candidates = pool.filter((r) => !history.includes(r.id))
    const available = candidates.length > 0 ? candidates : pool
    const choice = available[Math.floor(Math.random() * available.length)]
    setWinner(choice)
    setPhase('spinning')
    setHistory((h) => [choice.id, ...h].slice(0, 5))
  }

  function handlePickAgain() {
    setWinner(null)
    setPhase('idle')
  }

  const isIdle = phase === 'idle'

  return (
    <div className="space-y-4">
      {/* Filters — hide during animation */}
      <AnimatePresence>
        {isIdle && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-espresso-800 border border-espresso-700 rounded-2xl p-4 space-y-3 overflow-hidden"
          >
            <p className="text-xs font-semibold text-espresso-300 uppercase tracking-wider">Filters</p>

            <div className="grid grid-cols-2 gap-3">
              <FilterSelect
                label="Status"
                value={filters.status}
                onChange={(v) => setFilters((f) => ({ ...f, status: v as RestaurantStatus | '' }))}
                options={[
                  { value: '', label: 'Any status' },
                  { value: 'want_to_try', label: 'Want to Try' },
                  { value: 'visited', label: 'Visited' },
                ]}
              />
              <FilterSelect
                label="City"
                value={filters.state}
                onChange={(v) => setFilters((f) => ({ ...f, state: v, suburb: '' }))}
                options={[{ value: '', label: 'Any city' }, ...availableCities]}
              />
              <FilterSelect
                label="Cuisine"
                value={filters.cuisine}
                onChange={(v) => setFilters((f) => ({ ...f, cuisine: v }))}
                options={[{ value: '', label: 'Any cuisine' }, ...availableCuisines.map((c) => ({ value: c, label: c }))]}
              />
              <FilterSelect
                label="Suburb"
                value={filters.suburb}
                onChange={(v) => setFilters((f) => ({ ...f, suburb: v }))}
                options={[{ value: '', label: 'Any suburb' }, ...availableSuburbs.map((s) => ({ value: s, label: s }))]}
              />
              <label className="flex items-center gap-2 cursor-pointer self-end pb-1.5">
                <input
                  type="checkbox"
                  checked={filters.excludeCafesBakeriesGelaterias}
                  onChange={(e) => setFilters((f) => ({ ...f, excludeCafesBakeriesGelaterias: e.target.checked }))}
                  className="w-3.5 h-3.5 rounded accent-gold-500 cursor-pointer"
                />
                <span className="text-xs text-espresso-200">Exclude cafes, bakeries, gelaterias &amp; sandwiches</span>
              </label>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Pick button */}
      <AnimatePresence>
        {isIdle && (
          <motion.button
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onClick={handlePick}
            disabled={pool.length === 0}
            className={cn(
              'w-full py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-3',
              pool.length === 0
                ? 'bg-espresso-700 text-espresso-400 cursor-not-allowed'
                : 'bg-gold-500 hover:bg-gold-400 text-espresso-900 active:scale-95'
            )}
          >
            <Shuffle className="w-5 h-5" />
            Let&apos;s Eat!
          </motion.button>
        )}
      </AnimatePresence>

      {pool.length === 0 && isIdle && (
        <p className="text-center text-sm text-espresso-400">No restaurants match your filters.</p>
      )}

      {/* Choosing button (shown while spinning) */}
      {phase === 'spinning' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 bg-gold-500/20 text-gold-400 border border-gold-500/20"
        >
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Choosing…
        </motion.div>
      )}

      {/* Roulette animation */}
      <AnimatePresence>
        {phase === 'spinning' && winner && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <RestaurantRoulette
              pool={pool}
              winner={winner}
              onComplete={() => setPhase('revealing')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winner reveal */}
      <AnimatePresence>
        {phase === 'revealing' && winner && (
          <WinnerReveal
            restaurant={winner}
            onPickAgain={handlePickAgain}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function FilterSelect({ label, value, onChange, options }: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className="block text-xs text-espresso-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-espresso-700 border border-espresso-600 rounded-lg px-2.5 py-1.5 text-xs text-espresso-200
          focus:outline-none focus:ring-1 focus:ring-gold-500 appearance-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-espresso-800">{o.label}</option>
        ))}
      </select>
    </div>
  )
}

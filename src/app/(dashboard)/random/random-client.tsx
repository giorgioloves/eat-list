'use client'

import { useState, useMemo } from 'react'
import { Shuffle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { CUISINES } from '@/types'
import { RestaurantRoulette } from './restaurant-roulette'
import { WinnerReveal } from './winner-reveal'
import type { Restaurant, RestaurantStatus } from '@/types'

interface Filters {
  cuisine: string
  city: string
  suburb: string
  status: RestaurantStatus | ''
  excludeCafes: boolean
  excludeBakeries: boolean
  excludeGelaterias: boolean
}

const CAPITAL_CITIES = [
  { label: 'Sydney',    states: ['NSW', 'New South Wales', 'Sydney'] },
  { label: 'Melbourne', states: ['VIC', 'Victoria', 'Melbourne'] },
  { label: 'Brisbane',  states: ['QLD', 'Queensland', 'Brisbane'] },
  { label: 'Perth',     states: ['WA', 'Western Australia', 'Perth', 'Fremantle'] },
  { label: 'Adelaide',  states: ['SA', 'South Australia', 'Adelaide'] },
  { label: 'Hobart',    states: ['TAS', 'Tasmania', 'Hobart'] },
  { label: 'Canberra',  states: ['ACT', 'Australian Capital Territory', 'Canberra'] },
  { label: 'Darwin',    states: ['NT', 'Northern Territory', 'Darwin'] },
]

type Phase = 'idle' | 'spinning' | 'revealing'

export function RandomPicker({ restaurants }: { restaurants: Restaurant[] }) {
  const [filters, setFilters] = useState<Filters>({
    cuisine: '',
    city: '',
    suburb: '',
    status: 'want_to_try',
    excludeCafes: false,
    excludeBakeries: false,
    excludeGelaterias: false,
  })
  const [phase, setPhase] = useState<Phase>('idle')
  const [winner, setWinner] = useState<Restaurant | null>(null)
  const [history, setHistory] = useState<string[]>([])

  const suburbs = useMemo(
    () => [...new Set(restaurants.map((r) => r.suburb).filter(Boolean) as string[])].sort(),
    [restaurants]
  )

  const availableCities = useMemo(
    () => CAPITAL_CITIES.filter((c) =>
      restaurants.some((r) => r.city && c.states.some((s) => r.city!.includes(s)))
    ).map((c) => c.label),
    [restaurants]
  )

  const pool = useMemo(() => {
    let result = [...restaurants]
    if (filters.city) {
      const entry = CAPITAL_CITIES.find((c) => c.label === filters.city)
      if (entry) result = result.filter((r) => r.city && entry.states.some((s) => r.city!.includes(s)))
    }
    if (filters.cuisine) result = result.filter((r) => r.cuisine === filters.cuisine)
    if (filters.suburb) result = result.filter((r) => r.suburb === filters.suburb)
    if (filters.status) result = result.filter((r) => r.status === filters.status)
    if (filters.excludeCafes) result = result.filter((r) => r.cuisine !== 'Cafe')
    if (filters.excludeBakeries) result = result.filter((r) => r.cuisine !== 'Bakery')
    if (filters.excludeGelaterias) result = result.filter((r) => r.cuisine !== 'Gelato')
    return result
  }, [restaurants, filters])

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
                value={filters.city}
                onChange={(v) => setFilters((f) => ({ ...f, city: v, suburb: '' }))}
                options={[{ value: '', label: 'Any city' }, ...availableCities.map((c) => ({ value: c, label: c }))]}
              />
              <FilterSelect
                label="Cuisine"
                value={filters.cuisine}
                onChange={(v) => setFilters((f) => ({ ...f, cuisine: v }))}
                options={[{ value: '', label: 'Any cuisine' }, ...CUISINES.map((c) => ({ value: c, label: c }))]}
              />
              <FilterSelect
                label="Suburb"
                value={filters.suburb}
                onChange={(v) => setFilters((f) => ({ ...f, suburb: v }))}
                options={[{ value: '', label: 'Any suburb' }, ...suburbs.map((s) => ({ value: s, label: s }))]}
              />
              <div className="col-span-2 flex flex-wrap gap-x-4 gap-y-2 pt-1">
                {([
                  { key: 'excludeCafes',      label: 'Exclude cafes' },
                  { key: 'excludeBakeries',   label: 'Exclude bakeries' },
                  { key: 'excludeGelaterias', label: 'Exclude gelaterias' },
                ] as const).map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters[key]}
                      onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.checked }))}
                      className="w-3.5 h-3.5 rounded accent-gold-500 cursor-pointer"
                    />
                    <span className="text-xs text-espresso-200">{label}</span>
                  </label>
                ))}
              </div>
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

'use client'

import { useState, useMemo, useEffect } from 'react'
import { Shuffle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { RestaurantRoulette } from './restaurant-roulette'
import { WinnerReveal } from './winner-reveal'
import type { Restaurant, RestaurantStatus } from '@/types'

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
  const [phase, setPhase]   = useState<Phase>('idle')
  const [winner, setWinner] = useState<Restaurant | null>(null)
  const [history, setHistory] = useState<string[]>([])

  const { state, cuisine, suburb, status, excludeCafesBakeriesGelaterias: excludeCafes } = filters

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

  useEffect(() => {
    setFilters(prev => {
      const stateOk   = !prev.state   || availableCities.some(c => c.value === prev.state)
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
    const available  = candidates.length > 0 ? candidates : pool
    const choice     = available[Math.floor(Math.random() * available.length)]
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Filters */}
      <AnimatePresence>
        {isIdle && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              backgroundColor: T.linen,
              border:          `0.5px solid ${T.border}`,
              borderRadius:    10,
              padding:         14,
              overflow:        'hidden',
            }}
          >
            <p style={{
              fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
              fontSize:      7,
              color:         T.mist,
              letterSpacing: '0.12em',
              textTransform: 'uppercase' as const,
              marginBottom:  12,
            }}>filters</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <FilterSelect
                label="status"
                value={filters.status}
                onChange={(v) => setFilters((f) => ({ ...f, status: v as RestaurantStatus | '' }))}
                options={[
                  { value: '', label: 'any status' },
                  { value: 'want_to_try', label: 'want to try' },
                  { value: 'visited', label: 'visited' },
                ]}
              />
              <FilterSelect
                label="city"
                value={filters.state}
                onChange={(v) => setFilters((f) => ({ ...f, state: v, suburb: '' }))}
                options={[{ value: '', label: 'any city' }, ...availableCities]}
              />
              <FilterSelect
                label="cuisine"
                value={filters.cuisine}
                onChange={(v) => setFilters((f) => ({ ...f, cuisine: v }))}
                options={[{ value: '', label: 'any cuisine' }, ...availableCuisines.map((c) => ({ value: c, label: c }))]}
              />
              <FilterSelect
                label="suburb"
                value={filters.suburb}
                onChange={(v) => setFilters((f) => ({ ...f, suburb: v }))}
                options={[{ value: '', label: 'any suburb' }, ...availableSuburbs.map((s) => ({ value: s, label: s }))]}
              />
              <label style={{
                display:    'flex',
                alignItems: 'center',
                gap:        8,
                cursor:     'pointer',
                gridColumn: '1 / -1',
                marginTop:  2,
              }}>
                <input
                  type="checkbox"
                  checked={filters.excludeCafesBakeriesGelaterias}
                  onChange={(e) => setFilters((f) => ({ ...f, excludeCafesBakeriesGelaterias: e.target.checked }))}
                  style={{
                    width:        12,
                    height:       12,
                    borderRadius: 3,
                    border:       `1px solid ${T.stone}`,
                    cursor:       'pointer',
                    accentColor:  T.espresso,
                    flexShrink:   0,
                  }}
                />
                <span style={{
                  fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
                  fontSize:      8,
                  color:         T.mist,
                  letterSpacing: '0.04em',
                }}>exclude cafes, bakeries, gelaterias &amp; sandwiches</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA button */}
      <AnimatePresence>
        {isIdle && (
          <motion.button
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onClick={handlePick}
            disabled={pool.length === 0}
            style={{
              width:           '100%',
              padding:         '14px 0',
              borderRadius:    20,
              border:          'none',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              gap:             10,
              backgroundColor: pool.length === 0 ? T.stone : T.espresso,
              color:           pool.length === 0 ? T.ghost : T.parchment,
              cursor:          pool.length === 0 ? 'not-allowed' : 'pointer',
              fontFamily:      'var(--font-crimson), Georgia, serif',
              fontStyle:       'italic',
              fontSize:        18,
              fontWeight:      400,
            }}
          >
            <Shuffle style={{ width: 18, height: 18 }} />
            let&apos;s eat
          </motion.button>
        )}
      </AnimatePresence>

      {pool.length === 0 && isIdle && (
        <p style={{
          textAlign:     'center',
          fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
          fontSize:      9,
          color:         T.ghost,
          letterSpacing: '0.08em',
        }}>no restaurants match your filters</p>
      )}

      {/* Spinning indicator */}
      {phase === 'spinning' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            width:           '100%',
            padding:         '14px 0',
            borderRadius:    20,
            border:          `0.5px solid ${T.border}`,
            backgroundColor: T.linen,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            gap:             10,
            fontFamily:      'var(--font-crimson), Georgia, serif',
            fontStyle:       'italic',
            fontSize:        18,
            color:           T.mist,
          }}
        >
          <svg style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          choosing…
        </motion.div>
      )}

      {/* Roulette */}
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
      <p style={{
        fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
        fontSize:      7,
        color:         T.mist,
        letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
        marginBottom:  5,
      }}>{label}</p>
      <div style={{ position: 'relative' }}>
        <div style={{
          width:           '100%',
          height:          30,
          backgroundColor: T.parchment,
          border:          `0.5px solid ${T.border}`,
          borderRadius:    6,
          padding:         '0 8px',
          display:         'flex',
          alignItems:      'center',
          pointerEvents:   'none',
          overflow:        'hidden',
        }}>
          <span style={{
            fontFamily:   'var(--font-crimson), Georgia, serif',
            fontSize:     11,
            color:        T.espresso,
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}>
            {options.find(o => o.value === value)?.label ?? options[0].label}
          </span>
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer' }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

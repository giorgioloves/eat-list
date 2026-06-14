'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { TierBadge } from '@/components/ui/badge'
import { ScoreRating } from '@/components/ui/pip-rating'
import { RatingDistributionChart, CuisineBarList } from './stats-charts'
import { useRestaurants } from '@/contexts/restaurants'
import type { Restaurant, Tier } from '@/types'

const T = {
  parchment:  '#f5f0e8',
  linen:      '#ede5d8',
  espresso:   '#3b2f27',
  terracotta: '#c4927a',
  sage:       '#8a9e8a',
  stone:      '#c4b8a8',
  mist:       '#a08070',
  ghost:      '#b8a898',
  border:     '#c4b8a8',
}

type TimeFilter = 'all' | 'year' | 'month'

const TIER_SCORE: Record<string, number> = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 }

function topScore(r: Restaurant) {
  return (r.rating ?? 0) * 2 + (TIER_SCORE[r.tier ?? ''] ?? 0) * 2 + Math.pow(r.visit_count, 1.5) * 0.6
}
function bottomScore(r: Restaurant) {
  return (10 - (r.rating ?? 10)) * 2 + (r.tier ? (8 - TIER_SCORE[r.tier]) * 2 : 0)
}

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 80, stroke = 6 }: { pct: number; size?: number; stroke?: number }) {
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(pct, 100) / 100) * circ

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.stone} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={T.sage} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}

// ─── Segmented Control ────────────────────────────────────────────────────────

const SEGMENTS: { id: TimeFilter; label: string }[] = [
  { id: 'all',   label: 'all time'   },
  { id: 'year',  label: 'this year'  },
  { id: 'month', label: 'this month' },
]

function SegmentedControl({ value, onChange }: { value: TimeFilter; onChange: (v: TimeFilter) => void }) {
  return (
    <div style={{
      display:         'flex',
      backgroundColor: T.linen,
      border:          `0.5px solid ${T.border}`,
      borderRadius:    10,
      padding:         3,
      gap:             3,
    }}>
      {SEGMENTS.map(seg => (
        <button
          key={seg.id}
          onClick={() => onChange(seg.id)}
          style={{
            flex:            1,
            padding:         '8px 6px',
            borderRadius:    7,
            border:          'none',
            backgroundColor: value === seg.id ? T.espresso : 'transparent',
            color:           value === seg.id ? T.parchment : T.mist,
            fontFamily:      'var(--font-dm-mono), ui-monospace, monospace',
            fontSize: 11,
            letterSpacing:   '0.06em',
            cursor:          'pointer',
            transition:      'all 0.15s',
            minHeight:       32,
          }}
        >
          {seg.label}
        </button>
      ))}
    </div>
  )
}

// ─── Hero Card ────────────────────────────────────────────────────────────────

function HeroCard({ total, visited, wishlist, visitedPct }: {
  total: number; visited: number; wishlist: number; visitedPct: number
}) {
  return (
    <div style={{
      backgroundColor: T.linen,
      border:          `0.5px solid ${T.border}`,
      borderRadius:    10,
      padding:         '18px 18px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontFamily: 'var(--font-crimson), Georgia, serif',
            fontSize: 52,
            fontWeight: 300,
            color:      T.espresso,
            lineHeight: 1,
          }}>{total}</p>
          <p style={{
            fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
            fontSize: 11,
            color:         T.mist,
            letterSpacing: '0.08em',
            marginTop:     6,
          }}>restaurants tracked</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' as const }}>
            <span style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: 17, color: T.sage }}>
              {visited} visited
            </span>
            <span style={{ color: T.stone, fontSize: 11 }}>·</span>
            <span style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: 17, color: T.terracotta }}>
              {wishlist} to try
            </span>
          </div>
        </div>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <ProgressRing pct={visitedPct} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: 19, fontWeight: 400, color: T.espresso, lineHeight: 1 }}>
                {visitedPct}%
              </p>
              <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 9, color: T.mist, marginTop: 1 }}>
                visited
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({ icon, label, value, sub, accent }: {
  icon: string; label: string; value: string | number; sub: string; accent?: boolean
}) {
  return (
    <div style={{
      backgroundColor: T.linen,
      border:          `0.5px solid ${T.border}`,
      borderRadius:    10,
      padding:         '14px 14px 12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>
        <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 10, color: T.mist, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>{label}</p>
      </div>
      <p style={{
        fontFamily: 'var(--font-crimson), Georgia, serif',
        fontSize: 30,
        fontWeight: 300,
        color:      accent ? T.terracotta : T.espresso,
        fontStyle:  accent ? 'italic' : 'normal',
        lineHeight: 1,
      }}>{value}</p>
      <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 10, color: T.ghost, marginTop: 5 }}>{sub}</p>
    </div>
  )
}

// ─── Rank Row ─────────────────────────────────────────────────────────────────

function RestaurantRankRow({ restaurant: r, rank, isBottom }: {
  restaurant: Restaurant; rank: number; isBottom?: boolean
}) {
  return (
    <Link
      href={`/restaurants/${r.id}`}
      style={{
        display:        'flex',
        alignItems:     'center',
        gap:            10,
        padding:        '12px 16px',
        textDecoration: 'none',
      }}
    >
      <span style={{
        fontFamily: 'var(--font-dm-mono), ui-monospace, monospace',
        fontSize: 12,
        color:      isBottom ? '#c47a7a' : T.terracotta,
        width:      16,
        textAlign:  'center',
        flexShrink: 0,
      }}>{rank}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily:   'var(--font-crimson), Georgia, serif',
          fontSize: 16,
          fontWeight:   400,
          color:        T.espresso,
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          whiteSpace:   'nowrap',
        }}>{r.name.replace(/\s*\([^)]+\)\s*$/, '').trim()}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          {r.cuisine && (
            <span style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 11, color: T.mist }}>{r.cuisine}</span>
          )}
          {r.tier && <TierBadge tier={r.tier as Tier} />}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {r.rating !== null && <ScoreRating rating={r.rating} size="sm" />}
        <ChevronRight style={{ width: 12, height: 12, color: T.stone }} />
      </div>
    </Link>
  )
}

// ─── Card Wrappers ────────────────────────────────────────────────────────────

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: T.linen,
      border:          `0.5px solid ${T.border}`,
      borderRadius:    10,
      padding:         16,
    }}>
      <p style={{
        fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
        fontSize: 10,
        color:         T.mist,
        letterSpacing: '0.12em',
        textTransform: 'uppercase' as const,
        marginBottom:  14,
      }}>{title}</p>
      {children}
    </div>
  )
}

function RankedListCard({ title, restaurants, isBottom }: {
  title: string; restaurants: Restaurant[]; isBottom?: boolean
}) {
  return (
    <div style={{
      backgroundColor: T.linen,
      border:          `0.5px solid ${T.border}`,
      borderRadius:    10,
      overflow:        'hidden',
    }}>
      <div style={{ padding: '14px 16px 10px' }}>
        <p style={{
          fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
          fontSize: 10,
          color:         T.mist,
          letterSpacing: '0.12em',
          textTransform: 'uppercase' as const,
        }}>{title}</p>
      </div>
      <div>
        {restaurants.map((r, i) => (
          <div key={r.id} style={{ borderTop: `0.5px solid ${T.border}` }}>
            <RestaurantRankRow restaurant={r} rank={i + 1} isBottom={isBottom} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const { restaurants } = useRestaurants()
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [visitSpends, setVisitSpends] = useState<{ cost: number | null }[]>([])

  const filtered = useMemo(() => {
    if (timeFilter === 'all') return restaurants
    const now = new Date()
    return restaurants.filter(r => {
      const d = new Date(r.created_at)
      if (timeFilter === 'year') return d.getFullYear() === now.getFullYear()
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
  }, [restaurants, timeFilter])

  useEffect(() => {
    if (filtered.length === 0) { setVisitSpends([]); return }
    const ids = filtered.map(r => r.id).join(',')
    fetch(`/api/visits?ids=${ids}`)
      .then(res => res.json())
      .then(data => setVisitSpends(data ?? []))
  }, [filtered])

  if (restaurants.length === 0) {
    return (
      <div style={{ padding: '24px 16px 112px' }}>
        <h1 style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: 32, fontWeight: 400, color: T.espresso, margin: 0 }}>stats</h1>
        <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 12, color: T.mist, marginTop: 6 }}>add restaurants to see your stats</p>
      </div>
    )
  }

  const visited  = filtered.filter(r => r.status === 'visited')
  const wishlist = filtered.filter(r => r.status === 'want_to_try')
  const rated    = filtered.filter(r => r.rating !== null)

  const visitedPct  = filtered.length > 0 ? Math.round((visited.length / filtered.length) * 100) : 0
  const totalVisits = filtered.reduce((sum, r) => sum + r.visit_count, 0)
  const avgRating   = rated.length > 0
    ? rated.reduce((sum, r) => sum + (r.rating ?? 0), 0) / rated.length
    : null

  const spendEntries = visitSpends.filter(v => v.cost !== null)
  const totalSpend   = spendEntries.reduce((sum, v) => sum + (v.cost ?? 0), 0)
  const avgSpend     = spendEntries.length > 0 ? totalSpend / spendEntries.length : null

  const top5 = [...visited]
    .filter(r => r.rating !== null || r.tier !== null || r.visit_count > 0)
    .sort((a, b) => topScore(b) - topScore(a))
    .slice(0, 5)
  const bottom5 = [...rated]
    .sort((a, b) => bottomScore(b) - bottomScore(a))
    .slice(0, 5)

  const cuisineCounts: Record<string, number> = {}
  for (const r of filtered) {
    if (r.cuisine) cuisineCounts[r.cuisine] = (cuisineCounts[r.cuisine] || 0) + 1
  }
  const cuisineData = Object.entries(cuisineCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }))

  const ratingBuckets = [
    { label: '0–2',  min: 0,  max: 2  },
    { label: '2–4',  min: 2,  max: 4  },
    { label: '4–6',  min: 4,  max: 6  },
    { label: '6–8',  min: 6,  max: 8  },
    { label: '8–10', min: 8,  max: 10 },
  ].map(({ label, min, max }) => ({
    label,
    count: rated.filter(r => {
      const v = r.rating ?? 0
      return v >= min && v <= max
    }).length,
  }))

  const fmt = (n: number) => n.toLocaleString('en-AU', { maximumFractionDigits: 0 })

  return (
    <div style={{ padding: '24px 16px 112px', maxWidth: 440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: 32, fontWeight: 400, color: T.espresso, lineHeight: 1.1, margin: 0 }}>stats</h1>
        <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 12, color: T.mist, letterSpacing: '0.1em', marginTop: 4 }}>your restaurant journey in numbers</p>
      </div>

      <SegmentedControl value={timeFilter} onChange={setTimeFilter} />

      <HeroCard
        total={filtered.length}
        visited={visited.length}
        wishlist={wishlist.length}
        visitedPct={visitedPct}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <MetricCard icon="🍽️" label="total visits" value={totalVisits} sub={`across ${filtered.length} place${filtered.length !== 1 ? 's' : ''}`} />
        <MetricCard icon="⭐" label="avg rating" value={avgRating !== null ? avgRating.toFixed(1) : '—'} sub={rated.length > 0 ? `${rated.length} rated` : 'none rated yet'} accent />
        <MetricCard icon="💰" label="total spend" value={spendEntries.length > 0 ? `$${fmt(totalSpend)}` : '—'} sub={spendEntries.length > 0 ? `${spendEntries.length} visit${spendEntries.length !== 1 ? 's' : ''} logged` : 'no spend logged'} />
        <MetricCard icon="📊" label="avg spend" value={avgSpend !== null ? `$${fmt(avgSpend)}` : '—'} sub="per visit" />
      </div>

      {rated.length > 0 && (
        <ChartCard title="rating distribution">
          <RatingDistributionChart buckets={ratingBuckets} />
        </ChartCard>
      )}

      {cuisineData.length > 0 && (
        <ChartCard title="top cuisines">
          <CuisineBarList data={cuisineData} />
        </ChartCard>
      )}

      {top5.length > 0 && (
        <RankedListCard title="top rated" restaurants={top5} />
      )}

      {bottom5.length >= 3 && (
        <RankedListCard title="lowest rated" restaurants={bottom5} isBottom />
      )}

    </div>
  )
}

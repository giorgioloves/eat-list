'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { TierBadge } from '@/components/ui/badge'
import { RatingDistributionChart, CuisineBarList } from './stats-charts'
import { useRestaurants } from '@/contexts/restaurants'
import type { Restaurant, Tier } from '@/types'

type TimeFilter = 'all' | 'year' | 'month'

const TIER_SCORE: Record<string, number> = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 }

function topScore(r: Restaurant) {
  return (r.rating ?? 0) * 4 + (TIER_SCORE[r.tier ?? ''] ?? 0) * 2 + Math.pow(r.visit_count, 1.5) * 0.6
}
function bottomScore(r: Restaurant) {
  return (5 - (r.rating ?? 5)) * 4 + (r.tier ? (8 - TIER_SCORE[r.tier]) * 2 : 0)
}

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 96, stroke = 7 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(pct, 100) / 100) * circ

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke}
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="#22c55e" strokeWidth={stroke}
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
  { id: 'all',   label: 'All Time'   },
  { id: 'year',  label: 'This Year'  },
  { id: 'month', label: 'This Month' },
]

function SegmentedControl({ value, onChange }: { value: TimeFilter; onChange: (v: TimeFilter) => void }) {
  return (
    <div className="flex bg-espresso-800 border border-espresso-700/60 rounded-xl p-1 gap-1">
      {SEGMENTS.map(seg => (
        <button
          key={seg.id}
          onClick={() => onChange(seg.id)}
          className={`flex-1 text-xs font-semibold py-2.5 px-2 rounded-lg transition-all duration-200 min-h-[44px] ${
            value === seg.id
              ? 'bg-espresso-600 text-espresso-50 shadow-sm'
              : 'text-espresso-400 hover:text-espresso-200'
          }`}
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
    <div className="bg-espresso-800 border border-espresso-700/60 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-5xl font-black tracking-tight text-espresso-50 leading-none">{total}</p>
          <p className="text-sm text-espresso-400 mt-2">restaurants tracked</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-sm font-semibold text-green-400">{visited} visited</span>
            <span className="text-espresso-600 text-xs">·</span>
            <span className="text-sm font-semibold text-blue-400">{wishlist} to try</span>
          </div>
        </div>
        <div className="relative flex-shrink-0">
          <ProgressRing pct={visitedPct} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-black text-espresso-50">{visitedPct}%</p>
              <p className="text-[9px] text-espresso-500 leading-tight mt-px">visited</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({ icon, label, value, sub, valueColor }: {
  icon: string
  label: string
  value: string | number
  sub: string
  valueColor?: string
}) {
  return (
    <div className="bg-espresso-800 border border-espresso-700/60 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base leading-none">{icon}</span>
        <p className="text-xs text-espresso-400 font-medium">{label}</p>
      </div>
      <p className={`text-2xl font-black leading-none ${valueColor ?? 'text-espresso-50'}`}>{value}</p>
      <p className="text-xs text-espresso-500 mt-1.5">{sub}</p>
    </div>
  )
}

// ─── Rating Badge ─────────────────────────────────────────────────────────────

function RatingBadge({ rating, isLow }: { rating: number; isLow?: boolean }) {
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-md tabular-nums ${
      isLow ? 'bg-red-500/15 text-red-400' : 'bg-gold-500/15 text-gold-400'
    }`}>
      {rating.toFixed(1)}
    </span>
  )
}

// ─── Ranked Row ───────────────────────────────────────────────────────────────

function RestaurantRankRow({ restaurant: r, rank, isBottom }: {
  restaurant: Restaurant; rank: number; isBottom?: boolean
}) {
  return (
    <Link
      href={`/restaurants/${r.id}`}
      className="flex items-center gap-3 px-5 py-4 hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors min-h-[56px]"
    >
      <span className={`text-xs font-black w-5 text-center flex-shrink-0 ${
        isBottom ? 'text-red-400/70' : 'text-gold-500/70'
      }`}>
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-espresso-50 truncate">{r.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {r.cuisine && (
            <span className="text-xs text-espresso-400 truncate">{r.cuisine}</span>
          )}
          {r.tier && <TierBadge tier={r.tier as Tier} />}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {r.rating !== null && <RatingBadge rating={r.rating} isLow={isBottom} />}
        <ChevronRight className="w-4 h-4 text-espresso-700" />
      </div>
    </Link>
  )
}

// ─── Reusable Card Wrappers ───────────────────────────────────────────────────

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-espresso-800 border border-espresso-700/60 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-espresso-200 mb-4">{title}</h3>
      {children}
    </div>
  )
}

function RankedListCard({ title, restaurants, isBottom }: {
  title: string; restaurants: Restaurant[]; isBottom?: boolean
}) {
  return (
    <div className="bg-espresso-800 border border-espresso-700/60 rounded-2xl overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <h3 className="text-sm font-semibold text-espresso-200">{title}</h3>
      </div>
      <div className="divide-y divide-white/[0.05]">
        {restaurants.map((r, i) => (
          <RestaurantRankRow key={r.id} restaurant={r} rank={i + 1} isBottom={isBottom} />
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
      <div className="px-4 pt-8 pb-24">
        <h1 className="text-3xl font-black tracking-tight text-espresso-50">Stats</h1>
        <p className="text-sm text-espresso-400 mt-1.5">Add restaurants to see your stats.</p>
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

  const ratingBuckets = [1, 2, 3, 4, 5].map(n => ({
    label: String(n),
    count: rated.filter(r => r.rating === n).length,
  }))

  const fmt = (n: number) =>
    n.toLocaleString('en-AU', { maximumFractionDigits: 0 })

  return (
    <div className="px-4 pt-8 pb-28 max-w-lg mx-auto space-y-4">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-espresso-50">Stats</h1>
        <p className="text-sm text-espresso-400 mt-1">Your restaurant journey in numbers</p>
      </div>

      {/* Time filter */}
      <SegmentedControl value={timeFilter} onChange={setTimeFilter} />

      {/* Hero */}
      <HeroCard
        total={filtered.length}
        visited={visited.length}
        wishlist={wishlist.length}
        visitedPct={visitedPct}
      />

      {/* 2×2 metric grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon="🍽️"
          label="Total Visits"
          value={totalVisits}
          sub={`across ${filtered.length} place${filtered.length !== 1 ? 's' : ''}`}
        />
        <MetricCard
          icon="⭐"
          label="Avg Rating"
          value={avgRating !== null ? `${avgRating.toFixed(1)}/5` : '—'}
          sub={rated.length > 0 ? `${rated.length} rated` : 'none rated yet'}
          valueColor="text-gold-400"
        />
        <MetricCard
          icon="💰"
          label="Total Spend"
          value={spendEntries.length > 0 ? `$${fmt(totalSpend)}` : '—'}
          sub={spendEntries.length > 0
            ? `${spendEntries.length} visit${spendEntries.length !== 1 ? 's' : ''} logged`
            : 'no spend logged'}
        />
        <MetricCard
          icon="📊"
          label="Avg Spend"
          value={avgSpend !== null ? `$${fmt(avgSpend)}` : '—'}
          sub="per visit"
        />
      </div>

      {/* Rating distribution */}
      {rated.length > 0 && (
        <ChartCard title="Rating Distribution">
          <RatingDistributionChart buckets={ratingBuckets} />
        </ChartCard>
      )}

      {/* Top cuisines */}
      {cuisineData.length > 0 && (
        <ChartCard title="Top Cuisines">
          <CuisineBarList data={cuisineData} />
        </ChartCard>
      )}

      {/* Top rated */}
      {top5.length > 0 && (
        <RankedListCard title="Top Rated" restaurants={top5} />
      )}

      {/* Lowest rated */}
      {bottom5.length >= 3 && (
        <RankedListCard title="Lowest Rated" restaurants={bottom5} isBottom />
      )}

    </div>
  )
}

'use client'

import Link from 'next/link'
import { StatusBadge } from '@/components/ui/badge'
import { PipRating } from '@/components/ui/pip-rating'
import {
  Plus, UtensilsCrossed, Star, BookMarked, TrendingUp,
  ArrowRight, ChevronRight,
} from 'lucide-react'
import { useRestaurants } from '@/contexts/restaurants'
import { CUISINE_EMOJI } from '@/types'
import type { Restaurant } from '@/types'

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { restaurants, loading } = useRestaurants()

  const visited    = restaurants.filter((r) => r.status === 'visited')
  const wishlist   = restaurants.filter((r) => r.status === 'want_to_try')
  const rated      = restaurants.filter((r) => r.rating !== null)
  const avgRating  = rated.length > 0
    ? (rated.reduce((sum, r) => sum + (r.rating ?? 0), 0) / rated.length).toFixed(1)
    : null
  const recent     = restaurants.slice(0, 4)

  return (
    <div className="px-4 pt-6 pb-28 max-w-lg mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-espresso-50">Eat List</h1>
          <p className="text-sm text-espresso-400 mt-0.5">Your restaurant list</p>
        </div>
        <Link
          href="/restaurants/add"
          className="flex items-center justify-center w-9 h-9 bg-gold-500 hover:bg-gold-400 text-espresso-900 rounded-xl transition-colors"
          aria-label="Add restaurant"
        >
          <Plus className="w-4 h-4" />
        </Link>
      </div>

      {/* 2×2 metric grid */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/stats" className="block">
          <MetricCard
            label="Total"
            value={restaurants.length}
            detail="restaurants"
            icon={<UtensilsCrossed className="w-4 h-4 text-espresso-400" />}
          />
        </Link>
        <Link href="/stats" className="block">
          <MetricCard
            label="Visited"
            value={visited.length}
            detail="restaurants"
            icon={<Star className="w-4 h-4 text-green-400" />}
            valueColor="text-green-400"
          />
        </Link>
        <Link href="/stats" className="block">
          <MetricCard
            label="Want to Try"
            value={wishlist.length}
            detail="restaurants"
            icon={<BookMarked className="w-4 h-4 text-blue-400" />}
            valueColor="text-blue-400"
          />
        </Link>
        <Link href="/stats" className="block">
          <MetricCard
            label="Avg Rating"
            value={avgRating ?? '—'}
            detail="out of 5"
            icon={<TrendingUp className="w-4 h-4 text-gold-400" />}
            valueColor="text-gold-400"
          />
        </Link>
      </div>

      {/* Stats preview */}
      {restaurants.length > 0 && (
        <section>
          <SectionHeader title="Stats" href="/stats" linkLabel="View full" />
          <div className="space-y-3">
            {rated.length > 0 && <MiniRatingDistribution rated={rated} />}
            <MiniTopCuisines restaurants={restaurants} />
            {visited.length > 0 && <MiniVisitHighlights restaurants={restaurants} visited={visited} />}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      <section>
        <SectionHeader title="Recent Activity" href="/restaurants" linkLabel="View all" />
        {recent.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {recent.map((r) => (
              <RecentRow key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </section>

    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold text-espresso-200">{title}</h2>
      <Link
        href={href}
        className="flex items-center gap-1 text-xs text-gold-500 hover:text-gold-400 transition-colors"
      >
        {linkLabel} <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  )
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({
  label, value, detail, icon, valueColor,
}: {
  label: string
  value: number | string
  detail: string
  icon: React.ReactNode
  valueColor?: string
}) {
  return (
    <div className="bg-espresso-800 border border-espresso-700/60 rounded-xl p-4 hover:border-espresso-600 active:bg-espresso-700/60 transition-colors h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-espresso-400">{label}</span>
        {icon}
      </div>
      <p className={`text-2xl font-bold leading-none ${valueColor ?? 'text-espresso-50'}`}>{value}</p>
      <p className="text-xs text-espresso-500 mt-1.5">{detail}</p>
    </div>
  )
}

// ─── Mini Rating Distribution ─────────────────────────────────────────────────

function MiniRatingDistribution({ rated }: { rated: Restaurant[] }) {
  const buckets = [5, 4, 3, 2, 1].map((n) => ({
    stars: n,
    count: rated.filter((r) => Math.round(r.rating ?? 0) === n).length,
  }))
  const max = Math.max(...buckets.map((b) => b.count), 1)

  return (
    <div className="bg-espresso-800 border border-espresso-700/60 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-espresso-300 uppercase tracking-wide">Rating Distribution</h3>
        <span className="text-xs text-espresso-500">{rated.length} rated</span>
      </div>
      <div className="space-y-2">
        {buckets.map(({ stars, count }) => (
          <div key={stars} className="flex items-center gap-2.5">
            <div className="flex gap-0.5 w-14 flex-shrink-0">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i < stars ? 'bg-gold-400' : 'bg-espresso-700'}`}
                />
              ))}
            </div>
            <div className="flex-1 h-1.5 bg-espresso-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold-500/70 rounded-full transition-all duration-500"
                style={{ width: count > 0 ? `${(count / max) * 100}%` : '0%' }}
              />
            </div>
            <span className="text-xs text-espresso-500 w-5 text-right tabular-nums flex-shrink-0">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Mini Top Cuisines ────────────────────────────────────────────────────────

function MiniTopCuisines({ restaurants }: { restaurants: Restaurant[] }) {
  const counts: Record<string, number> = {}
  for (const r of restaurants) {
    if (r.cuisine) counts[r.cuisine] = (counts[r.cuisine] || 0) + 1
  }
  const top5 = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  if (top5.length === 0) return null
  const max = top5[0][1]

  return (
    <div className="bg-espresso-800 border border-espresso-700/60 rounded-2xl p-4">
      <h3 className="text-xs font-semibold text-espresso-300 uppercase tracking-wide mb-3">Top Cuisines</h3>
      <div className="space-y-2.5">
        {top5.map(([cuisine, count]) => (
          <div key={cuisine} className="flex items-center gap-2.5">
            <span className="text-sm w-4 text-center flex-shrink-0 leading-none">
              {CUISINE_EMOJI[cuisine] ?? '🍽️'}
            </span>
            <span className="text-xs text-espresso-200 w-24 truncate flex-shrink-0">{cuisine}</span>
            <div className="flex-1 h-1.5 bg-espresso-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-espresso-400/70 rounded-full transition-all duration-500"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
            <span className="text-xs text-espresso-500 w-5 text-right tabular-nums flex-shrink-0">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Mini Visit Highlights ────────────────────────────────────────────────────

function MiniVisitHighlights({ restaurants, visited }: { restaurants: Restaurant[]; visited: Restaurant[] }) {
  const totalVisits = restaurants.reduce((sum, r) => sum + r.visit_count, 0)
  const mostVisited = visited.length > 0
    ? visited.reduce((best, r) => r.visit_count > best.visit_count ? r : best)
    : null
  const toTryPct = restaurants.length > 0
    ? Math.round(((restaurants.length - visited.length) / restaurants.length) * 100)
    : 0

  return (
    <div className="bg-espresso-800 border border-espresso-700/60 rounded-2xl p-4">
      <h3 className="text-xs font-semibold text-espresso-300 uppercase tracking-wide mb-3">Visit Highlights</h3>
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-espresso-400">Total visits logged</span>
          <span className="text-xs font-semibold text-espresso-100 tabular-nums">{totalVisits}</span>
        </div>
        {mostVisited && mostVisited.visit_count > 1 && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-espresso-400 flex-shrink-0">Most visited</span>
            <span className="text-xs font-semibold text-espresso-100 truncate text-right">
              {mostVisited.name}{' '}
              <span className="text-espresso-500 font-normal">×{mostVisited.visit_count}</span>
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-espresso-400">Still to try</span>
          <span className="text-xs font-semibold text-blue-400">{toTryPct}%</span>
        </div>
      </div>
    </div>
  )
}

// ─── Recent Row ───────────────────────────────────────────────────────────────

function RecentRow({ restaurant: r }: { restaurant: Restaurant }) {
  return (
    <Link
      href={`/restaurants/${r.id}`}
      className="flex items-center gap-3 px-3 py-2.5 bg-espresso-800 border border-espresso-700/60 rounded-xl hover:border-espresso-600 hover:bg-espresso-700/40 active:bg-espresso-700/60 transition-all group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-espresso-50 truncate">{r.name}</span>
          {r.rating !== null && <PipRating rating={r.rating} size="sm" />}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <StatusBadge status={r.status} />
          {r.cuisine && <span className="text-xs text-espresso-400">{r.cuisine}</span>}
          {r.price_level && <span className="text-xs text-espresso-500">{r.price_level}</span>}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-espresso-700 group-hover:text-espresso-500 flex-shrink-0 transition-colors" />
    </Link>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="text-center py-12 bg-espresso-800 border border-espresso-700 rounded-xl">
      <UtensilsCrossed className="w-10 h-10 text-espresso-500 mx-auto mb-3" />
      <p className="text-espresso-200 font-medium">No restaurants yet</p>
      <p className="text-espresso-400 text-sm mt-1">Add your first restaurant to get started</p>
      <Link
        href="/restaurants/add"
        className="inline-flex items-center gap-2 mt-4 bg-gold-500 hover:bg-gold-400 text-espresso-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Restaurant
      </Link>
    </div>
  )
}


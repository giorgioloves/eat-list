'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { RotateCcw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TierBadge } from '@/components/ui/badge'
import { PipRating } from '@/components/ui/pip-rating'
import { StatsCharts } from './stats-charts'
import { useRestaurants } from '@/contexts/restaurants'
import type { Restaurant, Tier } from '@/types'

const TIER_SCORE: Record<string, number> = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 }

function topScore(r: Restaurant) {
  return (r.rating ?? 0) * 4 + (TIER_SCORE[r.tier ?? ''] ?? 0) * 2 + Math.pow(r.visit_count, 1.5) * 0.6
}
function bottomScore(r: Restaurant) {
  return (5 - (r.rating ?? 5)) * 4 + (r.tier ? (8 - TIER_SCORE[r.tier]) * 2 : 0)
}

export default function StatsPage() {
  const { restaurants } = useRestaurants()
  const [visitSpends, setVisitSpends] = useState<{ cost: number | null }[]>([])

  useEffect(() => {
    if (restaurants.length === 0) return
    const ids = restaurants.map((r) => r.id)
    createClient()
      .from('restaurant_visits')
      .select('cost')
      .in('restaurant_id', ids)
      .then(({ data }) => setVisitSpends(data ?? []))
  }, [restaurants])

  if (restaurants.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <h1 className="text-xl font-bold text-espresso-50 mb-2">Stats</h1>
        <p className="text-espresso-400">Add restaurants to see your stats.</p>
      </div>
    )
  }

  const visited = restaurants.filter((r) => r.status === 'visited')
  const wishlist = restaurants.filter((r) => r.status === 'want_to_try')
  const rated = restaurants.filter((r) => r.rating !== null)
  const avgRating = rated.length > 0
    ? rated.reduce((sum, r) => sum + (r.rating ?? 0), 0) / rated.length
    : null
  const mostVisited = [...restaurants].sort((a, b) => b.visit_count - a.visit_count)[0]

  const top10 = [...visited]
    .filter((r) => r.rating !== null || r.tier !== null || r.visit_count > 0)
    .sort((a, b) => topScore(b) - topScore(a))
    .slice(0, 5)
  const bottom10 = [...rated].sort((a, b) => bottomScore(b) - bottomScore(a)).slice(0, 5)

  const cuisineCounts: Record<string, number> = {}
  for (const r of restaurants) {
    if (r.cuisine) cuisineCounts[r.cuisine] = (cuisineCounts[r.cuisine] || 0) + 1
  }
  const cuisineData = Object.entries(cuisineCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }))

  const ratingBuckets = [1, 2, 3, 4, 5].map((n) => ({
    label: String(n),
    count: rated.filter((r) => r.rating === n).length,
  }))

  const spendEntries = visitSpends.filter((v) => v.cost !== null)
  const totalSpend = spendEntries.reduce((sum, v) => sum + (v.cost ?? 0), 0)
  const avgSpend = spendEntries.length > 0 ? totalSpend / spendEntries.length : null

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-espresso-50">Stats</h1>
        <p className="text-sm text-espresso-300 mt-0.5">Your restaurant journey in numbers</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total" value={restaurants.length} sub="restaurants" />
        <StatCard label="Visited" value={visited.length} sub={`${Math.round((visited.length / restaurants.length) * 100)}%`} color="text-green-400" />
        <StatCard label="Want to Try" value={wishlist.length} sub={`${Math.round((wishlist.length / restaurants.length) * 100)}%`} color="text-blue-400" />
        <StatCard label="Total Visits" value={restaurants.reduce((sum, r) => sum + r.visit_count, 0)} sub="across all" />
      </div>

      {avgRating !== null && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-espresso-800 border border-espresso-700 rounded-xl p-4">
            <p className="text-xs text-espresso-400 mb-1">Average Rating</p>
            <div className="my-1"><PipRating rating={avgRating} /></div>
            <p className="text-lg font-bold text-gold-400">{avgRating.toFixed(1)} / 5</p>
            <p className="text-xs text-espresso-400 mt-0.5">across {rated.length} rated</p>
          </div>
          {mostVisited && (
            <div className="bg-espresso-800 border border-espresso-700 rounded-xl p-4">
              <p className="text-xs text-espresso-400 mb-1">Most Visited</p>
              <p className="font-semibold text-espresso-50 text-sm truncate">{mostVisited.name}</p>
              <p className="text-xs text-gold-400 mt-0.5">{mostVisited.visit_count} visits</p>
            </div>
          )}
        </div>
      )}

      {spendEntries.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-espresso-800 border border-espresso-700 rounded-xl p-4">
            <p className="text-xs text-espresso-400 mb-1">Total Spend</p>
            <p className="text-2xl font-black text-espresso-50">
              ${totalSpend.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-espresso-400 mt-0.5">across {spendEntries.length} visit{spendEntries.length !== 1 ? 's' : ''}</p>
          </div>
          {avgSpend !== null && (
            <div className="bg-espresso-800 border border-espresso-700 rounded-xl p-4">
              <p className="text-xs text-espresso-400 mb-1">Avg Spend</p>
              <p className="text-2xl font-black text-espresso-50">
                ${avgSpend.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-espresso-400 mt-0.5">per visit</p>
            </div>
          )}
        </div>
      )}

      <StatsCharts cuisineData={cuisineData} ratingBuckets={ratingBuckets} />

      {(top10.length > 0 || bottom10.length >= 3) && (
        <div className="mt-6 grid grid-cols-2 gap-4 items-start">
          {top10.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-espresso-200 mb-3">Top 5</h2>
              <div className="space-y-2">
                {top10.map((r, i) => <RestaurantRankRow key={r.id} restaurant={r} rank={i + 1} />)}
              </div>
            </div>
          )}
          {bottom10.length >= 3 && (
            <div>
              <h2 className="text-sm font-semibold text-espresso-200 mb-3">Losers</h2>
              <div className="space-y-2">
                {bottom10.map((r, i) => <RestaurantRankRow key={r.id} restaurant={r} rank={i + 1} isBottom />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: number; sub: string; color?: string }) {
  return (
    <div className="bg-espresso-800 border border-espresso-700 rounded-xl p-4">
      <p className="text-xs text-espresso-400">{label}</p>
      <p className={`text-2xl font-black mt-1 ${color || 'text-espresso-50'}`}>{value}</p>
      <p className="text-xs text-espresso-500 mt-0.5">{sub}</p>
    </div>
  )
}

function RestaurantRankRow({ restaurant: r, rank, isBottom }: { restaurant: Restaurant; rank: number; isBottom?: boolean }) {
  return (
    <Link
      href={`/restaurants/${r.id}`}
      className="flex items-center gap-3 p-3 bg-espresso-800 border border-espresso-700 rounded-xl hover:border-espresso-600 transition-colors"
    >
      <span className={`text-sm font-bold w-6 text-center ${isBottom ? 'text-red-400' : 'text-gold-400'}`}>{rank}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-espresso-50 truncate">{r.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {r.cuisine && <span className="text-xs text-espresso-400 truncate">{r.cuisine}</span>}
          {r.visit_count > 1 && (
            <span className="flex items-center gap-0.5 text-xs text-espresso-500 flex-shrink-0">
              <RotateCcw className="w-3 h-3" />{r.visit_count}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {r.tier && <TierBadge tier={r.tier as Tier} />}
        <PipRating rating={r.rating} size="sm" />
      </div>
    </Link>
  )
}

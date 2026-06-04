'use client'

import Link from 'next/link'
import { MapPin, ChevronRight } from 'lucide-react'
import { TierBadge } from '@/components/ui/badge'
import { CUISINE_EMOJI } from '@/types'
import type { Restaurant, Tier } from '@/types'

function StatusPill({ status }: { status: 'want_to_try' | 'visited' }) {
  const isVisited = status === 'visited'
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border flex-shrink-0 whitespace-nowrap ${
        isVisited
          ? 'bg-green-500/10 text-green-400 border-green-500/30'
          : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      }`}
    >
      {isVisited ? 'Visited' : 'Want to Try'}
    </span>
  )
}

export function RestaurantCard({ restaurant: r }: { restaurant: Restaurant }) {
  const emoji = CUISINE_EMOJI[r.cuisine ?? ''] ?? '🍽️'
  const isLowRating = r.rating !== null && r.rating <= 2

  return (
    <Link
      href={`/restaurants/${r.id}`}
      className="block bg-espresso-800 border border-espresso-700/60 rounded-2xl overflow-hidden hover:border-espresso-600 hover:bg-espresso-800/80 active:bg-espresso-700/40 transition-all"
    >
      <div className="flex items-start gap-3.5 p-4">

        {/* Cuisine emoji circle */}
        <div className="w-11 h-11 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0 text-xl leading-none mt-0.5">
          {emoji}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* Name + status */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-[15px] font-bold text-espresso-50 leading-snug flex-1 min-w-0">
              {r.name}
            </h3>
            <StatusPill status={r.status} />
          </div>

          {/* Cuisine */}
          {r.cuisine && (
            <p className="text-sm text-espresso-400 mb-1.5 truncate">{r.cuisine}</p>
          )}

          {/* Address */}
          {(r.suburb || r.address) && (
            <div className="flex items-center gap-1 mb-2.5">
              <MapPin className="w-3 h-3 text-espresso-600 flex-shrink-0" />
              <p className="text-xs text-espresso-500 truncate">
                {r.suburb ?? r.address}
              </p>
            </div>
          )}

          {/* Footer chips */}
          {(r.rating !== null || r.tier || r.price_level) && (
            <div className="flex items-center gap-2 flex-wrap">
              {r.rating !== null && (
                <div className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 border text-xs font-bold ${
                  isLowRating
                    ? 'bg-red-500/10 border-red-500/25 text-red-400'
                    : 'bg-espresso-700/60 border-espresso-600/50 text-espresso-100'
                }`}>
                  <span className={isLowRating ? 'text-red-400' : 'text-gold-400'}>★</span>
                  {r.rating.toFixed(1)}
                </div>
              )}
              {r.tier && <TierBadge tier={r.tier as Tier} />}
              {r.price_level && (
                <span className="inline-flex items-center text-xs font-semibold text-espresso-400 bg-espresso-700/40 border border-espresso-600/40 rounded-lg px-2 py-0.5">
                  {r.price_level}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Chevron */}
        <ChevronRight className="w-4 h-4 text-espresso-700 flex-shrink-0 mt-1" />
      </div>
    </Link>
  )
}

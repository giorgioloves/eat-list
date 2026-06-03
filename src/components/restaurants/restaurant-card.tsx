'use client'

import Link from 'next/link'
import { MapPin, RotateCcw } from 'lucide-react'
import { StatusBadge, TierBadge } from '@/components/ui/badge'
import { PipRating } from '@/components/ui/pip-rating'
import type { Restaurant } from '@/types'

export function RestaurantCard({ restaurant: r }: { restaurant: Restaurant }) {
  return (
    <Link
      href={`/restaurants/${r.id}`}
      className="bg-espresso-800 border border-espresso-700 rounded-xl p-4 hover:border-espresso-600 hover:bg-espresso-700/40 transition-all group flex flex-col"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-espresso-50 text-sm group-hover:text-gold-300 transition-colors leading-tight">
            {r.name}
          </h3>
          {r.cuisine && <p className="text-xs text-espresso-400 mt-0.5">{r.cuisine}</p>}
        </div>
        {r.tier && <TierBadge tier={r.tier} />}
      </div>

      {(r.address || r.suburb) && (
        <div className="flex items-center gap-1 text-xs text-espresso-400 mb-2">
          <MapPin className="w-3 h-3" />
          {[r.address, r.suburb].filter(Boolean).join(', ')}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap mt-auto pt-2 border-t border-espresso-700">
        <StatusBadge status={r.status} />
        <PipRating rating={r.rating} size="sm" />
        {r.visit_count >= 2 && (
          <span className="flex items-center gap-0.5 text-xs text-espresso-500">
            <RotateCcw className="w-3 h-3" />
            {r.visit_count}
          </span>
        )}
      </div>
    </Link>
  )
}

'use client'

import dynamic from 'next/dynamic'
import type { Restaurant } from '@/types'

const MapView = dynamic(
  () => import('@/components/map/map-view').then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-full bg-espresso-800 border border-espresso-700 rounded-2xl flex items-center justify-center">
        <div className="flex items-center gap-2 text-espresso-400 text-sm">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading map…
        </div>
      </div>
    ),
  }
)

export function MapClient({ restaurants }: { restaurants: Restaurant[] }) {
  return <MapView restaurants={restaurants} />
}

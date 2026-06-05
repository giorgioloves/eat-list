'use client'

import dynamic from 'next/dynamic'
import type { Restaurant } from '@/types'

const MapView = dynamic(
  () => import('@/components/map/map-view').then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: '100%', backgroundColor: '#ede5d8', border: '0.5px solid #c4b8a8', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 9, color: '#a08070', letterSpacing: '0.08em' }}>
          <svg style={{ animation: 'spin 1s linear infinite', width: 14, height: 14 }} fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          loading map…
        </div>
      </div>
    ),
  }
)

export function MapClient({ restaurants }: { restaurants: Restaurant[] }) {
  return <MapView restaurants={restaurants} />
}

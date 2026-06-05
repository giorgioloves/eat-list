import sql from '@/lib/db'
import { MapClient } from './map-client'
import type { Restaurant } from '@/types'

export default async function MapPage() {
  const restaurants = await sql`
    SELECT id, name, cuisine, address, suburb, city, status, tier, rating, latitude, longitude, visit_count, website, instagram
    FROM restaurants
  `

  const all = (restaurants as unknown as Restaurant[]).map(r => ({
    ...r,
    rating: r.rating !== null ? parseFloat(r.rating as unknown as string) : null,
  }))
  const mapped = all.filter((r) => r.latitude && r.longitude).length

  return (
    <div className="flex flex-col h-[100dvh] lg:h-screen p-4 sm:p-6">
      <div className="mb-4 flex-shrink-0">
        <h1 style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: 22, fontWeight: 400, color: '#3b2f27', margin: 0 }}>map</h1>
        <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 9, color: '#a08070', marginTop: 4, letterSpacing: '0.08em' }}>
          {mapped} of {all.length} restaurants have location data
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <MapClient restaurants={all} />
      </div>
    </div>
  )
}

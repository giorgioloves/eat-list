import { Suspense } from 'react'
import sql from '@/lib/db'
import { RestaurantHeader } from './restaurant-header'
import { VisitLog } from './visit-log'
import { NoteLog } from './note-log'
import type { RestaurantVisit, RestaurantNote } from '@/types'

const T = {
  linen:  '#ede5d8',
  border: '#c4b8a8',
}

async function VisitsSection({ restaurantId }: { restaurantId: string }) {
  const rawVisits = await sql`
    SELECT * FROM restaurant_visits
    WHERE restaurant_id = ${restaurantId}
    ORDER BY visited_at DESC NULLS LAST`
  const visits = (rawVisits as any[]).map(v => ({
    ...v,
    rating: v.rating !== null ? parseFloat(v.rating) : null,
  }))
  return <VisitLog restaurantId={restaurantId} visits={visits as unknown as RestaurantVisit[]} />
}

async function NotesSection({ restaurantId }: { restaurantId: string }) {
  const notes = await sql`
    SELECT * FROM restaurant_notes
    WHERE restaurant_id = ${restaurantId}
    ORDER BY created_at DESC`
  return <NoteLog restaurantId={restaurantId} notes={notes as unknown as RestaurantNote[]} />
}

function SectionSkeleton() {
  return (
    <div style={{
      backgroundColor: T.linen,
      border:          `0.5px solid ${T.border}`,
      borderRadius:    10,
      height:          72,
    }} />
  )
}

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div style={{ padding: '16px 16px 112px', maxWidth: 540, margin: '0 auto' }}>

      <RestaurantHeader id={id} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
        <Suspense fallback={<SectionSkeleton />}>
          <VisitsSection restaurantId={id} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <NotesSection restaurantId={id} />
        </Suspense>
      </div>
    </div>
  )
}

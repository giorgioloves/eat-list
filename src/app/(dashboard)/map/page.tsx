import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MapClient } from './map-client'
import type { Restaurant } from '@/types'

export default async function MapPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memberships } = await supabase
    .from('shared_list_members')
    .select('list_id')
    .eq('user_id', user.id)

  if (!memberships || memberships.length === 0) redirect('/dashboard')

  const listId = memberships[0].list_id

  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('id, name, cuisine, address, suburb, city, status, tier, rating, latitude, longitude, visit_count')
    .eq('list_id', listId)

  const all = (restaurants || []) as Restaurant[]
  const mapped = all.filter((r) => r.latitude && r.longitude).length

  return (
    <div className="flex flex-col h-[100dvh] lg:h-screen p-4 sm:p-6">
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-xl font-bold text-espresso-50">Map</h1>
        <p className="text-sm text-espresso-300 mt-0.5">
          {mapped} of {all.length} restaurants have location data
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <MapClient restaurants={all} />
      </div>
    </div>
  )
}

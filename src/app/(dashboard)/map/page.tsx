import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser, getListId } from '@/lib/auth'
import { MapClient } from './map-client'
import type { Restaurant } from '@/types'

export default async function MapPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const listId = await getListId(user.id)
  if (!listId) redirect('/dashboard')

  const supabase = await createClient()
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('id, name, cuisine, address, suburb, city, status, tier, rating, latitude, longitude, visit_count, website, instagram')
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

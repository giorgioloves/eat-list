import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TierBoardDynamic } from './tier-board-dynamic'
import type { Restaurant } from '@/types'

export default async function TiersPage() {
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
    .select('id, name, cuisine, status, tier, rating, visit_count, suburb')
    .eq('list_id', listId)
    .eq('status', 'visited')
    .order('name')

  const all = (restaurants || []) as Restaurant[]

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-espresso-50">Tier List</h1>
        <p className="text-sm text-espresso-300 mt-0.5">Drag restaurants between tiers · saves automatically</p>
      </div>

      {all.length === 0 ? (
        <div className="text-center py-16 bg-espresso-800 border border-espresso-700 rounded-2xl">
          <p className="text-espresso-300">Add some restaurants first to build your tier list</p>
        </div>
      ) : (
        <TierBoardDynamic restaurants={all} />
      )}
    </div>
  )
}

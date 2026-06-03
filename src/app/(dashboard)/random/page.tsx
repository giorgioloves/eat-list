import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RandomPicker } from './random-client'
import type { Restaurant } from '@/types'

export default async function RandomPage() {
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
    .select('*')
    .eq('list_id', listId)
    .order('name')

  const all = (restaurants || []) as Restaurant[]

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-espresso-50">What Should We Eat Tonight?</h1>
        <p className="text-sm text-espresso-300 mt-0.5">Let fate decide your next meal</p>
      </div>
      <RandomPicker restaurants={all} />
    </div>
  )
}

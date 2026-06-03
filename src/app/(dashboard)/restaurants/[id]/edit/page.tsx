import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { RestaurantForm } from '@/components/restaurants/restaurant-form'
import { ArrowLeft } from 'lucide-react'
import type { Restaurant } from '@/types'

export default async function EditRestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memberships } = await supabase
    .from('shared_list_members')
    .select('list_id')
    .eq('user_id', user.id)

  if (!memberships || memberships.length === 0) redirect('/dashboard')

  const listId = memberships[0].list_id

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single()

  if (!restaurant) notFound()

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/restaurants/${id}`}
          className="p-1.5 rounded-lg text-espresso-300 hover:text-espresso-50 hover:bg-espresso-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-espresso-50">Edit Restaurant</h1>
          <p className="text-sm text-espresso-300 mt-0.5">{(restaurant as Restaurant).name}</p>
        </div>
      </div>

      <div className="bg-espresso-800 border border-espresso-700 rounded-2xl p-4 sm:p-6">
        <RestaurantForm
          listId={listId}
          userId={user.id}
          restaurant={restaurant as Restaurant}
        />
      </div>
    </div>
  )
}

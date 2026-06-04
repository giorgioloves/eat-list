import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser, getListId } from '@/lib/auth'
import { RestaurantForm } from '@/components/restaurants/restaurant-form'
import { ArrowLeft } from 'lucide-react'
import type { Restaurant } from '@/types'

export default async function EditRestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const listId = await getListId(user.id)
  if (!listId) redirect('/dashboard')

  const supabase = await createClient()
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

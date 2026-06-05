import { notFound } from 'next/navigation'
import Link from 'next/link'
import sql from '@/lib/db'
import { RestaurantForm } from '@/components/restaurants/restaurant-form'
import { ArrowLeft } from 'lucide-react'
import type { Restaurant } from '@/types'

export default async function EditRestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const rows = await sql`SELECT * FROM restaurants WHERE id = ${id}`
  const restaurant = rows[0]
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
          <p className="text-sm text-espresso-300 mt-0.5">{(restaurant as unknown as Restaurant).name}</p>
        </div>
      </div>

      <div className="bg-espresso-800 border border-espresso-700 rounded-2xl p-4 sm:p-6">
        <RestaurantForm restaurant={restaurant as unknown as Restaurant} />
      </div>
    </div>
  )
}

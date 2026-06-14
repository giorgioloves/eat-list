import sql from '@/lib/db'
import { RestaurantProvider } from '@/contexts/restaurants'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import type { Restaurant } from '@/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const rows = await sql`SELECT * FROM restaurants ORDER BY created_at DESC`
  const initialRestaurants: Restaurant[] = rows.map((r: any) => ({
    ...r,
    rating:     r.rating     !== null ? parseFloat(r.rating as string)          : null,
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
    updated_at: r.updated_at instanceof Date ? r.updated_at.toISOString() : r.updated_at,
  }))

  return (
    <div className="min-h-screen bg-parchment">
      <Sidebar />
      <RestaurantProvider initialRestaurants={initialRestaurants}>
        <main className="lg:pl-52">
          <div className="min-h-screen pb-20 lg:pb-0">
            {children}
          </div>
        </main>
      </RestaurantProvider>
      <BottomNav />
    </div>
  )
}

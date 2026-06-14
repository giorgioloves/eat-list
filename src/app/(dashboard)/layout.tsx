import sql from '@/lib/db'
import { RestaurantProvider } from '@/contexts/restaurants'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import type { Restaurant } from '@/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const rows = await sql`SELECT * FROM restaurants ORDER BY created_at DESC`
  const initialRestaurants: Restaurant[] = rows.map((r: any) => ({
    ...r,
    rating: r.rating !== null ? parseFloat(r.rating as string) : null,
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

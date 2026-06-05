import { RestaurantProvider } from '@/contexts/restaurants'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-parchment">
      <Sidebar />
      <RestaurantProvider>
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

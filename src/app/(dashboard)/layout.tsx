import { redirect } from 'next/navigation'
import { getAuthUser, getListInfo } from '@/lib/auth'
import { RestaurantProvider } from '@/contexts/restaurants'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const { listId, listName } = await getListInfo(user.id)

  const userInfo = {
    email: user.email || '',
    name: (user.user_metadata?.full_name as string | undefined) || null,
    avatar_url: (user.user_metadata?.avatar_url as string | undefined) || null,
  }

  return (
    <div className="min-h-screen bg-espresso-900">
      <Sidebar user={userInfo} />
      <RestaurantProvider listId={listId} listName={listName}>
        <main className="lg:pl-56">
          <div className="min-h-screen pb-20 lg:pb-0">
            {children}
          </div>
        </main>
      </RestaurantProvider>
      <BottomNav />
    </div>
  )
}

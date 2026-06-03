import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', user.id)
    .single()

  const userInfo = {
    email: user.email || '',
    name: profile?.name || null,
    avatar_url: profile?.avatar_url || null,
  }

  return (
    <div className="min-h-screen bg-espresso-900">
      <Sidebar user={userInfo} />
      <main className="lg:pl-56">
        <div className="min-h-screen pb-20 lg:pb-0">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

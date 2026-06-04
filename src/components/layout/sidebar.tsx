'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  UtensilsCrossed, LayoutDashboard, List, Map, BarChart3,
  Shuffle, Layers, LogOut, Settings
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/restaurants', label: 'Restaurants', icon: List },
  { href: '/tiers', label: 'Tier List', icon: Layers },
  { href: '/map', label: 'Map', icon: Map },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
  { href: '/random', label: 'Random Pick', icon: Shuffle },
]

interface SidebarProps {
  user: { email: string; name: string | null; avatar_url: string | null }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-56 bg-espresso-900 border-r border-espresso-700 z-30">
      <div className="p-4 border-b border-espresso-700">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gold-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <UtensilsCrossed className="w-4 h-4 text-espresso-900" />
          </div>
          <span className="font-bold text-espresso-50 text-sm">Eat List</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-100',
                'active:scale-95 active:bg-gold-500/20 active:text-gold-300',
                active
                  ? 'bg-gold-500/10 text-gold-400 font-medium'
                  : 'text-espresso-300 hover:text-espresso-50 hover:bg-espresso-700'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-espresso-700 space-y-0.5">
        <Link
          href="/list"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-espresso-300 hover:text-espresso-50 hover:bg-espresso-700 transition-colors"
        >
          <Settings className="w-4 h-4" />
          List Settings
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-espresso-300 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
        <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
          <div className="w-7 h-7 bg-gold-500 rounded-full flex items-center justify-center text-xs font-bold text-espresso-900 flex-shrink-0">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              getInitials(user.name, user.email)
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-espresso-200 truncate">{user.name || 'User'}</p>
            <p className="text-xs text-espresso-400 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, List, Layers, Map, Shuffle } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/restaurants', label: 'List', icon: List },
  { href: '/tiers', label: 'Tiers', icon: Layers },
  { href: '/map', label: 'Map', icon: Map },
  { href: '/random', label: 'Pick', icon: Shuffle },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-espresso-900/95 backdrop-blur border-t border-espresso-700 z-30 pb-safe">
      <div className="flex items-center justify-around px-2 h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-0',
                active ? 'text-gold-400' : 'text-espresso-400 hover:text-espresso-200'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

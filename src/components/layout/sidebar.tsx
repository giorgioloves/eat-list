'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  UtensilsCrossed, LayoutDashboard, List, Map, BarChart3,
  Shuffle, Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard',   label: 'home',        icon: LayoutDashboard },
  { href: '/restaurants', label: 'list',         icon: List            },
  { href: '/tiers',       label: 'tiers',        icon: Layers          },
  { href: '/map',         label: 'map',          icon: Map             },
  { href: '/stats',       label: 'stats',        icon: BarChart3       },
  { href: '/random',      label: 'random pick',  icon: Shuffle         },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-52 bg-parchment border-r z-30" style={{ borderRightColor: '#c4b8a8', borderRightWidth: '0.5px' }}>
      {/* Logo */}
      <div className="p-4" style={{ borderBottom: '0.5px solid #c4b8a8' }}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div style={{
            width: 28, height: 28,
            backgroundColor: '#3b2f27',
            borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <UtensilsCrossed style={{ width: 13, height: 13, color: '#f5f0e8' }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-crimson), Georgia, serif',
            fontSize: 18,
            color: '#3b2f27',
            fontWeight: 400,
          }}>avec</span>
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
                'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-100',
                'active:scale-95',
                active
                  ? 'bg-espresso text-parchment'
                  : 'text-mist hover:text-espresso hover:bg-linen'
              )}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span style={{
                fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
                fontSize:      11,
                letterSpacing: '0.06em',
              }}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

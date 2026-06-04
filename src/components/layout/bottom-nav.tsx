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
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, backgroundColor: '#2B2623', borderTop: '1px solid #4A3E3A', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 8px', height: 64 }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '6px 12px',
                borderRadius: 10,
                minWidth: 0,
                backgroundColor: active ? '#D9B65D' : 'transparent',
                color: active ? '#2B2623' : '#C0B5B0',
                fontWeight: active ? 600 : 400,
              }}
            >
              <Icon style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: 11 }}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

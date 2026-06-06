'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, List, Layers, Map, Shuffle } from 'lucide-react'

const navItems = [
  { href: '/dashboard',   label: 'home',  icon: LayoutDashboard },
  { href: '/restaurants', label: 'list',  icon: List            },
  { href: '/tiers',       label: 'tiers', icon: Layers          },
  { href: '/map',         label: 'map',   icon: Map             },
  { href: '/random',      label: 'pick',  icon: Shuffle         },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav style={{
      position:        'fixed',
      bottom:          0,
      left:            0,
      right:           0,
      zIndex:          200,
      backgroundColor: '#f5f0e8',
      borderTop:       '0.5px solid #c4b8a8',
      paddingBottom:   'env(safe-area-inset-bottom)',
    }}>
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-around',
        padding:        '0 8px',
        height:         68,
      }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              style={{
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                gap:            4,
                padding:        '6px 14px',
                minWidth:       0,
                textDecoration: 'none',
              }}
            >
              <div style={{
                width:           26,
                height:          26,
                borderRadius:    8,
                backgroundColor: active ? '#3b2f27' : 'transparent',
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                flexShrink:      0,
                transition:      'background-color 0.12s',
              }}>
                <Icon style={{
                  width:  15,
                  height: 15,
                  color:  active ? '#f5f0e8' : '#b8a898',
                }} />
              </div>
              <span style={{
                fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
                fontSize: 10,
                color:         active ? '#3b2f27' : '#b8a898',
                letterSpacing: '0.08em',
                lineHeight:    1,
              }}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

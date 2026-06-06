'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { StatusBadge, TierBadge } from '@/components/ui/badge'
import { PipRating } from '@/components/ui/pip-rating'
import { CUISINE_EMOJI } from '@/types'
import type { Restaurant, Tier } from '@/types'

const T = {
  parchment:  '#f5f0e8',
  linen:      '#ede5d8',
  espresso:   '#3b2f27',
  terracotta: '#c4927a',
  stone:      '#c4b8a8',
  mist:       '#a08070',
  ghost:      '#b8a898',
  border:     '#c4b8a8',
}

export function RestaurantCard({ restaurant: r }: { restaurant: Restaurant }) {
  const emoji       = CUISINE_EMOJI[r.cuisine ?? ''] ?? '🍽️'
  const displayName = r.name.replace(/\s*\([^)]+\)\s*$/, '').trim()

  return (
    <Link
      href={`/restaurants/${r.id}`}
      style={{
        display:         'block',
        backgroundColor: T.linen,
        border:          `0.5px solid ${T.border}`,
        borderRadius:    10,
        textDecoration:  'none',
        overflow:        'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 12px 12px 14px' }}>

        {/* Cuisine emoji */}
        <div style={{
          width:           40,
          height:          40,
          borderRadius:    10,
          backgroundColor: T.parchment,
          border:          `0.5px solid ${T.border}`,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          flexShrink:      0,
          fontSize: 20,
          lineHeight:      1,
          marginTop:       2,
        }}>
          {emoji}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Name + status */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
            <span style={{
              fontFamily:   'var(--font-crimson), Georgia, serif',
              fontSize: 17,
              fontWeight:   500,
              color:        T.espresso,
              lineHeight:   1.25,
              flex:         1,
              minWidth:     0,
            }}>{displayName}</span>
            <StatusBadge status={r.status} />
          </div>

          {/* Cuisine */}
          {r.cuisine && (
            <p style={{
              fontFamily:   'var(--font-dm-mono), ui-monospace, monospace',
              fontSize: 11,
              color:        T.mist,
              letterSpacing: '0.06em',
              marginBottom: 4,
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              whiteSpace:   'nowrap',
            }}>{r.cuisine}</p>
          )}

          {/* Location + price */}
          {(r.suburb || r.address || r.price_level) && (
            <p style={{
              fontFamily:   'var(--font-dm-mono), ui-monospace, monospace',
              fontSize: 11,
              color:        T.ghost,
              letterSpacing: '0.06em',
              marginBottom: 6,
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              whiteSpace:   'nowrap',
            }}>
              {[r.suburb ?? r.address, r.price_level].filter(Boolean).join(' · ')}
            </p>
          )}

          {/* Footer chips */}
          {(r.rating !== null || r.tier) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' as const }}>
              {r.rating !== null && <PipRating rating={r.rating} size="sm" />}
              {r.tier && <TierBadge tier={r.tier as Tier} />}
            </div>
          )}
        </div>

        <ChevronRight style={{ width: 15, height: 15, color: T.stone, flexShrink: 0, marginTop: 4 }} />
      </div>
    </Link>
  )
}

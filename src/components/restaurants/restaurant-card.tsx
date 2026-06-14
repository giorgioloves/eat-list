'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { StatusBadge, TierBadge } from '@/components/ui/badge'
import { ScoreRating } from '@/components/ui/pip-rating'
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
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '9px 9px 9px 11px' }}>

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
          marginTop:       1,
        }}>
          {emoji}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Name + status */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
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
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              whiteSpace:   'nowrap',
            }}>{r.cuisine}</p>
          )}

          {/* Suburb · rating (visited) or just suburb (want-to-try) */}
          {r.suburb && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span style={{
                fontFamily:   'var(--font-dm-mono), ui-monospace, monospace',
                fontSize: 11,
                color:        T.ghost,
                letterSpacing: '0.06em',
              }}>{r.suburb}</span>
              {r.status === 'visited' && r.rating !== null && (
                <>
                  <span style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 11, color: T.ghost }}>·</span>
                  <ScoreRating rating={r.rating} size="sm" />
                </>
              )}
            </div>
          )}

          {/* Tier badge */}
          {r.tier && (
            <div style={{ marginTop: 1 }}>
              <TierBadge tier={r.tier as Tier} />
            </div>
          )}
        </div>

        <ChevronRight style={{ width: 15, height: 15, color: T.stone, flexShrink: 0, marginTop: 4 }} />
      </div>
    </Link>
  )
}

'use client'

import { memo } from 'react'
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
  mist:       '#a08070',
  ghost:      '#b8a898',
  border:     '#c4b8a8',
}

const S = {
  link: {
    display:         'block',
    backgroundColor: T.linen,
    border:          `0.5px solid ${T.border}`,
    borderRadius:    10,
    textDecoration:  'none',
    overflow:        'hidden',
  },
  row: {
    display:    'flex',
    alignItems: 'flex-start' as const,
    gap:        9,
    padding:    '9px 9px 9px 11px',
  },
  emojiBox: {
    width:           40,
    height:          40,
    borderRadius:    10,
    backgroundColor: T.parchment,
    border:          `0.5px solid ${T.border}`,
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
    fontSize:        20,
    lineHeight:      1,
    marginTop:       1,
  },
  content: {
    flex:          1,
    minWidth:      0,
    display:       'flex',
    flexDirection: 'column' as const,
    gap:           2,
  },
  titleRow: {
    display:        'flex',
    alignItems:     'flex-start' as const,
    justifyContent: 'space-between',
    gap:            8,
  },
  name: {
    fontFamily: 'var(--font-crimson), Georgia, serif',
    fontSize:   17,
    fontWeight: 500,
    color:      T.espresso,
    lineHeight: 1.25,
    flex:       1,
    minWidth:   0,
  },
  cuisine: {
    fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
    fontSize:      11,
    color:         T.mist,
    letterSpacing: '0.06em',
    overflow:      'hidden',
    textOverflow:  'ellipsis',
    whiteSpace:    'nowrap' as const,
  },
  metaRow: {
    display:    'flex',
    alignItems: 'baseline' as const,
    gap:        5,
  },
  suburb: {
    fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
    fontSize:      11,
    color:         T.ghost,
    letterSpacing: '0.06em',
  },
  dot: {
    fontFamily: 'var(--font-dm-mono), ui-monospace, monospace',
    fontSize:   11,
    color:      T.ghost,
  },
  tierWrapper: {
    marginTop: 1,
  },
  chevron: {
    width:      15,
    height:     15,
    color:      T.border,
    flexShrink: 0,
    marginTop:  4,
  },
}

export const RestaurantCard = memo(function RestaurantCard({ restaurant: r }: { restaurant: Restaurant }) {
  const emoji       = CUISINE_EMOJI[r.cuisine ?? ''] ?? '🍽️'
  const displayName = r.name.replace(/\s*\([^)]+\)\s*$/, '').trim()

  return (
    <Link href={`/restaurants/${r.id}`} style={S.link}>
      <div style={S.row}>

        <div style={S.emojiBox}>{emoji}</div>

        <div style={S.content}>

          <div style={S.titleRow}>
            <span style={S.name}>{displayName}</span>
            <StatusBadge status={r.status} />
          </div>

          {r.cuisine && <p style={S.cuisine}>{r.cuisine}</p>}

          {r.suburb && (
            <div style={S.metaRow}>
              <span style={S.suburb}>{r.suburb}</span>
              {r.status === 'visited' && r.rating !== null && (
                <>
                  <span style={S.dot}>·</span>
                  <ScoreRating rating={r.rating} size="sm" />
                </>
              )}
            </div>
          )}

          {r.tier && (
            <div style={S.tierWrapper}>
              <TierBadge tier={r.tier as Tier} />
            </div>
          )}
        </div>

        <ChevronRight style={S.chevron} />
      </div>
    </Link>
  )
})

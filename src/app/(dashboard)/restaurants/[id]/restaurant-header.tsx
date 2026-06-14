'use client'

import Link from 'next/link'
import { useRestaurants } from '@/contexts/restaurants'
import { StatusBadge, TierBadge } from '@/components/ui/badge'
import { ScoreRating } from '@/components/ui/pip-rating'
import { ArrowLeft, Pencil, MapPin, Globe, Instagram } from 'lucide-react'
import { WouldGoAgainToggle } from './would-go-again'

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

export function RestaurantHeader({ id }: { id: string }) {
  const { restaurants } = useRestaurants()
  const r = restaurants.find(x => x.id === id)

  // The restaurant list is seeded server-side and resolved before this renders,
  // so a miss means either the context hasn't populated yet (transient, render
  // nothing) or the id genuinely doesn't exist.
  if (!r) {
    if (restaurants.length === 0) return null
    return (
      <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 12, color: T.ghost }}>
        restaurant not found
      </p>
    )
  }

  const displayName = r.name.replace(/\s*\([^)]+\)\s*$/, '').trim()

  return (
    <>
      {/* Top nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link
            href="/restaurants"
            style={{
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              width:           30,
              height:          30,
              borderRadius:    7,
              border:          `0.5px solid ${T.border}`,
              backgroundColor: T.linen,
              color:           T.mist,
              textDecoration:  'none',
              flexShrink:      0,
            }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
          </Link>
          <h1 style={{
            fontFamily:   'var(--font-crimson), Georgia, serif',
            fontSize: 20,
            fontWeight:   400,
            color:        T.espresso,
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}>{displayName}</h1>
        </div>
        <Link
          href={`/restaurants/${r.id}/edit`}
          style={{
            display:         'flex',
            alignItems:      'center',
            gap:             5,
            fontFamily:      'var(--font-dm-mono), ui-monospace, monospace',
            fontSize: 11,
            color:           T.mist,
            border:          `0.5px solid ${T.border}`,
            backgroundColor: T.linen,
            padding:         '6px 10px',
            borderRadius:    7,
            textDecoration:  'none',
            letterSpacing:   '0.06em',
          }}
        >
          <Pencil style={{ width: 11, height: 11 }} />
          edit
        </Link>
      </div>

      {/* Header card */}
      <div style={{
        backgroundColor: T.linen,
        border:          `0.5px solid ${T.border}`,
        borderRadius:    10,
        padding:         18,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{
              fontFamily: 'var(--font-crimson), Georgia, serif',
              fontSize: 28,
              fontWeight: 400,
              color:      T.espresso,
              margin:     0,
            }}>{displayName}</h2>
            {r.cuisine && (
              <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 12, color: T.mist, marginTop: 4 }}>
                {r.cuisine}
              </p>
            )}
            {(r.address || r.suburb) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                <MapPin style={{ width: 11, height: 11, color: T.stone, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 11, color: T.ghost }}>
                  {[r.address, r.suburb].filter(Boolean).join(', ')}
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([r.name, r.address, r.suburb].filter(Boolean).join(', '))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 11, color: T.terracotta, textDecoration: 'none', marginLeft: 2 }}
                >
                  ↗
                </a>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
            {r.tier && <TierBadge tier={r.tier} />}
            <ScoreRating rating={r.rating} />
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
          <StatusBadge status={r.status} />
        </div>

        {(r.website || r.instagram) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 12, paddingTop: 12, borderTop: `0.5px solid ${T.border}` }}>
            {r.website && (
              <a
                href={r.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 11, color: T.terracotta, textDecoration: 'none' }}
              >
                <Globe style={{ width: 11, height: 11 }} />
                {r.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').split('/')[0]}
              </a>
            )}
            {r.instagram && (
              <a
                href={`https://www.instagram.com/${r.instagram.replace(/^@/, '')}/`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 11, color: T.mist, textDecoration: 'none' }}
              >
                <Instagram style={{ width: 11, height: 11 }} />
                @{r.instagram.replace(/^@/, '')}
              </a>
            )}
          </div>
        )}

        {r.status === 'visited' && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `0.5px solid ${T.border}` }}>
            <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 10, color: T.mist, letterSpacing: '0.1em', marginBottom: 8 }}>would go again?</p>
            <WouldGoAgainToggle restaurantId={r.id} current={r.would_go_again} />
          </div>
        )}
      </div>
    </>
  )
}

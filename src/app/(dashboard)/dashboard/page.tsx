'use client'

import Link from 'next/link'
import { StatusBadge } from '@/components/ui/badge'
import { PipRating } from '@/components/ui/pip-rating'
import {
  Plus, UtensilsCrossed, ChevronRight,
} from 'lucide-react'
import { useRestaurants } from '@/contexts/restaurants'
import { CUISINE_EMOJI } from '@/types'
import type { Restaurant } from '@/types'

// tokens
const T = {
  parchment:  '#f5f0e8',
  linen:      '#ede5d8',
  espresso:   '#3b2f27',
  terracotta: '#c4927a',
  sage:       '#8a9e8a',
  stone:      '#c4b8a8',
  mist:       '#a08070',
  ghost:      '#b8a898',
  border:     '#c4b8a8',
}

export default function DashboardPage() {
  const { restaurants } = useRestaurants()

  const visited     = restaurants.filter((r) => r.status === 'visited')
  const wishlist    = restaurants.filter((r) => r.status === 'want_to_try')
  const rated       = restaurants.filter((r) => r.rating !== null)
  const visitedPct  = restaurants.length > 0 ? Math.round((visited.length / restaurants.length) * 100) : 0
  const recent      = restaurants.slice(0, 4)

  return (
    <div style={{ padding: '24px 16px 112px', maxWidth: 440, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{
            fontFamily:  'var(--font-crimson), Georgia, serif',
            fontSize: 28,
            fontWeight:  400,
            color:       T.espresso,
            lineHeight:  1.1,
            margin:      0,
          }}>ate together</h1>
          <p style={{
            fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
            fontSize: 12,
            color:         T.mist,
            letterSpacing: '0.1em',
            marginTop:     4,
          }}>your restaurant list</p>
        </div>
        <Link
          href="/restaurants/add"
          aria-label="Add restaurant"
          style={{
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            width:           34,
            height:          34,
            backgroundColor: T.espresso,
            borderRadius:    8,
            flexShrink:      0,
            textDecoration:  'none',
          }}
        >
          <Plus style={{ width: 14, height: 14, color: T.parchment }} />
        </Link>
      </div>

      {/* Hero summary card */}
      <Link href="/stats" style={{ textDecoration: 'none', display: 'block', marginBottom: 20 }}>
        <HeroCard
          total={restaurants.length}
          visited={visited.length}
          wishlist={wishlist.length}
          visitedPct={visitedPct}
        />
      </Link>

      {/* Stats preview */}
      {restaurants.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="stats" href="/stats" linkLabel="view full" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rated.length > 0 && <MiniRatingDistribution rated={rated} />}
            <MiniTopCuisines restaurants={restaurants} />
            {visited.length > 0 && <MiniVisitHighlights restaurants={restaurants} visited={visited} />}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <SectionHeader title="recent" href="/restaurants" linkLabel="view all" />
        {recent.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recent.map((r) => (
              <RecentRow key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{
        fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
        fontSize: 11,
        color:         T.mist,
        letterSpacing: '0.12em',
        textTransform: 'uppercase' as const,
      }}>{title}</span>
      <Link href={href} style={{
        fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
        fontSize: 11,
        color:         T.terracotta,
        letterSpacing: '0.08em',
        textDecoration: 'none',
      }}>{linkLabel} →</Link>
    </div>
  )
}

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 80, stroke = 6 }: { pct: number; size?: number; stroke?: number }) {
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(pct, 100) / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.stone} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={T.sage} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}

// ─── Hero Card ────────────────────────────────────────────────────────────────

function HeroCard({ total, visited, wishlist, visitedPct }: {
  total: number; visited: number; wishlist: number; visitedPct: number
}) {
  return (
    <div style={{
      backgroundColor: T.linen,
      border:          `0.5px solid ${T.border}`,
      borderRadius:    10,
      padding:         '18px 18px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontFamily: 'var(--font-crimson), Georgia, serif',
            fontSize: 52,
            fontWeight: 300,
            color:      T.espresso,
            lineHeight: 1,
          }}>{total}</p>
          <p style={{
            fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
            fontSize: 11,
            color:         T.mist,
            letterSpacing: '0.08em',
            marginTop:     6,
          }}>restaurants tracked</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' as const }}>
            <span style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: 17, color: T.sage }}>
              {visited} visited
            </span>
            <span style={{ color: T.stone, fontSize: 11 }}>·</span>
            <span style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: 17, color: T.terracotta }}>
              {wishlist} to try
            </span>
          </div>
        </div>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <ProgressRing pct={visitedPct} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: 19, fontWeight: 400, color: T.espresso, lineHeight: 1 }}>
                {visitedPct}%
              </p>
              <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 9, color: T.mist, marginTop: 1 }}>
                visited
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Mini Rating Distribution ─────────────────────────────────────────────────

function MiniRatingDistribution({ rated }: { rated: Restaurant[] }) {
  const buckets = [5, 4, 3, 2, 1].map((n) => ({
    stars: n,
    count: rated.filter((r) => Math.round(r.rating ?? 0) === n).length,
  }))
  const max = Math.max(...buckets.map((b) => b.count), 1)

  return (
    <div style={{
      backgroundColor: T.linen,
      border:          `0.5px solid ${T.border}`,
      borderRadius:    10,
      padding:         14,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{
          fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
          fontSize: 11,
          color:         T.mist,
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
        }}>rating distribution</span>
        <span style={{
          fontFamily: 'var(--font-dm-mono), ui-monospace, monospace',
          fontSize: 11,
          color:      T.ghost,
        }}>{rated.length} rated</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {buckets.map(({ stars, count }) => (
          <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 2, width: 50, flexShrink: 0 }}>
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} style={{
                  width:           6,
                  height:          6,
                  borderRadius:    '50%',
                  backgroundColor: i < stars ? T.terracotta : T.stone,
                }} />
              ))}
            </div>
            <div style={{ flex: 1, height: 4, backgroundColor: T.stone, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height:          '100%',
                backgroundColor: T.terracotta,
                borderRadius:    2,
                width:           count > 0 ? `${(count / max) * 100}%` : '0%',
                transition:      'width 0.5s',
              }} />
            </div>
            <span style={{
              fontFamily: 'var(--font-dm-mono), ui-monospace, monospace',
              fontSize: 11,
              color:      T.ghost,
              width:      14,
              textAlign:  'right',
            }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Mini Top Cuisines ────────────────────────────────────────────────────────

function MiniTopCuisines({ restaurants }: { restaurants: Restaurant[] }) {
  const counts: Record<string, number> = {}
  for (const r of restaurants) {
    if (r.cuisine) counts[r.cuisine] = (counts[r.cuisine] || 0) + 1
  }
  const top5 = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  if (top5.length === 0) return null
  const max = top5[0][1]

  return (
    <div style={{
      backgroundColor: T.linen,
      border:          `0.5px solid ${T.border}`,
      borderRadius:    10,
      padding:         14,
    }}>
      <span style={{
        display:       'block',
        fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
        fontSize: 11,
        color:         T.mist,
        letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
        marginBottom:  10,
      }}>top cuisines</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {top5.map(([cuisine, count]) => (
          <div key={cuisine} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, width: 16, textAlign: 'center', flexShrink: 0 }}>
              {CUISINE_EMOJI[cuisine] ?? '🍽️'}
            </span>
            <span style={{
              fontFamily: 'var(--font-dm-mono), ui-monospace, monospace',
              fontSize: 12,
              color:      T.espresso,
              width:      80,
              flexShrink: 0,
              overflow:   'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>{cuisine}</span>
            <div style={{ flex: 1, height: 4, backgroundColor: T.stone, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height:          '100%',
                backgroundColor: T.sage,
                borderRadius:    2,
                width:           `${(count / max) * 100}%`,
                transition:      'width 0.5s',
              }} />
            </div>
            <span style={{
              fontFamily: 'var(--font-dm-mono), ui-monospace, monospace',
              fontSize: 11,
              color:      T.ghost,
              width:      14,
              textAlign:  'right',
            }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Mini Visit Highlights ────────────────────────────────────────────────────

function MiniVisitHighlights({ restaurants, visited }: { restaurants: Restaurant[]; visited: Restaurant[] }) {
  const totalVisits = restaurants.reduce((sum, r) => sum + r.visit_count, 0)
  const mostVisited = visited.length > 0
    ? visited.reduce((best, r) => r.visit_count > best.visit_count ? r : best)
    : null
  const toTryPct = restaurants.length > 0
    ? Math.round(((restaurants.length - visited.length) / restaurants.length) * 100)
    : 0

  return (
    <div style={{
      backgroundColor: T.linen,
      border:          `0.5px solid ${T.border}`,
      borderRadius:    10,
      padding:         14,
    }}>
      <span style={{
        display:       'block',
        fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
        fontSize: 11,
        color:         T.mist,
        letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
        marginBottom:  10,
      }}>visit highlights</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 12, color: T.mist }}>total visits logged</span>
          <span style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: 16, color: T.espresso }}>{totalVisits}</span>
        </div>
        {mostVisited && mostVisited.visit_count > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 12, color: T.mist, flexShrink: 0 }}>most visited</span>
            <span style={{
              fontFamily: 'var(--font-crimson), Georgia, serif',
              fontSize: 16,
              color:      T.espresso,
              overflow:   'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textAlign:  'right',
            }}>
              {mostVisited.name.replace(/\s*\([^)]+\)\s*$/, '').trim()}{' '}
              <span style={{ color: T.ghost, fontStyle: 'normal' }}>×{mostVisited.visit_count}</span>
            </span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 12, color: T.mist }}>still to try</span>
          <span style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: 16, color: T.terracotta, fontStyle: 'italic' }}>{toTryPct}%</span>
        </div>
      </div>
    </div>
  )
}

// ─── Recent Row ───────────────────────────────────────────────────────────────

function RecentRow({ restaurant: r }: { restaurant: Restaurant }) {
  const displayName = r.name.replace(/\s*\([^)]+\)\s*$/, '').trim()
  return (
    <Link
      href={`/restaurants/${r.id}`}
      style={{
        display:         'flex',
        alignItems:      'center',
        gap:             10,
        padding:         '10px 12px',
        backgroundColor: T.linen,
        border:          `0.5px solid ${T.border}`,
        borderRadius:    10,
        textDecoration:  'none',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
          <span style={{
            fontFamily:   'var(--font-crimson), Georgia, serif',
            fontSize: 16,
            fontWeight:   500,
            color:        T.espresso,
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}>{displayName}</span>
          {r.rating !== null && <PipRating rating={r.rating} size="sm" />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' as const }}>
          <StatusBadge status={r.status} />
          {r.cuisine && <span style={{
            fontFamily: 'var(--font-dm-mono), ui-monospace, monospace',
            fontSize: 11,
            color:      T.mist,
          }}>{r.cuisine}</span>}
          {r.price_level && <span style={{
            fontFamily: 'var(--font-dm-mono), ui-monospace, monospace',
            fontSize: 11,
            color:      T.ghost,
          }}>{r.price_level}</span>}
        </div>
      </div>
      <ChevronRight style={{ width: 14, height: 14, color: T.stone, flexShrink: 0 }} />
    </Link>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{
      textAlign:       'center',
      padding:         '40px 16px',
      backgroundColor: T.linen,
      border:          `0.5px solid ${T.border}`,
      borderRadius:    10,
    }}>
      <UtensilsCrossed style={{ width: 28, height: 28, color: T.stone, margin: '0 auto 12px' }} />
      <p style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: 19, color: T.espresso, marginBottom: 4 }}>
        no restaurants yet
      </p>
      <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 12, color: T.mist, marginBottom: 16 }}>
        add your first restaurant to get started
      </p>
      <Link
        href="/restaurants/add"
        style={{
          display:         'inline-flex',
          alignItems:      'center',
          gap:             6,
          backgroundColor: T.espresso,
          color:           T.parchment,
          fontFamily:      'var(--font-crimson), Georgia, serif',
          fontStyle:       'italic',
          fontSize: 17,
          padding:         '8px 20px',
          borderRadius:    20,
          textDecoration:  'none',
        }}
      >
        <Plus style={{ width: 13, height: 13 }} />
        add restaurant
      </Link>
    </div>
  )
}

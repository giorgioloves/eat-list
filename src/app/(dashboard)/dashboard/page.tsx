'use client'

import Link from 'next/link'
import { Plus, UtensilsCrossed } from 'lucide-react'
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

  const visited       = restaurants.filter((r) => r.status === 'visited')
  const wishlist      = restaurants.filter((r) => r.status === 'want_to_try')
  const visitedPct    = restaurants.length > 0 ? Math.round((visited.length / restaurants.length) * 100) : 0
  const recentVisited = [...visited]
    .sort((a, b) => (b.last_visit_date ?? '').localeCompare(a.last_visit_date ?? ''))
    .slice(0, 5)
  const recentAdded   = [...restaurants]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5)
  const wantToTry     = [...wishlist]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5)

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

      {/* Recent — 2×2 grid */}
      {restaurants.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionHeader title="recent" href="/stats" linkLabel="view all" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <RecentColumn label="recently visited" items={recentVisited} type="visited" />
            <RecentColumn label="recently added"   items={recentAdded}   type="added" />
            <RecentColumn label="want to go to"    items={wantToTry}     type="want_to_go" />
            <MiniTopCuisines restaurants={restaurants} />
          </div>
        </div>
      )}

      {restaurants.length === 0 && <EmptyState />}

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

// ─── Mini Top Cuisines ────────────────────────────────────────────────────────

function MiniTopCuisines({ restaurants }: { restaurants: Restaurant[] }) {
  const counts: Record<string, number> = {}
  for (const r of restaurants) {
    if (r.cuisine) counts[r.cuisine] = (counts[r.cuisine] || 0) + 1
  }
  const top5 = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 9)
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

// ─── Recent Columns ───────────────────────────────────────────────────────────

const COLUMN_BADGE: Record<'visited' | 'added' | 'want_to_go', { bg: string; color: string }> = {
  visited:     { bg: '#ddeedd', color: '#2a5a2a' },
  added:       { bg: '#e8e0f0', color: '#4a2a7a' },
  want_to_go:  { bg: '#fce8d8', color: '#7a3820' },
}

function RecentColumn({ label, items, type }: {
  label: string
  items: Restaurant[]
  type: 'visited' | 'added' | 'want_to_go'
}) {
  const badge = COLUMN_BADGE[type]
  return (
    <div style={{ minWidth: 0 }}>
      <span style={{
        display:         'inline-flex',
        alignItems:      'center',
        padding:         '3px 8px',
        borderRadius:    6,
        backgroundColor: badge.bg,
        color:           badge.color,
        fontFamily:      'var(--font-dm-mono), ui-monospace, monospace',
        fontSize: 10,
        letterSpacing:   '0.06em',
        marginBottom:    8,
        whiteSpace:      'nowrap' as const,
      }}>{label}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 10, color: T.ghost, fontStyle: 'italic' }}>
            none yet
          </p>
        ) : items.map((r) => (
          <MiniRestaurantCard key={r.id} restaurant={r} />
        ))}
      </div>
    </div>
  )
}

function MiniRestaurantCard({ restaurant: r }: { restaurant: Restaurant }) {
  const displayName = r.name.replace(/\s*\([^)]+\)\s*$/, '').trim()

  return (
    <Link
      href={`/restaurants/${r.id}`}
      style={{
        display:         'block',
        padding:         '8px 10px',
        backgroundColor: T.linen,
        border:          `0.5px solid ${T.border}`,
        borderRadius:    8,
        textDecoration:  'none',
        minWidth:        0,
        overflow:        'hidden',
      }}
    >
      <p style={{
        fontFamily:   'var(--font-crimson), Georgia, serif',
        fontSize: 15,
        fontWeight:   400,
        color:        T.espresso,
        overflow:     'hidden',
        textOverflow: 'ellipsis',
        whiteSpace:   'nowrap',
        lineHeight:   1.2,
      }}>{displayName}</p>
      {r.cuisine && (
        <p style={{
          fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
          fontSize: 10,
          color:         T.ghost,
          letterSpacing: '0.04em',
          marginTop:     3,
          overflow:      'hidden',
          textOverflow:  'ellipsis',
          whiteSpace:    'nowrap',
        }}>{r.cuisine}</p>
      )}
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

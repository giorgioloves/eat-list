import type { RestaurantStatus, Tier } from '@/types'
import { TIER_ACCENT } from '@/types'

export function StatusBadge({ status }: { status: RestaurantStatus }) {
  const styles = {
    visited:     { bg: '#ddeedd', color: '#2a5a2a' },
    want_to_try: { bg: '#e8e0f0', color: '#4a2a7a' },
  }
  const labels = {
    visited:     'visited',
    want_to_try: 'want to try',
  }
  const s = styles[status]
  return (
    <span style={{
      display:        'inline-flex',
      alignItems:     'center',
      padding:        '2px 7px',
      borderRadius:   8,
      backgroundColor: s.bg,
      color:          s.color,
      fontFamily:     'var(--font-dm-mono), ui-monospace, monospace',
      fontSize:       7,
      fontWeight:     400,
      letterSpacing:  '0.08em',
      whiteSpace:     'nowrap',
    }}>
      {labels[status]}
    </span>
  )
}

export function TierBadge({ tier }: { tier: Tier }) {
  const accent = TIER_ACCENT[tier]
  return (
    <span style={{
      display:         'inline-flex',
      alignItems:      'center',
      justifyContent:  'center',
      width:           22,
      height:          22,
      borderRadius:    4,
      border:          `0.5px solid ${accent}`,
      color:           accent,
      backgroundColor: '#ede5d8',
      fontFamily:      'var(--font-crimson), Georgia, serif',
      fontStyle:       'italic',
      fontSize:        13,
      fontWeight:      500,
      lineHeight:      1,
      flexShrink:      0,
    }}>
      {tier}
    </span>
  )
}

// Generic badge kept for backward compat
export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono border border-stone text-mist bg-linen ${className ?? ''}`}>
      {children}
    </span>
  )
}

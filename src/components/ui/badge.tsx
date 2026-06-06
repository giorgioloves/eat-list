import type { RestaurantStatus, Tier } from '@/types'
import { TIER_ACCENT, TIER_CHIP_BG } from '@/types'

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
      padding:        '4px 9px',
      borderRadius:   9,
      backgroundColor: s.bg,
      color:          s.color,
      fontFamily:     'var(--font-dm-mono), ui-monospace, monospace',
      fontSize: 10,
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
  const bg     = TIER_CHIP_BG[tier]
  return (
    <span style={{
      display:         'inline-flex',
      alignItems:      'center',
      justifyContent:  'center',
      width:           26,
      height:          26,
      borderRadius:    6,
      border:          `0.5px solid ${accent}`,
      color:           accent,
      backgroundColor: bg,
      fontFamily:      'var(--font-crimson), Georgia, serif',
      fontStyle:       'italic',
      fontSize: 16,
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

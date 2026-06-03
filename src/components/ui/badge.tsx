import { cn } from '@/lib/utils'
import { STATUS_COLORS, TIER_COLORS, type RestaurantStatus, type Tier } from '@/types'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'muted'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
        variant === 'default' && 'bg-espresso-700 text-espresso-200 border-espresso-600',
        variant === 'outline' && 'bg-transparent text-espresso-300 border-espresso-500',
        variant === 'muted' && 'bg-espresso-800 text-espresso-400 border-espresso-700',
        className
      )}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: RestaurantStatus }) {
  const labels: Record<RestaurantStatus, string> = {
    want_to_try: 'Want to Try',
    visited: 'Visited',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
        STATUS_COLORS[status]
      )}
    >
      {labels[status]}
    </span>
  )
}

export function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold border',
        TIER_COLORS[tier]
      )}
    >
      {tier}
    </span>
  )
}

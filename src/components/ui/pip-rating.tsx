'use client'

import { cn } from '@/lib/utils'

const MAX = 5

interface PipRatingProps {
  rating: number | null
  size?: 'sm' | 'md'
  className?: string
}

/** Read-only pip display */
export function PipRating({ rating, size = 'md', className }: PipRatingProps) {
  if (rating === null || rating === undefined) return null

  const filled = Math.round(rating)

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: MAX }, (_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full transition-colors',
            size === 'sm' ? 'w-1.5 h-1.5' : 'w-2.5 h-2.5',
            i < filled ? 'bg-gold-400' : 'bg-espresso-600'
          )}
        />
      ))}
    </div>
  )
}

interface PipSelectorProps {
  value: number | null
  onChange: (v: number | null) => void
  className?: string
}

/** Interactive pip selector (1–5, click to set / click same to clear) */
export function PipSelector({ value, onChange, className }: PipSelectorProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({ length: MAX }, (_, i) => {
        const pip = i + 1
        const filled = value !== null && pip <= value
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(value === pip ? null : pip)}
            className={cn(
              'w-7 h-7 rounded-full border-2 transition-all hover:scale-110 active:scale-95',
              filled
                ? 'bg-gold-400 border-gold-400'
                : 'bg-transparent border-espresso-500 hover:border-gold-400/60'
            )}
            aria-label={`${pip} pip${pip !== 1 ? 's' : ''}`}
          />
        )
      })}
      {value !== null && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs text-espresso-500 hover:text-espresso-300 transition-colors ml-1"
        >
          clear
        </button>
      )}
    </div>
  )
}

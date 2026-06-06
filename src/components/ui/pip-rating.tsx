'use client'

import { cn } from '@/lib/utils'

const MAX = 5

interface PipRatingProps {
  rating: number | null
  size?: 'sm' | 'md'
  className?: string
}

export function PipRating({ rating, size = 'md', className }: PipRatingProps) {
  if (rating === null || rating === undefined) return null

  const filled = Math.round(rating)
  const dim = size === 'sm' ? 7 : 11

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: MAX }, (_, i) => (
        <div
          key={i}
          style={{
            width:        dim,
            height:       dim,
            borderRadius: '50%',
            flexShrink:   0,
            backgroundColor: i < filled ? '#c4927a' : '#d4c8b8',
            transition:   'background-color 0.15s',
          }}
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

export function PipSelector({ value, onChange, className }: PipSelectorProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({ length: MAX }, (_, i) => {
        const pip    = i + 1
        const filled = value !== null && pip <= value
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(value === pip ? null : pip)}
            style={{
              width:           30,
              height:          30,
              borderRadius:    '50%',
              border:          filled ? '2px solid #c4927a' : '1.5px solid #c4b8a8',
              backgroundColor: filled ? '#c4927a' : 'transparent',
              cursor:          'pointer',
              transition:      'all 0.12s',
            }}
            aria-label={`${pip} pip${pip !== 1 ? 's' : ''}`}
          />
        )
      })}
      {value !== null && (
        <button
          type="button"
          onClick={() => onChange(null)}
          style={{
            fontFamily:  'var(--font-dm-mono), ui-monospace, monospace',
            fontSize: 12,
            color:       '#a08070',
            background:  'none',
            border:      'none',
            cursor:      'pointer',
            marginLeft:  4,
          }}
        >
          clear
        </button>
      )}
    </div>
  )
}

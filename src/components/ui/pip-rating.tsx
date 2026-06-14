'use client'

const T = {
  terracotta: '#c4927a',
  stone:      '#c4b8a8',
  mist:       '#a08070',
  ghost:      '#b8a898',
  espresso:   '#3b2f27',
  linen:      '#ede5d8',
  border:     '#c4b8a8',
}

interface ScoreRatingProps {
  rating: number | null
  size?: 'sm' | 'md'
}

export function ScoreRating({ rating, size = 'md' }: ScoreRatingProps) {
  if (rating === null || rating === undefined) return null
  return (
    <span style={{
      fontFamily: 'var(--font-crimson), Georgia, serif',
      fontStyle:  'italic',
      fontSize:   size === 'sm' ? 14 : 20,
      color:      T.terracotta,
      lineHeight: 1,
    }}>
      {Math.round(rating)}
    </span>
  )
}

interface ScoreSelectorProps {
  value: number | null
  onChange: (v: number | null) => void
}

export function ScoreSelector({ value, onChange }: ScoreSelectorProps) {
  if (value === null) {
    return (
      <button
        type="button"
        onClick={() => onChange(50)}
        style={{
          display:         'inline-flex',
          alignItems:      'center',
          padding:         '5px 12px',
          fontFamily:      'var(--font-dm-mono), ui-monospace, monospace',
          fontSize:        11,
          color:           T.mist,
          backgroundColor: T.linen,
          border:          `0.5px solid ${T.border}`,
          borderRadius:    6,
          cursor:          'pointer',
          letterSpacing:   '0.06em',
        }}
      >
        add score
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          style={{ flex: 1, accentColor: T.terracotta, cursor: 'pointer', height: 4 }}
        />
        <span style={{
          fontFamily: 'var(--font-crimson), Georgia, serif',
          fontStyle:  'italic',
          fontSize:   22,
          color:      T.terracotta,
          minWidth:   32,
          textAlign:  'right',
          lineHeight: 1,
        }}>
          {value}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onChange(null)}
        style={{
          alignSelf:    'flex-start',
          fontFamily:   'var(--font-dm-mono), ui-monospace, monospace',
          fontSize:     11,
          color:        T.mist,
          background:   'none',
          border:       'none',
          cursor:       'pointer',
          padding:      0,
          letterSpacing: '0.06em',
        }}
      >
        clear
      </button>
    </div>
  )
}

// Backward-compat aliases so any missed import site still compiles
export const PipRating   = ScoreRating
export const PipSelector = ScoreSelector

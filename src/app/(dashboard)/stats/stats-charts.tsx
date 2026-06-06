'use client'

import { CUISINE_EMOJI } from '@/types'

const T = {
  espresso:   '#3b2f27',
  terracotta: '#c4927a',
  sage:       '#8a9e8a',
  stone:      '#c4b8a8',
  mist:       '#a08070',
  ghost:      '#b8a898',
}

interface RatingBucket {
  label: string
  count: number
}

interface CuisineEntry {
  name: string
  value: number
}

export function RatingDistributionChart({ buckets }: { buckets: RatingBucket[] }) {
  const max = Math.max(...buckets.map(b => b.count), 1)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
      {buckets.map((bucket, i) => {
        const heightPct = bucket.count > 0 ? Math.max((bucket.count / max) * 100, 6) : 0
        const isMax = bucket.count === max && max > 0

        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontFamily: 'var(--font-dm-mono), ui-monospace, monospace',
              fontSize: 10,
              color:      T.mist,
              height:     14,
              lineHeight: 1,
            }}>
              {bucket.count > 0 ? bucket.count : ''}
            </span>
            <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', height: 70 }}>
              <div style={{
                width:           '100%',
                borderRadius:    '4px 4px 0 0',
                backgroundColor: isMax ? T.terracotta : T.stone,
                height:          `${heightPct}%`,
                transition:      'height 0.5s',
              }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: 10, color: T.terracotta, opacity: 0.7 }}>{'●'.repeat(i + 1)}</span>
              <span style={{
                fontFamily: 'var(--font-dm-mono), ui-monospace, monospace',
                fontSize: 10,
                color:      T.ghost,
              }}>{bucket.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function CuisineBarList({ data }: { data: CuisineEntry[] }) {
  const max = Math.max(...data.map(d => d.value), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((item, i) => {
        const widthPct = (item.value / max) * 100
        const emoji = CUISINE_EMOJI[item.name] ?? '🍽️'

        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, width: 18, textAlign: 'center', flexShrink: 0, lineHeight: 1 }}>{emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{
                  fontFamily:   'var(--font-dm-mono), ui-monospace, monospace',
                  fontSize: 10,
                  color:        T.espresso,
                  overflow:     'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace:   'nowrap',
                }}>{item.name}</span>
                <span style={{
                  fontFamily: 'var(--font-dm-mono), ui-monospace, monospace',
                  fontSize: 10,
                  color:      T.ghost,
                  marginLeft: 8,
                  flexShrink: 0,
                }}>{item.value}</span>
              </div>
              <div style={{ height: 4, backgroundColor: T.stone, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height:          '100%',
                  backgroundColor: T.sage,
                  borderRadius:    2,
                  width:           `${widthPct}%`,
                  transition:      'width 0.5s',
                }} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

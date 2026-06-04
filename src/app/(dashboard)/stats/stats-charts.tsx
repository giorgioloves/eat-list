'use client'

import { CUISINE_EMOJI } from '@/types'

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
    <div className="flex items-end gap-2.5">
      {buckets.map((bucket, i) => {
        const heightPct = bucket.count > 0 ? Math.max((bucket.count / max) * 100, 6) : 0
        const isMax = bucket.count === max && max > 0

        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <span className="text-xs text-espresso-400 h-4 leading-none">
              {bucket.count > 0 ? bucket.count : ''}
            </span>
            <div className="w-full flex items-end" style={{ height: 80 }}>
              <div
                className={`w-full rounded-t-lg transition-all duration-500 ${
                  isMax ? 'bg-gold-500' : 'bg-espresso-600/80'
                }`}
                style={{ height: `${heightPct}%` }}
              />
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] text-gold-500/60">{'★'.repeat(i + 1)}</span>
              <span className="text-[10px] text-espresso-500">{bucket.label}</span>
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
    <div className="space-y-3.5">
      {data.map((item, i) => {
        const widthPct = (item.value / max) * 100
        const emoji = CUISINE_EMOJI[item.name] ?? '🍽️'

        return (
          <div key={i} className="flex items-center gap-3">
            <span className="text-base w-6 text-center flex-shrink-0 leading-none">{emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-espresso-100 truncate">{item.name}</span>
                <span className="text-xs text-espresso-500 ml-3 flex-shrink-0 tabular-nums">
                  {item.value}
                </span>
              </div>
              <div className="h-1.5 bg-espresso-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-500/70 rounded-full transition-all duration-500"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

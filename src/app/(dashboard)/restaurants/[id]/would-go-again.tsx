'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { setWouldGoAgain } from './actions'
import type { WouldGoAgain } from '@/types'

const OPTIONS: { value: WouldGoAgain; label: string }[] = [
  { value: 'definitely', label: 'Definitely' },
  { value: 'maybe',      label: 'Maybe' },
  { value: 'no',         label: 'No' },
]

export function WouldGoAgainToggle({
  restaurantId,
  current,
}: {
  restaurantId: string
  current: WouldGoAgain | null
}) {
  const [value, setValue] = useState<WouldGoAgain | null>(current)
  const [saving, setSaving] = useState(false)

  async function handleSelect(next: WouldGoAgain) {
    const newVal = next === value ? null : next
    setSaving(true)
    setValue(newVal)
    await setWouldGoAgain(restaurantId, newVal)
    setSaving(false)
  }

  return (
    <div className={cn('flex gap-2', saving && 'opacity-60 pointer-events-none')}>
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => handleSelect(o.value)}
          className={cn(
            'px-3 py-1 text-xs rounded-lg border transition-colors',
            value === o.value
              ? o.value === 'definitely'
                ? 'bg-green-500/20 border-green-500/40 text-green-400'
                : o.value === 'maybe'
                ? 'bg-gold-500/20 border-gold-500/40 text-gold-400'
                : 'bg-red-500/20 border-red-500/40 text-red-400'
              : 'bg-transparent border-espresso-600 text-espresso-400 hover:border-espresso-500 hover:text-espresso-200'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

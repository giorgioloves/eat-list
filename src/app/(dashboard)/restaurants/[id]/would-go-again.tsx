'use client'

import { useState } from 'react'
import { setWouldGoAgain } from './actions'
import type { WouldGoAgain } from '@/types'

export function WouldGoAgainToggle({
  restaurantId,
  current,
}: {
  restaurantId: string
  current: WouldGoAgain | null
}) {
  const [checked, setChecked] = useState(current !== null)
  const [saving, setSaving] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.checked
    setChecked(next)
    setSaving(true)
    await setWouldGoAgain(restaurantId, next ? 'definitely' : null)
    setSaving(false)
  }

  return (
    <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={saving}
        className="w-4 h-4 rounded accent-gold-500 cursor-pointer disabled:opacity-50"
      />
      <span className="text-sm text-espresso-200">Want to go again</span>
    </label>
  )
}

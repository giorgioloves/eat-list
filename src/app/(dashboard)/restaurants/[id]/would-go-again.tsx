'use client'

import { useState } from 'react'
import { setWouldGoAgain } from './actions'
import type { WouldGoAgain } from '@/types'

const T = {
  espresso: '#3b2f27',
  stone:    '#c4b8a8',
  mist:     '#a08070',
}

export function WouldGoAgainToggle({
  restaurantId,
  current,
}: {
  restaurantId: string
  current: WouldGoAgain | null
}) {
  const [checked, setChecked] = useState(current !== null)
  const [saving, setSaving]   = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.checked
    setChecked(next)
    setSaving(true)
    await setWouldGoAgain(restaurantId, next ? 'definitely' : null)
    setSaving(false)
  }

  return (
    <label style={{
      display:    'flex',
      alignItems: 'center',
      gap:        8,
      cursor:     'pointer',
      userSelect: 'none',
      width:      'fit-content',
      opacity:    saving ? 0.6 : 1,
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={saving}
        style={{
          width:       13,
          height:      13,
          borderRadius: 3,
          border:      `1px solid ${T.stone}`,
          accentColor: T.espresso,
          cursor:      'pointer',
          flexShrink:  0,
        }}
      />
      <span style={{
        fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
        fontSize: 11,
        color:         T.mist,
        letterSpacing: '0.06em',
      }}>want to go again</span>
    </label>
  )
}

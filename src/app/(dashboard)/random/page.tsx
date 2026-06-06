'use client'

import { RandomPicker } from './random-client'
import { useRestaurants } from '@/contexts/restaurants'

const T = {
  espresso: '#3b2f27',
  mist:     '#a08070',
}

export default function RandomPage() {
  const { restaurants } = useRestaurants()

  return (
    <div style={{ padding: '24px 16px 112px', maxWidth: 440, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{
          fontFamily: 'var(--font-crimson), Georgia, serif',
          fontSize: 30,
          fontWeight: 400,
          fontStyle:  'italic',
          color:      T.espresso,
          lineHeight: 1.1,
          margin:     0,
        }}>where tonight?</h1>
        <p style={{
          fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
          fontSize: 11,
          color:         T.mist,
          letterSpacing: '0.1em',
          marginTop:     4,
        }}>let fate decide your next meal</p>
      </div>
      <RandomPicker restaurants={restaurants} />
    </div>
  )
}

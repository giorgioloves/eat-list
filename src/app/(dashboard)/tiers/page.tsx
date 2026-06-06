'use client'

import { useState } from 'react'
import { Lock, LockOpen } from 'lucide-react'
import { TierBoardDynamic } from './tier-board-dynamic'
import { useRestaurants } from '@/contexts/restaurants'

const T = {
  parchment: '#f5f0e8',
  linen:     '#ede5d8',
  espresso:  '#3b2f27',
  terracotta:'#c4927a',
  stone:     '#c4b8a8',
  mist:      '#a08070',
  border:    '#c4b8a8',
}

export default function TiersPage() {
  const { restaurants } = useRestaurants()
  const visited = restaurants.filter((r) => r.status === 'visited')
  const [editing, setEditing] = useState(false)

  return (
    <div style={{ padding: '24px 16px 112px', maxWidth: 680, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-crimson), Georgia, serif',
            fontSize: 30,
            fontWeight: 400,
            color:      T.espresso,
            lineHeight: 1.1,
            margin:     0,
          }}>tier list</h1>
          <p style={{
            fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
            fontSize: 11,
            color:         editing ? T.terracotta : T.mist,
            letterSpacing: '0.1em',
            marginTop:     4,
          }}>
            {editing ? 'drag to rearrange · saves automatically' : 'locked · tap edit to rearrange'}
          </p>
        </div>

        <button
          onClick={() => setEditing(!editing)}
          style={{
            display:         'flex',
            alignItems:      'center',
            gap:             6,
            fontFamily:      'var(--font-dm-mono), ui-monospace, monospace',
            fontSize:        11,
            letterSpacing:   '0.08em',
            padding:         '7px 12px',
            borderRadius:    8,
            border:          `0.5px solid ${editing ? T.terracotta : T.border}`,
            backgroundColor: editing ? T.terracotta : T.linen,
            color:           editing ? T.parchment : T.mist,
            cursor:          'pointer',
            flexShrink:      0,
            marginTop:       2,
            transition:      'all 0.15s',
          }}
        >
          {editing
            ? <Lock style={{ width: 13, height: 13 }} />
            : <LockOpen style={{ width: 13, height: 13 }} />
          }
          {editing ? 'lock' : 'edit'}
        </button>
      </div>

      {visited.length === 0 ? (
        <div style={{
          textAlign:       'center',
          padding:         '48px 16px',
          backgroundColor: T.linen,
          border:          `0.5px solid ${T.border}`,
          borderRadius:    10,
          fontFamily:      'var(--font-dm-mono), ui-monospace, monospace',
          fontSize: 11,
          color:           T.mist,
          letterSpacing:   '0.08em',
        }}>
          add some visited restaurants first to build your tier list
        </div>
      ) : (
        <TierBoardDynamic restaurants={visited} editing={editing} />
      )}
    </div>
  )
}

'use client'

import { TierBoardDynamic } from './tier-board-dynamic'
import { useRestaurants } from '@/contexts/restaurants'

const T = {
  linen:   '#ede5d8',
  espresso: '#3b2f27',
  stone:   '#c4b8a8',
  mist:    '#a08070',
  border:  '#c4b8a8',
}

export default function TiersPage() {
  const { restaurants } = useRestaurants()
  const visited = restaurants.filter((r) => r.status === 'visited')

  return (
    <div style={{ padding: '24px 16px 112px', maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
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
          color:         T.mist,
          letterSpacing: '0.1em',
          marginTop:     4,
        }}>drag restaurants between tiers · saves automatically</p>
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
        <TierBoardDynamic restaurants={visited} />
      )}
    </div>
  )
}

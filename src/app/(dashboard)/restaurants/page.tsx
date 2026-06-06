'use client'

import Link from 'next/link'
import { Plus, UtensilsCrossed } from 'lucide-react'
import RestaurantListClient from './list-client'
import { useRestaurants } from '@/contexts/restaurants'

const T = {
  parchment:  '#f5f0e8',
  linen:      '#ede5d8',
  espresso:   '#3b2f27',
  terracotta: '#c4927a',
  stone:      '#c4b8a8',
  mist:       '#a08070',
  border:     '#c4b8a8',
}

export default function RestaurantsPage() {
  const { restaurants, loading } = useRestaurants()

  return (
    <div style={{ padding: '24px 16px 112px', maxWidth: 440, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-crimson), Georgia, serif',
            fontSize: 30,
            fontWeight: 400,
            color:      T.espresso,
            lineHeight: 1.1,
            margin:     0,
          }}>restaurants</h1>
          {!loading && (
            <p style={{
              fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
              fontSize: 11,
              color:         T.mist,
              letterSpacing: '0.1em',
              marginTop:     4,
            }}>
              {restaurants.length} {restaurants.length === 1 ? 'place' : 'places'}
            </p>
          )}
        </div>
        <Link
          href="/restaurants/add"
          aria-label="Add restaurant"
          style={{
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            width:           34,
            height:          34,
            backgroundColor: T.espresso,
            borderRadius:    8,
            flexShrink:      0,
            textDecoration:  'none',
          }}
        >
          <Plus style={{ width: 14, height: 14, color: T.parchment }} />
        </Link>
      </div>

      {/* Empty state */}
      {!loading && restaurants.length === 0 ? (
        <div style={{
          textAlign:       'center',
          padding:         '48px 16px',
          backgroundColor: T.linen,
          border:          `0.5px solid ${T.border}`,
          borderRadius:    10,
        }}>
          <UtensilsCrossed style={{ width: 28, height: 28, color: T.stone, margin: '0 auto 12px' }} />
          <p style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: 18, color: T.espresso, marginBottom: 4 }}>
            no restaurants yet
          </p>
          <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 11, color: T.mist, marginBottom: 16 }}>
            add your first restaurant to start building your list
          </p>
          <Link
            href="/restaurants/add"
            style={{
              display:         'inline-flex',
              alignItems:      'center',
              gap:             6,
              backgroundColor: T.espresso,
              color:           T.parchment,
              fontFamily:      'var(--font-crimson), Georgia, serif',
              fontStyle:       'italic',
              fontSize: 16,
              padding:         '8px 20px',
              borderRadius:    20,
              textDecoration:  'none',
            }}
          >
            <Plus style={{ width: 13, height: 13 }} />
            add restaurant
          </Link>
        </div>
      ) : (
        <RestaurantListClient restaurants={restaurants} />
      )}
    </div>
  )
}

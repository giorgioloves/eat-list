import { RestaurantForm } from '@/components/restaurants/restaurant-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const T = {
  parchment:  '#f5f0e8',
  linen:      '#ede5d8',
  espresso:   '#3b2f27',
  stone:      '#c4b8a8',
  mist:       '#a08070',
  border:     '#c4b8a8',
}

export default function AddRestaurantPage() {
  return (
    <div style={{ padding: '16px 16px 112px', maxWidth: 540, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Link
          href="/restaurants"
          style={{
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            width:           30,
            height:          30,
            borderRadius:    7,
            border:          `0.5px solid ${T.border}`,
            backgroundColor: T.linen,
            color:           T.mist,
            textDecoration:  'none',
            flexShrink:      0,
          }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
        </Link>
        <div>
          <h1 style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: 26, fontWeight: 400, color: T.espresso, margin: 0 }}>
            add restaurant
          </h1>
          <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 11, color: T.mist, marginTop: 3, letterSpacing: '0.08em' }}>
            add a new place to your list
          </p>
        </div>
      </div>

      <div style={{
        backgroundColor: T.linen,
        border:          `0.5px solid ${T.border}`,
        borderRadius:    10,
        padding:         '18px 18px 20px',
      }}>
        <RestaurantForm />
      </div>
    </div>
  )
}

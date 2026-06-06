'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { geocodeAddress } from '@/lib/utils'
import { CUISINES, type Restaurant } from '@/types'
import { Trash2 } from 'lucide-react'
import { RestaurantAutocomplete } from '@/components/ui/restaurant-autocomplete'
import { ConfirmModal } from '@/components/ui/modal'
import { useRestaurants } from '@/contexts/restaurants'
import { addRestaurant, updateRestaurant, deleteRestaurant } from '@/app/(dashboard)/restaurants/actions'

const T = {
  parchment:  '#f5f0e8',
  linen:      '#ede5d8',
  espresso:   '#3b2f27',
  terracotta: '#c4927a',
  stone:      '#c4b8a8',
  mist:       '#a08070',
  ghost:      '#b8a898',
  border:     '#c4b8a8',
}

const inputStyle: React.CSSProperties = {
  width:           '100%',
  backgroundColor: T.parchment,
  border:          `0.5px solid ${T.border}`,
  borderRadius:    7,
  padding:         '7px 10px',
  fontFamily:      'var(--font-crimson), Georgia, serif',
  fontSize: 15,
  color:           T.espresso,
  outline:         'none',
  boxSizing:       'border-box',
}

interface RestaurantFormProps {
  restaurant?: Restaurant
}

interface FormData {
  name: string
  cuisine: string
  address: string
  suburb: string
  city: string
  state: string
  lat: number | null
  lng: number | null
  priceLevel: string | null
  website: string
  instagram: string
}

export function RestaurantForm({ restaurant }: RestaurantFormProps) {
  const router = useRouter()
  const { refresh } = useRestaurants()

  const [form, setForm] = useState<FormData>({
    name:       restaurant?.name || '',
    cuisine:    restaurant?.cuisine || '',
    address:    restaurant?.address || '',
    suburb:     restaurant?.suburb || '',
    city:       restaurant?.city || '',
    state:      restaurant?.state || '',
    lat:        restaurant?.latitude ?? null,
    lng:        restaurant?.longitude ?? null,
    priceLevel: restaurant?.price_level ?? null,
    website:    restaurant?.website || '',
    instagram:  restaurant?.instagram || '',
  })

  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [showDelete, setShowDelete]       = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    let lat = form.lat
    let lng = form.lng

    if ((!lat || !lng) && (form.address || form.suburb)) {
      const coords = await geocodeAddress(form.address, form.suburb, form.city)
      if (coords) { lat = coords.lat; lng = coords.lng }
    }

    const payload = {
      name:        form.name.trim(),
      cuisine:     form.cuisine || null,
      address:     form.address || null,
      suburb:      form.suburb || null,
      city:        form.city || null,
      state:       form.state || null,
      latitude:    lat,
      longitude:   lng,
      price_level: form.priceLevel || null,
      website:     form.website || null,
      instagram:   form.instagram || null,
    }

    const result = restaurant
      ? await updateRestaurant(restaurant.id, payload)
      : await addRestaurant(payload)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      await refresh()
      router.push('/restaurants')
    }
  }

  async function handleDelete() {
    setDeleteLoading(true)
    const result = await deleteRestaurant(restaurant!.id)
    if (result.error) {
      setError(result.error)
      setDeleteLoading(false)
      setShowDelete(false)
    } else {
      await refresh()
      router.push('/restaurants')
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gap: 14 }}>
          <Field label="restaurant name" required>
            <RestaurantAutocomplete
              value={form.name}
              onChange={(name) => setForm((prev) => ({ ...prev, name }))}
              onSelect={({ name, street, suburb, city, state, lat, lng, cuisine, priceLevel, website }) =>
                setForm((prev) => ({
                  ...prev,
                  name,
                  address:    street || prev.address,
                  suburb:     suburb || prev.suburb,
                  city:       city || prev.city,
                  state:      state || prev.state,
                  cuisine:    cuisine || prev.cuisine,
                  lat,
                  lng,
                  priceLevel: priceLevel ?? prev.priceLevel,
                  website:    website || prev.website,
                }))
              }
              onInstagramFound={(instagram) => setForm((prev) => ({ ...prev, instagram: prev.instagram || instagram }))}
              required
            />
          </Field>

          <Field label="cuisine">
            <div style={{ position: 'relative' }}>
              <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: form.cuisine ? T.espresso : T.ghost }}>
                  {form.cuisine || 'select cuisine'}
                </span>
              </div>
              <select
                value={form.cuisine}
                onChange={(e) => set('cuisine', e.target.value)}
                style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer' }}
              >
                <option value="">select cuisine</option>
                {CUISINES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </Field>

          <Field label="street & suburb">
            <input
              value={[form.address, form.suburb].filter(Boolean).join(', ')}
              onChange={(e) => {
                const val = e.target.value
                const lastComma = val.lastIndexOf(',')
                if (lastComma === -1) {
                  setForm((prev) => ({ ...prev, address: '', suburb: val.trim(), lat: null, lng: null }))
                } else {
                  setForm((prev) => ({
                    ...prev,
                    address: val.slice(0, lastComma).trim(),
                    suburb:  val.slice(lastComma + 1).trim(),
                    lat:     null,
                    lng:     null,
                  }))
                }
              }}
              placeholder="e.g. 46 Meagher St, Surry Hills"
              style={inputStyle}
            />
          </Field>
        </div>

        {error && (
          <div style={{
            padding:         '10px 12px',
            backgroundColor: 'rgba(196,122,122,0.08)',
            border:          '0.5px solid rgba(196,122,122,0.3)',
            borderRadius:    7,
            fontFamily:      'var(--font-dm-mono), ui-monospace, monospace',
            fontSize: 10,
            color:           '#c47a7a',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
          {restaurant && (
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              style={{
                display:         'flex',
                alignItems:      'center',
                gap:             5,
                padding:         '8px 14px',
                fontFamily:      'var(--font-dm-mono), ui-monospace, monospace',
                fontSize: 10,
                color:           '#c47a7a',
                backgroundColor: 'transparent',
                border:          '0.5px solid rgba(196,122,122,0.4)',
                borderRadius:    7,
                cursor:          'pointer',
                letterSpacing:   '0.06em',
              }}
            >
              <Trash2 style={{ width: 11, height: 11 }} />
              delete
            </button>
          )}
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding:         '8px 14px',
              fontFamily:      'var(--font-dm-mono), ui-monospace, monospace',
              fontSize: 10,
              color:           T.mist,
              backgroundColor: T.linen,
              border:          `0.5px solid ${T.border}`,
              borderRadius:    7,
              cursor:          'pointer',
              letterSpacing:   '0.06em',
            }}
          >
            cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex:            1,
              padding:         '8px 0',
              fontFamily:      'var(--font-crimson), Georgia, serif',
              fontStyle:       'italic',
              fontSize: 18,
              color:           T.parchment,
              backgroundColor: loading ? T.stone : T.espresso,
              border:          'none',
              borderRadius:    20,
              cursor:          loading ? 'not-allowed' : 'pointer',
              opacity:         loading ? 0.7 : 1,
            }}
          >
            {loading ? 'saving…' : restaurant ? 'save changes' : 'add restaurant'}
          </button>
        </div>
      </form>

      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="delete restaurant"
        message={`Are you sure you want to delete "${restaurant?.name}"? This cannot be undone.`}
        confirmLabel="delete"
        danger
        loading={deleteLoading}
      />
    </>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{
        fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
        fontSize: 9,
        color:         T.mist,
        letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
      }}>
        {label}
        {required && <span style={{ color: T.terracotta, marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

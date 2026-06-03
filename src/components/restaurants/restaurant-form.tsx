'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { geocodeAddress } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { CUISINES, type Restaurant } from '@/types'
import { Trash2 } from 'lucide-react'
import { RestaurantAutocomplete } from '@/components/ui/restaurant-autocomplete'
import { ConfirmModal } from '@/components/ui/modal'

interface RestaurantFormProps {
  listId: string
  userId: string
  restaurant?: Restaurant
}

interface FormData {
  name: string
  cuisine: string
  address: string
  suburb: string
  city: string   // not shown — used for geocoding
  lat: number | null
  lng: number | null
  priceLevel: string | null
}

export function RestaurantForm({ listId, userId, restaurant }: RestaurantFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState<FormData>({
    name: restaurant?.name || '',
    cuisine: restaurant?.cuisine || '',
    address: restaurant?.address || '',
    suburb: restaurant?.suburb || '',
    city: restaurant?.city || '',
    lat: restaurant?.latitude ?? null,
    lng: restaurant?.longitude ?? null,
    priceLevel: restaurant?.price_level ?? null,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDelete, setShowDelete] = useState(false)
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

    // Only geocode if we don't have coords from Place selection
    if ((!lat || !lng) && (form.address || form.suburb)) {
      const coords = await geocodeAddress(form.address, form.suburb, form.city)
      if (coords) { lat = coords.lat; lng = coords.lng }
    }

    const basePayload = {
      name: form.name.trim(),
      cuisine: form.cuisine || null,
      address: form.address || null,
      suburb: form.suburb || null,
      city: form.city || null,
      latitude: lat,
      longitude: lng,
      price_level: form.priceLevel || null,
    }

    let err
    if (restaurant) {
      const result = await supabase
        .from('restaurants')
        .update({ ...basePayload, updated_at: new Date().toISOString() })
        .eq('id', restaurant.id)
      err = result.error
    } else {
      const result = await supabase.from('restaurants').insert({
        ...basePayload,
        list_id: listId,
        created_by: userId,
        status: 'want_to_try',
      })
      err = result.error
    }

    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      router.push('/restaurants')
      router.refresh()
    }
  }

  async function handleDelete() {
    setDeleteLoading(true)
    const { error } = await supabase.from('restaurants').delete().eq('id', restaurant!.id)
    if (error) {
      setError(error.message)
      setDeleteLoading(false)
      setShowDelete(false)
    } else {
      router.push('/restaurants')
      router.refresh()
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4">
          <Field label="Restaurant name" required>
            <RestaurantAutocomplete
              value={form.name}
              onChange={(name) => setForm((prev) => ({ ...prev, name }))}
              onSelect={({ name, street, suburb, city, lat, lng, cuisine, priceLevel }) =>
                setForm((prev) => ({
                  ...prev,
                  name,
                  address: street || prev.address,
                  suburb: suburb || prev.suburb,
                  city: city || prev.city,
                  cuisine: cuisine || prev.cuisine,
                  lat,
                  lng,
                  priceLevel: priceLevel ?? prev.priceLevel,
                }))
              }
              required
            />
          </Field>

          <Field label="Cuisine">
            <select
              value={form.cuisine}
              onChange={(e) => set('cuisine', e.target.value)}
              className={cn(inputCls, 'appearance-none [&>option]:bg-espresso-800')}
            >
              <option value="">Select cuisine</option>
              {CUISINES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Street & Suburb">
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
                    suburb: val.slice(lastComma + 1).trim(),
                    lat: null,
                    lng: null,
                  }))
                }
              }}
              placeholder="e.g. 46 Meagher St, Surry Hills"
              className={inputCls}
            />
          </Field>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {restaurant && (
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm text-espresso-300 border border-espresso-600 rounded-lg hover:bg-espresso-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 text-sm font-semibold bg-gold-500 hover:bg-gold-400 text-espresso-900 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving…' : restaurant ? 'Save changes' : 'Add restaurant'}
          </button>
        </div>
      </form>

      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete restaurant"
        message={`Are you sure you want to delete "${restaurant?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
      />
    </>
  )
}

const inputCls =
  'w-full bg-espresso-800 border border-espresso-600 rounded-lg px-3 py-2 text-sm text-espresso-50 placeholder-espresso-400 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-colors'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-espresso-300">
        {label}
        {required && <span className="text-gold-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

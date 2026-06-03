'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PlaceResult {
  name: string
  street: string
  suburb: string
  city: string
  state: string
  lat: number | null
  lng: number | null
  cuisine: string | null
  priceLevel: string | null
}

const GOOGLE_TYPE_TO_CUISINE: Record<string, string> = {
  japanese_restaurant:    'Japanese',
  italian_restaurant:     'Italian',
  chinese_restaurant:     'Chinese',
  thai_restaurant:        'Thai',
  indian_restaurant:      'Indian',
  mexican_restaurant:     'Mexican',
  french_restaurant:      'French',
  mediterranean_restaurant: 'Mediterranean',
  american_restaurant:    'American',
  korean_restaurant:      'Korean',
  vietnamese_restaurant:  'Vietnamese',
  greek_restaurant:       'Greek',
  spanish_restaurant:     'Spanish',
  middle_eastern_restaurant: 'Middle Eastern',
  seafood_restaurant:     'Seafood',
  steak_house:            'Steakhouse',
  pizza_restaurant:       'Pizza',
  sushi_restaurant:       'Sushi',
  ramen_restaurant:       'Ramen',
  hamburger_restaurant:   'Burgers',
  cafe:                   'Cafe',
  bakery:                 'Bakery',
  barbecue_restaurant:    'BBQ',
  turkish_restaurant:     'Turkish',
  lebanese_restaurant:    'Lebanese',
  ethiopian_restaurant:   'Ethiopian',
}

function resolveCuisine(primaryType: string | null, types: string[]): string | null {
  if (primaryType && GOOGLE_TYPE_TO_CUISINE[primaryType]) {
    return GOOGLE_TYPE_TO_CUISINE[primaryType]
  }
  for (const t of types) {
    if (GOOGLE_TYPE_TO_CUISINE[t]) return GOOGLE_TYPE_TO_CUISINE[t]
  }
  return null
}

interface Prediction {
  description: string
  place_id: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

interface RestaurantAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (result: PlaceResult) => void
  placeholder?: string
  required?: boolean
}

export function RestaurantAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'e.g. Ester',
  required,
}: RestaurantAutocompleteProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const userTypedRef = useRef(false)

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!userTypedRef.current) {
      setPredictions([])
      setOpen(false)
      return
    }
    userTypedRef.current = false

    if (value.trim().length < 2) {
      setPredictions([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/places?mode=restaurant&input=${encodeURIComponent(value.trim())}`
        )
        const data = await res.json()
        const results: Prediction[] = data.predictions ?? []
        setPredictions(results)
        setOpen(results.length > 0)
      } catch {
        setPredictions([])
        setOpen(false)
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value])

  async function pick(prediction: Prediction) {
    userTypedRef.current = false
    setOpen(false)
    setHighlighted(-1)
    onChange(prediction.structured_formatting.main_text)
    setResolving(true)

    try {
      const res = await fetch(`/api/places/details?place_id=${prediction.place_id}`)
      const data = await res.json()
      const result = data.result

      if (result) {
        const components: AddressComponent[] = result.address_components ?? []
        const suburb = getComponent(components, 'sublocality_level_1', 'sublocality', 'neighborhood', 'locality')
        const city = getComponent(components, 'administrative_area_level_2', 'administrative_area_level_1')
        const state = getComponent(components, 'administrative_area_level_1')
        const lat = result.geometry?.location?.lat ?? null
        const lng = result.geometry?.location?.lng ?? null
        const cuisine = resolveCuisine(result.primaryType ?? null, result.types ?? [])

        onSelect({
          name: result.name ?? prediction.structured_formatting.main_text,
          street: result.street ?? '',
          suburb,
          city,
          state,
          lat,
          lng,
          cuisine,
          priceLevel: result.priceLevel ?? null,
        })
      }
    } catch {
      // silently fall through — name is already set, user can fill location manually
    } finally {
      setResolving(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || predictions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => Math.min(h + 1, predictions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, -1))
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault()
      pick(predictions[highlighted])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          value={value}
          onChange={(e) => { userTypedRef.current = true; onChange(e.target.value); setHighlighted(-1) }}
          onKeyDown={handleKeyDown}
          onFocus={() => predictions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          required={required}
          className={cn(
            'w-full bg-espresso-800 border border-espresso-600 rounded-lg px-3 py-2 text-sm',
            'text-espresso-50 placeholder-espresso-400 pr-8',
            'focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-colors'
          )}
        />
        {(loading || resolving) ? (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-espresso-400 animate-spin pointer-events-none" />
        ) : (
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-espresso-500 pointer-events-none" />
        )}
      </div>

      {open && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-espresso-800 border border-espresso-600 rounded-xl shadow-2xl overflow-hidden">
          {predictions.map((p, i) => (
            <li
              key={p.place_id}
              onPointerDown={() => pick(p)}
              className={cn(
                'flex flex-col px-3 py-2.5 cursor-pointer transition-colors',
                i !== predictions.length - 1 && 'border-b border-espresso-700',
                highlighted === i ? 'bg-espresso-600' : 'hover:bg-espresso-700'
              )}
            >
              <span className="text-sm text-espresso-50">{p.structured_formatting.main_text}</span>
              <span className="text-xs text-espresso-400 mt-0.5">{p.structured_formatting.secondary_text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

interface AddressComponent {
  short_name: string
  long_name: string
  types: string[]
}

function getComponent(components: AddressComponent[], ...types: string[]): string {
  for (const type of types) {
    const match = components.find((c) => c.types.includes(type))
    if (match) return match.short_name
  }
  return ''
}

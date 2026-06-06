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
  website: string | null
  instagram: string | null
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
  onInstagramFound?: (instagram: string) => void
  placeholder?: string
  required?: boolean
}

export function RestaurantAutocomplete({
  value,
  onChange,
  onSelect,
  onInstagramFound,
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
        const website: string | null = result.website ?? null

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
          website,
          instagram: null,
        })

        // Fetch Instagram independently so it doesn't delay form population
        if (website && onInstagramFound) {
          fetch(`/api/places/instagram?url=${encodeURIComponent(website)}`)
            .then((r) => r.json())
            .then(({ instagram }) => { if (instagram) onInstagramFound(instagram) })
            .catch(() => {})
        }
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
          style={{
            width:           '100%',
            backgroundColor: '#f5f0e8',
            border:          '0.5px solid #c4b8a8',
            borderRadius:    7,
            padding:         '7px 32px 7px 10px',
            fontFamily:      'var(--font-crimson), Georgia, serif',
            fontSize: 16,
            color:           '#3b2f27',
            outline:         'none',
            boxSizing:       'border-box' as const,
          }}
        />
        {(loading || resolving) ? (
          <Loader2 style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, color: '#a08070', animation: 'spin 1s linear infinite', pointerEvents: 'none' }} />
        ) : (
          <Search style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, color: '#c4b8a8', pointerEvents: 'none' }} />
        )}
      </div>

      {open && (
        <ul style={{
          position:        'absolute',
          zIndex:          50,
          top:             '100%',
          left:            0,
          right:           0,
          marginTop:       4,
          backgroundColor: '#ede5d8',
          border:          '0.5px solid #c4b8a8',
          borderRadius:    8,
          overflow:        'hidden',
          listStyle:       'none',
          padding:         0,
          margin:          '4px 0 0',
        }}>
          {predictions.map((p, i) => (
            <li
              key={p.place_id}
              onPointerDown={() => pick(p)}
              style={{
                display:         'flex',
                flexDirection:   'column',
                padding:         '8px 12px',
                cursor:          'pointer',
                borderBottom:    i !== predictions.length - 1 ? '0.5px solid #c4b8a8' : 'none',
                backgroundColor: highlighted === i ? '#e8ddd3' : 'transparent',
              }}
            >
              <span style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: 16, color: '#3b2f27' }}>{p.structured_formatting.main_text}</span>
              <span style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 11, color: '#a08070', marginTop: 2 }}>{p.structured_formatting.secondary_text}</span>
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

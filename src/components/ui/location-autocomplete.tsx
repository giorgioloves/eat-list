'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Suggestion {
  label: string
  suburb: string
  city: string
}

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (suburb: string, city: string) => void
  placeholder?: string
}

export function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Suburb or city',
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
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
      setSuggestions([])
      setOpen(false)
      return
    }
    userTypedRef.current = false

    if (value.trim().length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/places?input=${encodeURIComponent(value.trim())}`)
        const data = await res.json()
        const predictions: GooglePrediction[] = data.predictions ?? []

        const results: Suggestion[] = predictions.map((p) => {
          const suburb = p.terms[0]?.value ?? ''
          // Strip trailing postcode (e.g. "NSW 2000" → "NSW")
          const city = (p.terms[1]?.value ?? '').replace(/\s+\d{4}$/, '')
          const label = [suburb, city].filter(Boolean).join(', ')
          return { label, suburb, city }
        })

        setSuggestions(results)
        setOpen(results.length > 0)
      } catch {
        setSuggestions([])
        setOpen(false)
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value])

  function pick(s: Suggestion) {
    userTypedRef.current = false
    onChange(s.label)
    onSelect(s.suburb, s.city)
    setOpen(false)
    setHighlighted(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, -1))
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault()
      pick(suggestions[highlighted])
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
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            'w-full bg-espresso-800 border border-espresso-600 rounded-lg px-3 py-2 text-sm',
            'text-espresso-50 placeholder-espresso-400 pr-8',
            'focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-colors'
          )}
        />
        {loading && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-espresso-400 animate-spin pointer-events-none" />
        )}
      </div>

      {open && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-espresso-800 border border-espresso-600 rounded-xl shadow-2xl overflow-hidden">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onPointerDown={() => pick(s)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors text-sm',
                i !== suggestions.length - 1 && 'border-b border-espresso-700',
                highlighted === i ? 'bg-espresso-600' : 'hover:bg-espresso-700'
              )}
            >
              <MapPin className="w-3.5 h-3.5 text-espresso-400 flex-shrink-0" />
              {s.suburb ? (
                <>
                  <span className="text-espresso-100">{s.suburb}</span>
                  {s.city && <span className="text-espresso-400">{s.city}</span>}
                </>
              ) : (
                <span className="text-espresso-100">{s.city}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

interface GooglePrediction {
  description: string
  terms: { value: string; offset: number }[]
}

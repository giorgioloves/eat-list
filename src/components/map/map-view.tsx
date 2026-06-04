'use client'

import { useState, useRef, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, OverlayViewF } from '@react-google-maps/api'
import Link from 'next/link'
import { Instagram, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CUISINE_EMOJI, TIER_COLORS } from '@/types'
import { PipRating } from '@/components/ui/pip-rating'
import { formatDate } from '@/lib/utils'
import type { Restaurant, RestaurantVisit } from '@/types'

const markerOffset = () => ({ x: -21, y: -50 })


const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#2B2623' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#2B2623' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#A09590' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#4A3E3A' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#C0B5B0' }] },
  { featureType: 'road.highway', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1B2C42' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#5FA8FF' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#352E2B' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1B3324' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#352E2B' }] },
  { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#4A3E3A' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#7A6158' }] },
]

interface MapViewProps {
  restaurants: Restaurant[]
}

export function MapView({ restaurants }: MapViewProps) {
  const [selected, setSelected] = useState<Restaurant | null>(null)
  const [visits, setVisits] = useState<RestaurantVisit[]>([])
  const [visitsLoading, setVisitsLoading] = useState(false)
  const mapRef = useRef<google.maps.Map | null>(null)
  const animationRef = useRef<number | null>(null)

  function flyTo(target: google.maps.LatLngLiteral, targetZoom: number) {
    if (!mapRef.current) return

    if (animationRef.current !== null) {
      clearTimeout(animationRef.current)
      animationRef.current = null
    }

    const map = mapRef.current
    map.setCenter(target)

    const startZoom = map.getZoom() ?? 4
    if (startZoom >= targetZoom) return

    let current = startZoom

    function step() {
      current++
      map.setZoom(current)
      if (current < targetZoom) {
        animationRef.current = window.setTimeout(step, 220)
      } else {
        animationRef.current = null
      }
    }

    animationRef.current = window.setTimeout(step, 100)
  }

  useEffect(() => {
    if (!selected || selected.visit_count === 0) { setVisits([]); return }
    setVisitsLoading(true)
    const supabase = createClient()
    supabase
      .from('restaurant_visits')
      .select('*, profiles(name)')
      .eq('restaurant_id', selected.id)
      .order('visited_at', { ascending: false })
      .then(({ data }) => {
        setVisits((data ?? []) as RestaurantVisit[])
        setVisitsLoading(false)
      })
  }, [selected?.id])

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  })

  const withCoords = restaurants.filter((r) => r.latitude && r.longitude)

  // Fixed to centre of Australia — hooks must be above early returns
  const centerRef = useRef({ lat: -25.2744, lng: 133.7751 })

  if (withCoords.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-espresso-800 border border-espresso-700 rounded-2xl gap-2">
        <p className="text-espresso-200 font-medium">No location data yet</p>
        <p className="text-espresso-400 text-sm text-center max-w-xs">
          Restaurants with a suburb and city will be geocoded automatically when you save them.
        </p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center bg-espresso-800 border border-espresso-700 rounded-2xl">
        <p className="text-espresso-400 text-sm">Loading map…</p>
      </div>
    )
  }

  return (
    <div className="relative h-full rounded-2xl overflow-hidden border border-espresso-700">
      <GoogleMap
        mapContainerClassName="absolute inset-0"
        center={centerRef.current}
        zoom={4}
        options={{
          styles: MAP_STYLES,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: 'greedy',
        }}
        onLoad={(map) => { mapRef.current = map }}
        onClick={() => setSelected(null)}
      >
        {withCoords.map((r) => (
          <OverlayViewF
            key={r.id}
            position={{ lat: r.latitude!, lng: r.longitude! }}
            mapPaneName="overlayMouseTarget"
            getPixelPositionOffset={markerOffset}
          >
            <div
              className={`restaurant-marker${selected?.id === r.id ? ' selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                setSelected(r)
                flyTo({ lat: r.latitude!, lng: r.longitude! }, 17)
              }}
            >
              <span className="restaurant-marker-emoji">
                {CUISINE_EMOJI[r.cuisine ?? ''] ?? '🍽️'}
              </span>
            </div>
          </OverlayViewF>
        ))}
      </GoogleMap>

{/* Selected restaurant panel — bottom on mobile, top-right on desktop */}
      {selected && (
        <div className="absolute bottom-20 left-2 right-2 sm:bottom-auto sm:top-3 sm:left-auto sm:right-3 sm:w-80 bg-espresso-900/97 backdrop-blur border border-espresso-600 rounded-2xl z-[1000] shadow-2xl flex flex-col max-h-[48vh] sm:max-h-[calc(100%-1.5rem)] overflow-hidden">
          {/* Header */}
          <div className="p-4 pb-3 flex-shrink-0">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-espresso-400 hover:text-espresso-200 transition-colors text-xl leading-none rounded-lg hover:bg-espresso-700"
            >
              ×
            </button>
            <p className="font-bold text-espresso-50 pr-6 text-base leading-tight">{selected.name}</p>
            {selected.cuisine && (
              <p className="text-sm text-espresso-300 mt-0.5">{selected.cuisine}</p>
            )}
            {(selected.address || selected.suburb) && (
              <p className="text-sm text-espresso-500 mt-0.5">
                {[selected.address, selected.suburb].filter(Boolean).join(', ')}
              </p>
            )}
            {selected.website && (
              <a
                href={selected.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-gold-400 hover:text-gold-300 transition-colors truncate mt-1"
              >
                <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                {selected.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
              </a>
            )}
            {selected.instagram && (
              <a
                href={`https://www.instagram.com/${selected.instagram.replace(/^@/, '')}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-espresso-400 hover:text-espresso-200 transition-colors mt-0.5"
              >
                <Instagram className="w-3.5 h-3.5 flex-shrink-0" />
                @{selected.instagram.replace(/^@/, '')}
              </a>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {selected.tier && (
                <span className={`text-xs px-1.5 py-0.5 rounded border ${TIER_COLORS[selected.tier]}`}>
                  {selected.tier}
                </span>
              )}
              <PipRating rating={selected.rating} />
            </div>
          </div>

          {selected.visit_count > 0 && (visitsLoading || visits.length > 0) && (
            <div className="border-t border-espresso-700 flex-1 overflow-y-auto">
              <p className="text-xs font-semibold text-espresso-400 uppercase tracking-wider px-4 pt-3 pb-2">
                Visit History
                {visits.length > 0 && <span className="ml-1.5 font-normal normal-case">· {visits.length}</span>}
              </p>
              {visitsLoading ? (
                <p className="text-xs text-espresso-500 px-4 pb-3">Loading…</p>
              ) : (
                <div className="space-y-0 divide-y divide-espresso-800">
                  {visits.map((v) => (
                    <div key={v.id} className="px-4 py-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-espresso-300">
                          {formatDate(v.visited_at)}
                        </span>
                        {v.rating !== null && <PipRating rating={v.rating} size="sm" />}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        {(v.profiles as any)?.name && (
                          <span className="text-xs text-espresso-500">{(v.profiles as any).name}</span>
                        )}
                        {v.cost !== null && (
                          <span className="text-xs text-espresso-400">
                            ${v.cost.toFixed(0)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 p-3 pt-2 border-t border-espresso-700 flex-shrink-0">
            <Link
              href={`/restaurants/${selected.id}`}
              className="flex-1 text-center text-sm py-1.5 bg-espresso-700 hover:bg-espresso-600 text-espresso-100 rounded-lg transition-colors"
            >
              View details
            </Link>
            {(selected.address || selected.suburb) && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  [selected.name, selected.address, selected.suburb].filter(Boolean).join(', ')
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm py-1.5 px-2.5 bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 rounded-lg transition-colors"
              >
                Maps
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

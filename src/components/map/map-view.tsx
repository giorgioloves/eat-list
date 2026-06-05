'use client'

import { useState, useRef, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, OverlayViewF } from '@react-google-maps/api'
import Link from 'next/link'
import { Instagram, Globe, X } from 'lucide-react'
import { CUISINE_EMOJI, TIER_ACCENT } from '@/types'
import { PipRating } from '@/components/ui/pip-rating'
import { formatDate } from '@/lib/utils'
import type { Restaurant, RestaurantVisit, Tier } from '@/types'

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
  const [visits, setVisits]     = useState<RestaurantVisit[]>([])
  const [visitsLoading, setVisitsLoading] = useState(false)
  const mapRef      = useRef<google.maps.Map | null>(null)
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
    fetch(`/api/visits?ids=${selected.id}`)
      .then(res => res.json())
      .then((data: RestaurantVisit[]) => {
        setVisits(data.sort((a, b) => (b.visited_at ?? '').localeCompare(a.visited_at ?? '')))
        setVisitsLoading(false)
      })
  }, [selected?.id])

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  })

  const withCoords = restaurants.filter((r) => r.latitude && r.longitude)
  const centerRef  = useRef({ lat: -25.2744, lng: 133.7751 })

  if (withCoords.length === 0) {
    return (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', backgroundColor: T.linen, border: `0.5px solid ${T.border}`,
        borderRadius: 10, gap: 8,
      }}>
        <p style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: 15, color: T.espresso }}>No location data yet</p>
        <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 9, color: T.mist, letterSpacing: '0.06em', textAlign: 'center', maxWidth: 280 }}>
          restaurants with a suburb and city will be geocoded automatically when you save them
        </p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: T.linen, border: `0.5px solid ${T.border}`, borderRadius: 10 }}>
        <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 9, color: T.mist, letterSpacing: '0.06em' }}>loading map…</p>
      </div>
    )
  }

  const displayName = selected ? selected.name.replace(/\s*\([^)]+\)\s*$/, '').trim() : ''
  const tierAccent  = selected?.tier ? TIER_ACCENT[selected.tier as Tier] : null

  return (
    <div style={{ position: 'relative', height: '100%', borderRadius: 10, overflow: 'hidden', border: `0.5px solid ${T.border}` }}>
      <GoogleMap
        mapContainerStyle={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
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

      {selected && (
        <div style={{
          position:        'absolute',
          bottom:          80,
          left:            8,
          right:           8,
          backgroundColor: T.parchment,
          border:          `0.5px solid ${T.border}`,
          borderRadius:    10,
          zIndex:          1000,
          display:         'flex',
          flexDirection:   'column',
          maxHeight:       '48vh',
          overflow:        'hidden',
        }}
          className="sm:bottom-auto sm:top-3 sm:left-auto sm:right-3 sm:w-72"
        >
          {/* Header */}
          <div style={{ padding: '14px 14px 10px', flexShrink: 0, position: 'relative' }}>
            <button
              onClick={() => setSelected(null)}
              style={{
                position:        'absolute',
                top:             8,
                right:           8,
                width:           26,
                height:          26,
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                backgroundColor: T.linen,
                border:          `0.5px solid ${T.border}`,
                borderRadius:    6,
                cursor:          'pointer',
                color:           T.mist,
              }}
            >
              <X style={{ width: 12, height: 12 }} />
            </button>

            <p style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: 16, fontWeight: 400, color: T.espresso, paddingRight: 32, margin: 0, lineHeight: 1.2 }}>
              {displayName}
            </p>
            {selected.cuisine && (
              <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 8, color: T.mist, marginTop: 4, letterSpacing: '0.06em' }}>
                {selected.cuisine}
              </p>
            )}
            {(selected.address || selected.suburb) && (
              <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 8, color: T.ghost, marginTop: 2, letterSpacing: '0.04em' }}>
                {[selected.address, selected.suburb].filter(Boolean).join(', ')}
              </p>
            )}

            {(selected.website || selected.instagram) && (
              <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                {selected.website && (
                  <a href={selected.website} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 8, color: T.terracotta, letterSpacing: '0.04em', textDecoration: 'none' }}>
                    <Globe style={{ width: 10, height: 10, flexShrink: 0 }} />
                    {selected.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').slice(0, 28)}
                  </a>
                )}
                {selected.instagram && (
                  <a href={`https://www.instagram.com/${selected.instagram.replace(/^@/, '')}/`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 8, color: T.mist, letterSpacing: '0.04em', textDecoration: 'none' }}>
                    <Instagram style={{ width: 10, height: 10, flexShrink: 0 }} />
                    @{selected.instagram.replace(/^@/, '')}
                  </a>
                )}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {tierAccent && (
                <span style={{
                  fontFamily:      'var(--font-crimson), Georgia, serif',
                  fontStyle:       'italic',
                  fontSize:        13,
                  color:           tierAccent,
                  border:          `0.5px solid ${tierAccent}`,
                  backgroundColor: T.linen,
                  padding:         '1px 7px',
                  borderRadius:    5,
                }}>
                  {selected.tier}
                </span>
              )}
              <PipRating rating={selected.rating} />
            </div>
          </div>

          {/* Visit history */}
          {selected.visit_count > 0 && (visitsLoading || visits.length > 0) && (
            <div style={{ borderTop: `0.5px solid ${T.border}`, flex: 1, overflowY: 'auto' }}>
              <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 7, color: T.mist, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 14px 6px' }}>
                visits{visits.length > 0 ? ` · ${visits.length}` : ''}
              </p>
              {visitsLoading ? (
                <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 8, color: T.ghost, padding: '0 14px 12px' }}>loading…</p>
              ) : (
                <div>
                  {visits.map((v, i) => (
                    <div key={v.id} style={{ padding: '6px 14px', borderTop: i > 0 ? `0.5px solid ${T.border}` : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 8, color: T.mist, letterSpacing: '0.04em' }}>
                          {formatDate(v.visited_at)}
                        </span>
                        {v.rating !== null && <PipRating rating={v.rating} size="sm" />}
                      </div>
                      {v.cost !== null && (
                        <span style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 8, color: T.ghost, letterSpacing: '0.04em' }}>
                          ${Number(v.cost).toFixed(0)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 6, padding: '10px 12px', borderTop: `0.5px solid ${T.border}`, flexShrink: 0 }}>
            <Link
              href={`/restaurants/${selected.id}`}
              style={{
                flex:            1,
                textAlign:       'center',
                fontFamily:      'var(--font-crimson), Georgia, serif',
                fontStyle:       'italic',
                fontSize:        14,
                color:           T.parchment,
                backgroundColor: T.espresso,
                border:          'none',
                borderRadius:    20,
                padding:         '6px 0',
                textDecoration:  'none',
                display:         'block',
              }}
            >
              view details
            </Link>
            {(selected.address || selected.suburb) && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  [selected.name, selected.address, selected.suburb].filter(Boolean).join(', ')
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily:      'var(--font-dm-mono), ui-monospace, monospace',
                  fontSize:        8,
                  color:           T.terracotta,
                  backgroundColor: T.linen,
                  border:          `0.5px solid ${T.border}`,
                  borderRadius:    20,
                  padding:         '6px 12px',
                  textDecoration:  'none',
                  letterSpacing:   '0.06em',
                  display:         'flex',
                  alignItems:      'center',
                }}
              >
                ↗ maps
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

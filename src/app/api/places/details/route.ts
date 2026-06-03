export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const placeId = searchParams.get('place_id')

  if (!placeId) return Response.json({ result: null })

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!key) return Response.json({ result: null })

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': 'displayName,addressComponents,location,primaryType,types,priceLevel,priceRange',
        },
      }
    )
    const data = await res.json()

    if (data.error) {
      console.error('[places/details] Google API error:', data.error.status, data.error.message)
      return Response.json({ result: null })
    }

    // Normalise to the shape restaurant-autocomplete.tsx expects
    const components: GoogleAddressComponent[] = data.addressComponents ?? []
    const getComp = (...types: string[]) =>
      components.find((c) => types.some((t) => c.types?.includes(t)))

    const streetNumber = getComp('street_number')?.shortText ?? ''
    const route = getComp('route')?.shortText ?? ''
    const street = [streetNumber, route].filter(Boolean).join(' ')

    const PRICE_LEVEL_MAP: Record<string, string> = {
      PRICE_LEVEL_INEXPENSIVE:    '$',
      PRICE_LEVEL_MODERATE:       '$$',
      PRICE_LEVEL_EXPENSIVE:      '$$$',
      PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
    }

    const priceLevel =
      PRICE_LEVEL_MAP[data.priceLevel ?? ''] ??
      priceLevelFromRange(data.priceRange) ??
      null

    const result = {
      name: data.displayName?.text ?? '',
      street,
      primaryType: data.primaryType ?? null,
      types: data.types ?? [],
      priceLevel,
      address_components: components.map((c) => ({
        short_name: c.shortText ?? '',
        long_name: c.longText ?? '',
        types: c.types ?? [],
      })),
      geometry: {
        location: {
          lat: data.location?.latitude ?? null,
          lng: data.location?.longitude ?? null,
        },
      },
    }

    return Response.json({ result })
  } catch (err) {
    console.error('[places/details] fetch error:', err)
    return Response.json({ result: null })
  }
}

interface GoogleAddressComponent {
  shortText?: string
  longText?: string
  types?: string[]
}

function priceLevelFromRange(priceRange: { startPrice?: { units?: string }; endPrice?: { units?: string } } | null): string | null {
  if (!priceRange) return null
  const end = parseFloat(priceRange.endPrice?.units ?? '')
  const start = parseFloat(priceRange.startPrice?.units ?? '0')
  // Open-ended range (e.g. $200+) has no endPrice
  if (isNaN(end)) return start >= 200 ? '$$$$' : null
  if (end <= 20)  return '$'
  if (end <= 40)  return '$$'
  if (end <= 200) return '$$$'
  return '$$$$'
}

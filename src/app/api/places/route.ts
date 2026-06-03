export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const input = searchParams.get('input')
  const mode = searchParams.get('mode') ?? 'location'

  if (!input || input.trim().length < 2) {
    return Response.json({ predictions: [] })
  }

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!key) return Response.json({ predictions: [] })

  const body: Record<string, unknown> = {
    input: input.trim(),
    regionCode: 'AU',
    includedPrimaryTypes:
      mode === 'restaurant'
        ? ['restaurant', 'cafe', 'bakery', 'bar', 'food']
        : ['locality', 'sublocality'],
  }

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
      },
      body: JSON.stringify(body),
    })
    const data = await res.json()

    if (data.error) {
      console.error('[places] Google API error:', data.error.status, data.error.message)
      return Response.json({ predictions: [] })
    }

    const suggestions = data.suggestions ?? []

    // Normalise to the shape the components already expect
    if (mode === 'restaurant') {
      const predictions = suggestions.map((s: GoogleSuggestion) => ({
        place_id: s.placePrediction?.placeId ?? '',
        structured_formatting: {
          main_text: s.placePrediction?.structuredFormat?.mainText?.text ?? '',
          secondary_text: s.placePrediction?.structuredFormat?.secondaryText?.text ?? '',
        },
      }))
      return Response.json({ predictions })
    } else {
      const predictions = suggestions.map((s: GoogleSuggestion) => {
        const main = s.placePrediction?.structuredFormat?.mainText?.text ?? ''
        const secondary = s.placePrediction?.structuredFormat?.secondaryText?.text ?? ''
        const city = secondary.split(',')[0]?.trim() ?? ''
        return { terms: [{ value: main }, { value: city }] }
      })
      return Response.json({ predictions })
    }
  } catch (err) {
    console.error('[places] fetch error:', err)
    return Response.json({ predictions: [] })
  }
}

interface GoogleSuggestion {
  placePrediction?: {
    placeId?: string
    structuredFormat?: {
      mainText?: { text?: string }
      secondaryText?: { text?: string }
    }
  }
}

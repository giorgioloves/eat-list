export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  if (!query) return Response.json({ result: null })

  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return Response.json({ result: null })

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${key}`
    const res = await fetch(url)
    const data = await res.json()
    if (data.status === 'OK' && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location
      return Response.json({ result: { lat, lng } })
    }
    return Response.json({ result: null })
  } catch {
    return Response.json({ result: null })
  }
}

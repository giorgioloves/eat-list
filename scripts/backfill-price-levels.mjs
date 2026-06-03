// One-time script to backfill price levels from Google Places for all restaurants.
// Run with: node scripts/backfill-price-levels.mjs
//
// Requires in .env.local:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   ← Supabase dashboard → Settings → API → service_role
//   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// Read .env.local manually (no dotenv dependency needed)
const env = {}
try {
  readFileSync('.env.local', 'utf8').split('\n').forEach((line) => {
    const [key, ...rest] = line.split('=')
    if (key && rest.length) env[key.trim()] = rest.join('=').trim()
  })
} catch {
  console.error('Could not read .env.local — make sure you run this from the eat-list directory')
  process.exit(1)
}

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
const SERVICE_KEY  = env['SUPABASE_SERVICE_ROLE_KEY']
const GOOGLE_KEY   = env['NEXT_PUBLIC_GOOGLE_MAPS_API_KEY']

if (!SUPABASE_URL || !SERVICE_KEY || !GOOGLE_KEY) {
  console.error('Missing env vars. Need: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_GOOGLE_MAPS_API_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const PRICE_MAP = {
  PRICE_LEVEL_INEXPENSIVE:    '$',
  PRICE_LEVEL_MODERATE:       '$$',
  PRICE_LEVEL_EXPENSIVE:      '$$$',
  PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
}

async function searchPriceLevel(name, suburb, city) {
  const query = [name, suburb, city].filter(Boolean).join(' ')
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_KEY,
      'X-Goog-FieldMask': 'places.priceLevel,places.displayName',
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 1, regionCode: 'AU' }),
  })
  const data = await res.json()
  const level = data.places?.[0]?.priceLevel
  return PRICE_MAP[level] ?? null
}

async function main() {
  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, name, suburb, city')
    .is('price_level', null)

  if (error) { console.error('Supabase error:', error.message); process.exit(1) }
  if (!restaurants.length) { console.log('All restaurants already have price levels.'); return }

  console.log(`Fetching price levels for ${restaurants.length} restaurants…\n`)

  for (const r of restaurants) {
    try {
      const priceLevel = await searchPriceLevel(r.name, r.suburb, r.city)
      if (priceLevel) {
        await supabase.from('restaurants').update({ price_level: priceLevel }).eq('id', r.id)
        console.log(`✓  ${r.name}: ${priceLevel}`)
      } else {
        console.log(`–  ${r.name}: not found`)
      }
    } catch (e) {
      console.log(`✗  ${r.name}: ${e.message}`)
    }
    // Stay well under Google's QPS limit
    await new Promise((r) => setTimeout(r, 250))
  }

  console.log('\nDone.')
}

main()

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !GOOGLE_KEY) {
  console.error('Missing env vars — run with: node --env-file=.env.local scripts/update-restaurants.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const SKIP = new Set([
  'p', 'explore', 'stories', 'reel', 'reels', 'accounts', 'tv', 'tags',
  'about', 'press', 'api', 'privacy', 'legal', 'help', 'web',
  'squarespace', 'wix', 'shopify', 'wordpress', 'linktree',
])

function isBad(username) {
  if (!username) return true
  const lower = username.toLowerCase()
  if (SKIP.has(lower)) return true
  if (/\.(php|js|ts|css|html?|aspx?|jsx?|tsx?|py|rb|go|java|svg|png|jpg|gif)$/.test(lower)) return true
  return false
}

// If Google returns an Instagram URL as the website, extract the handle and return null website
function resolveWebsite(url) {
  if (!url) return { website: null, instagram: null }
  try {
    const u = new URL(url)
    if (u.hostname.includes('instagram.com')) {
      const username = u.pathname.split('/').filter(Boolean)[0]?.split('?')[0]
      return { website: null, instagram: (!username || isBad(username)) ? null : username }
    }
  } catch {}
  return { website: url, instagram: null }
}

async function findRawWebsite(name, suburb, city) {
  const query = [name, suburb, city].filter(Boolean).join(', ')
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_KEY,
        'X-Goog-FieldMask': 'places.websiteUri',
      },
      body: JSON.stringify({ textQuery: query }),
    })
    const data = await res.json()
    return data.places?.[0]?.websiteUri ?? null
  } catch {
    return null
  }
}

async function scrapeInstagram(websiteUrl) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(websiteUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    const html = await res.text()
    for (const match of html.matchAll(/instagram\.com\/([a-zA-Z0-9._]+)/g)) {
      const username = match[1].split('?')[0].replace(/\/$/, '')
      if (!isBad(username)) return username
    }
    return null
  } catch {
    return null
  }
}

const { data: restaurants, error } = await supabase
  .from('restaurants')
  .select('id, name, suburb, city, website, instagram')

if (error) { console.error('Fetch error:', error); process.exit(1) }

console.log(`Updating ${restaurants.length} restaurants...\n`)

for (const r of restaurants) {
  const needsWebsite = !r.website
  const needsInstagram = !r.instagram

  if (!needsWebsite && !needsInstagram) {
    console.log(`✓ ${r.name} — already complete`)
    continue
  }

  let website = r.website
  let instagram = r.instagram

  if (needsWebsite) {
    const raw = await findRawWebsite(r.name, r.suburb, r.city)
    await new Promise(res => setTimeout(res, 300))
    const resolved = resolveWebsite(raw)
    website = resolved.website
    if (!instagram && resolved.instagram) instagram = resolved.instagram
  }

  if (needsInstagram && !instagram && website) {
    instagram = await scrapeInstagram(website)
  }

  const changes = {}
  if (website !== r.website) changes.website = website
  if (instagram !== r.instagram) changes.instagram = instagram

  if (Object.keys(changes).length === 0) {
    console.log(`— ${r.name} — no data found`)
    continue
  }

  const { error: updateError } = await supabase
    .from('restaurants')
    .update(changes)
    .eq('id', r.id)

  if (updateError) {
    console.error(`✗ ${r.name}:`, updateError.message)
  } else {
    const parts = []
    if (changes.website) parts.push(`website: ${changes.website}`)
    if (changes.instagram) parts.push(`instagram: @${changes.instagram}`)
    if (changes.website === null && r.website) parts.push(`cleared bad website`)
    console.log(`✓ ${r.name} — ${parts.join(', ')}`)
  }
}

console.log('\nDone.')

// Fixes bad instagram values written by the first run:
//   - @rsrc.php (Facebook CDN path scraped from instagram.com pages)
//   - @squarespace, @wix, @shopify (platform template footers)
//   - any username with a file extension (rsrc.php, file.js, etc.)
// Also handles restaurants whose Google "website" IS an Instagram URL.

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !GOOGLE_KEY) {
  console.error('Missing env vars — run with: node --env-file=.env.local scripts/fix-instagram.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Usernames that are clearly wrong — platform names, CDN paths, etc.
const SKIP = new Set([
  'p', 'explore', 'stories', 'reel', 'reels', 'accounts', 'tv', 'tags',
  'about', 'press', 'api', 'privacy', 'legal', 'help', 'web',
  'squarespace', 'wix', 'shopify', 'wordpress', 'linktree',
])

function isBadUsername(username) {
  if (!username) return true
  const lower = username.toLowerCase()
  if (SKIP.has(lower)) return true
  // Block only real programming/web file extensions, not domain-style suffixes (.au, .wine, etc.)
  if (/\.(php|js|ts|css|html?|aspx?|jsx?|tsx?|py|rb|go|java|svg|png|jpg|gif)$/.test(lower)) return true
  return false
}

// If the URL is itself an instagram.com link, pull out the handle
function extractInstagramFromUrl(url) {
  try {
    const u = new URL(url)
    if (!u.hostname.includes('instagram.com')) return null
    const parts = u.pathname.split('/').filter(Boolean)
    const username = parts[0]?.split('?')[0]
    if (username && !isBadUsername(username)) return username
    return null
  } catch {
    return null
  }
}

async function scrapeInstagram(websiteUrl) {
  // If the website IS an instagram URL, don't try to scrape it — extract directly
  const direct = extractInstagramFromUrl(websiteUrl)
  if (direct) return direct

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
      if (!isBadUsername(username)) return username
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

let fixed = 0

for (const r of restaurants) {
  const updates = {}

  // Case 1: website is itself an Instagram URL
  const instagramFromWebsite = r.website ? extractInstagramFromUrl(r.website) : null
  if (instagramFromWebsite) {
    updates.website = null
    updates.instagram = instagramFromWebsite
    console.log(`✓ ${r.name} — extracted @${instagramFromWebsite} from website URL, cleared website`)
  }

  // Case 2: instagram value is bad (file ext, platform name)
  const currentInstagram = updates.instagram ?? r.instagram
  if (currentInstagram && isBadUsername(currentInstagram)) {
    updates.instagram = null
    console.log(`✗ ${r.name} — cleared bad instagram @${currentInstagram}`)

    // Try to re-scrape from website (if we still have one)
    const websiteToScrape = updates.website !== undefined ? updates.website : r.website
    if (websiteToScrape) {
      const found = await scrapeInstagram(websiteToScrape)
      if (found) {
        updates.instagram = found
        console.log(`  → re-scraped @${found}`)
      }
    }
  }

  if (Object.keys(updates).length === 0) continue

  const { error: updateError } = await supabase
    .from('restaurants')
    .update(updates)
    .eq('id', r.id)

  if (updateError) {
    console.error(`  error updating ${r.name}:`, updateError.message)
  } else {
    fixed++
  }
}

console.log(`\nFixed ${fixed} restaurants.`)

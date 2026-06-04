const SKIP = new Set([
  'p', 'explore', 'stories', 'reel', 'reels', 'accounts', 'tv', 'tags',
  'about', 'press', 'api', 'privacy', 'legal', 'help', 'web',
  'squarespace', 'wix', 'shopify', 'wordpress', 'linktree',
])

function isBad(username: string): boolean {
  const lower = username.toLowerCase()
  if (SKIP.has(lower)) return true
  // Block only real programming/web file extensions, not domain-style suffixes (.au, .wine, etc.)
  if (/\.(php|js|ts|css|html?|aspx?|jsx?|tsx?|py|rb|go|java|svg|png|jpg|gif)$/.test(lower)) return true
  return false
}

function extractFromInstagramUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (!u.hostname.includes('instagram.com')) return null
    const username = u.pathname.split('/').filter(Boolean)[0]?.split('?')[0]
    if (username && !isBad(username)) return username
    return null
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  if (!url) return Response.json({ instagram: null })

  // Only allow public HTTP(S) URLs — reject file://, internal IPs, etc.
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return Response.json({ instagram: null })
  }
  if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
    return Response.json({ instagram: null })
  }
  // Block requests to private/loopback address ranges
  const hostname = parsedUrl.hostname.toLowerCase()
  if (
    hostname === 'localhost' ||
    hostname.startsWith('127.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('192.168.') ||
    hostname === '169.254.169.254' ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.local')
  ) {
    return Response.json({ instagram: null })
  }

  // If the website URL itself is an Instagram link, extract directly
  const direct = extractFromInstagramUrl(url)
  if (direct) return Response.json({ instagram: direct })

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })
    clearTimeout(timeout)
    if (!res.ok) return Response.json({ instagram: null })

    const html = await res.text()
    for (const match of html.matchAll(/instagram\.com\/([a-zA-Z0-9._]+)/g)) {
      const username = match[1].split('?')[0].replace(/\/$/, '')
      if (username && !isBad(username)) {
        return Response.json({ instagram: username })
      }
    }
    return Response.json({ instagram: null })
  } catch {
    return Response.json({ instagram: null })
  }
}

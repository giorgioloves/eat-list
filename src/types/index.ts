export const RESTAURANT_STATUSES = ['want_to_try', 'visited'] as const
export type RestaurantStatus = typeof RESTAURANT_STATUSES[number]
export type WouldGoAgain = 'definitely' | 'maybe' | 'no'
export const TIERS = ['S', 'A', 'B', 'C', 'D', 'E', 'F'] as const
export type Tier = typeof TIERS[number]

export interface Restaurant {
  id: string
  name: string
  cuisine: string | null
  address: string | null
  suburb: string | null
  city: string | null
  state: string | null
  notes: string | null
  status: RestaurantStatus
  visit_count: number
  first_visit_date: string | null
  last_visit_date: string | null
  would_go_again: WouldGoAgain | null
  tier: Tier | null
  rating: number | null
  price_level: '$' | '$$' | '$$$' | '$$$$' | null
  website: string | null
  instagram: string | null
  tags: string[]
  latitude: number | null
  longitude: number | null
  created_at: string
  updated_at: string
}

export interface RestaurantNote {
  id: string
  restaurant_id: string
  content: string
  created_at: string
}

export interface RestaurantVisit {
  id: string
  restaurant_id: string
  visited_at: string | null
  notes: string | null
  rating: number | null
  cost: number | null
  created_at: string
}

export interface RestaurantFilters {
  search: string
  status: RestaurantStatus[]
  cuisine: string[]
  suburb: string[]
  tier: Tier[]
  sortBy: 'newest' | 'rating' | 'most_visited' | 'last_visited' | 'name' | 'tier'
}

export const STATUS_LABELS: Record<RestaurantStatus, string> = {
  want_to_try: 'want to try',
  visited:     'visited',
}

// Avec badge colours
export const STATUS_COLORS: Record<RestaurantStatus, string> = {
  want_to_try: '',
  visited:     '',
}

export const STATUS_DOT_COLORS: Record<RestaurantStatus, string> = {
  want_to_try: '#7090a8',
  visited:     '#8a9e8a',
}

export const TIER_ACCENT: Record<Tier, string> = {
  S: '#b06055',
  A: '#a07838',
  B: '#888030',
  C: '#508848',
  D: '#407888',
  E: '#584888',
  F: '#884870',
}

export const TIER_BLOCK_BG: Record<Tier, string> = {
  S: '#f7e8e4',
  A: '#f7f0de',
  B: '#f5f4d8',
  C: '#e4f2e0',
  D: '#daeef4',
  E: '#e4e0f4',
  F: '#f2dced',
}

export const TIER_CHIP_BG: Record<Tier, string> = {
  S: '#eeddd8',
  A: '#eee4c8',
  B: '#ececc0',
  C: '#d0e8ca',
  D: '#c0e0ea',
  E: '#d4ceec',
  F: '#e6c8de',
}

export const TIER_CHIP_TEXT: Record<Tier, string> = {
  S: '#8a4840',
  A: '#806028',
  B: '#686818',
  C: '#387030',
  D: '#285868',
  E: '#403070',
  F: '#683058',
}

export const CUISINE_EMOJI: Record<string, string> = {
  'Modern Australian':    '🇦🇺',
  'Italian':              '🇮🇹',
  'Japanese':             '🇯🇵',
  'Chinese':              '🇨🇳',
  'Thai':                 '🇹🇭',
  'Indian':               '🇮🇳',
  'Mexican':              '🇲🇽',
  'French':               '🇫🇷',
  'Mediterranean':        '🌊',
  'American':             '🇺🇸',
  'Korean':               '🇰🇷',
  'Vietnamese':           '🇻🇳',
  'Greek':                '🇬🇷',
  'Spanish':              '🇪🇸',
  'Middle Eastern':       '🕌',
  'Seafood':              '🦞',
  'Steakhouse':           '🥩',
  'Pizza':                '🍕',
  'Sushi':                '🍣',
  'Ramen':                '🍜',
  'Tapas':                '🫒',
  'Dumplings':            '🥟',
  'Burgers':              '🍔',
  'Cafe':                 '☕',
  'Bakery':               '🥐',
  'Dessert':              '🍰',
  'Sandwiches':           '🥪',
  'Portuguese':           '🇵🇹',
  'Malaysian/Indonesian': '🌴',
  'BBQ':                  '🍖',
  'Turkish':              '🇹🇷',
  'Lebanese':             '🇱🇧',
  'Ethiopian':            '🇪🇹',
  'Wine Bar':             '🍷',
  'Pub':                  '🍺',
  'Gelato':               '🍦',
  'Asian Fusion':         '🥢',
  'Other':                '🌀',
}

export const CUISINES = Object.keys(CUISINE_EMOJI)

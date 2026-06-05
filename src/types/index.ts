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

// Tier accent colours for avec design
export const TIER_ACCENT: Record<Tier, string> = {
  S: '#c4927a',
  A: '#8a9e8a',
  B: '#7090a8',
  C: '#b8a898',
  D: '#a08070',
  E: '#c4b8a8',
  F: '#a08070',
}

// Legacy — kept for components not yet restyled
export const TIER_COLORS: Record<Tier, string> = {
  S: 'text-[#c4927a] border-[#c4927a] bg-[#f9f0eb]',
  A: 'text-[#8a9e8a] border-[#8a9e8a] bg-[#eff4ef]',
  B: 'text-[#7090a8] border-[#7090a8] bg-[#edf2f6]',
  C: 'text-[#b8a898] border-[#b8a898] bg-linen',
  D: 'text-[#a08070] border-[#a08070] bg-linen',
  E: 'text-[#c4b8a8] border-[#c4b8a8] bg-linen',
  F: 'text-[#a08070] border-[#a08070] bg-linen',
}

export const TIER_BG_COLORS: Record<Tier, string> = {
  S: 'bg-parchment border-stone',
  A: 'bg-parchment border-stone',
  B: 'bg-parchment border-stone',
  C: 'bg-parchment border-stone',
  D: 'bg-parchment border-stone',
  E: 'bg-parchment border-stone',
  F: 'bg-parchment border-stone',
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

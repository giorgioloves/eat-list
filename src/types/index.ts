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
  want_to_try: 'Want to Try',
  visited: 'Visited',
}

export const STATUS_COLORS: Record<RestaurantStatus, string> = {
  want_to_try: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  visited: 'bg-green-500/20 text-green-400 border-green-500/30',
}

export const STATUS_DOT_COLORS: Record<RestaurantStatus, string> = {
  want_to_try: '#3b82f6',
  visited: '#22c55e',
}

export const TIER_COLORS: Record<Tier, string> = {
  S: 'bg-[#3A2E12] text-[#E0B85A] border-[#E0B85A]/40',
  A: 'bg-[#1B3324] text-[#59D67A] border-[#59D67A]/40',
  B: 'bg-[#1B2C42] text-[#5FA8FF] border-[#5FA8FF]/40',
  C: 'bg-[#312144] text-[#B983FF] border-[#B983FF]/40',
  D: 'bg-[#3A3128] text-[#D8C3A5] border-[#D8C3A5]/40',
  E: 'bg-[#403220] text-[#E0B85A] border-[#E0B85A]/40',
  F: 'bg-[#4A2323] text-[#FF6B6B] border-[#FF6B6B]/40',
}

export const TIER_BG_COLORS: Record<Tier, string> = {
  S: 'bg-[#3A2E12] border-[#E0B85A]/30 tier-s-glow',
  A: 'bg-[#1B3324] border-[#59D67A]/30',
  B: 'bg-[#1B2C42] border-[#5FA8FF]/30',
  C: 'bg-[#312144] border-[#B983FF]/30',
  D: 'bg-[#3A3128] border-[#D8C3A5]/30',
  E: 'bg-[#403220] border-[#E0B85A]/30',
  F: 'bg-[#4A2323] border-[#FF6B6B]/30',
}

export const CUISINE_EMOJI: Record<string, string> = {
  'Modern Australian': '🇦🇺',
  'Italian':           '🇮🇹',
  'Japanese':          '🇯🇵',
  'Chinese':           '🇨🇳',
  'Thai':              '🇹🇭',
  'Indian':            '🇮🇳',
  'Mexican':           '🇲🇽',
  'French':            '🇫🇷',
  'Mediterranean':     '🌊',
  'American':          '🇺🇸',
  'Korean':            '🇰🇷',
  'Vietnamese':        '🇻🇳',
  'Greek':             '🇬🇷',
  'Spanish':           '🇪🇸',
  'Middle Eastern':    '🕌',
  'Seafood':           '🦞',
  'Steakhouse':        '🥩',
  'Pizza':             '🍕',
  'Sushi':             '🍣',
  'Ramen':             '🍜',
  'Tapas':             '🫒',
  'Dumplings':         '🥟',
  'Burgers':           '🍔',
  'Cafe':              '☕',
  'Bakery':            '🥐',
  'Dessert':           '🍰',
  'Sandwiches':        '🥪',
  'Portuguese':        '🇵🇹',
  'Malaysian/Indonesian': '🌴',
  'BBQ':               '🍖',
  'Turkish':           '🇹🇷',
  'Lebanese':          '🇱🇧',
  'Ethiopian':         '🇪🇹',
  'Wine Bar':          '🍷',
  'Pub':               '🍺',
  'Gelato':            '🍦',
  'Asian Fusion':      '🥢',
  'Other':             '🌀',
}

export const CUISINES = Object.keys(CUISINE_EMOJI)

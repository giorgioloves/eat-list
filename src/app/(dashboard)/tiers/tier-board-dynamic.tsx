'use client'

import dynamic from 'next/dynamic'
import type { Restaurant } from '@/types'

const TierBoard = dynamic(
  () => import('@/components/tiers/tier-board').then((m) => m.TierBoard),
  { ssr: false }
)

export function TierBoardDynamic({ restaurants }: { restaurants: Restaurant[] }) {
  return <TierBoard restaurants={restaurants} />
}

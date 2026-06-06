'use client'

import dynamic from 'next/dynamic'
import type { Restaurant } from '@/types'

const TierBoard = dynamic(
  () => import('@/components/tiers/tier-board').then((m) => m.TierBoard),
  { ssr: false }
)

export function TierBoardDynamic({ restaurants, editing }: { restaurants: Restaurant[]; editing: boolean }) {
  return <TierBoard restaurants={restaurants} editing={editing} />
}

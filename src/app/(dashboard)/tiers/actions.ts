'use server'

import sql from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { Tier } from '@/types'

export async function updateTier(restaurantId: string, tier: Tier | null) {
  await sql`UPDATE restaurants SET tier = ${tier} WHERE id = ${restaurantId}`
  revalidatePath('/tiers')
}

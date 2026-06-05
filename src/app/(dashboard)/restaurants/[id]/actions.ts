'use server'

import sql from '@/lib/db'
import { revalidatePath } from 'next/cache'

function avgRounded(nums: number[]): number | null {
  if (nums.length === 0) return null
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10
}

async function recalcRestaurant(restaurantId: string) {
  const visits = await sql`
    SELECT visited_at, rating FROM restaurant_visits
    WHERE restaurant_id = ${restaurantId}
    ORDER BY visited_at ASC NULLS LAST
  `
  const ratings = visits.map((v) => v.rating).filter((x): x is number => x !== null)
  const datedVisits = visits.filter((v) => v.visited_at)

  await sql`
    UPDATE restaurants SET
      visit_count       = ${visits.length},
      first_visit_date  = ${datedVisits[0]?.visited_at ?? null},
      last_visit_date   = ${datedVisits[datedVisits.length - 1]?.visited_at ?? null},
      rating            = ${avgRounded(ratings)},
      status            = ${visits.length > 0 ? 'visited' : 'want_to_try'}
    WHERE id = ${restaurantId}
  `
}

type ActionResult = { success?: true; error?: string }

export async function logVisit(
  restaurantId: string,
  visitedAt: string | null,
  cost: number | null,
  rating: number | null
): Promise<ActionResult> {
  try {
    await sql`
      INSERT INTO restaurant_visits (restaurant_id, visited_at, rating, cost)
      VALUES (${restaurantId}, ${visitedAt}, ${rating}, ${cost})
    `
    await recalcRestaurant(restaurantId)
    revalidatePath(`/restaurants/${restaurantId}`)
    return { success: true }
  } catch (e) {
    return { error: String(e) }
  }
}

export async function rateVisit(visitId: string, restaurantId: string, rating: number | null): Promise<ActionResult> {
  try {
    await sql`UPDATE restaurant_visits SET rating = ${rating} WHERE id = ${visitId}`
    const visits = await sql`SELECT rating FROM restaurant_visits WHERE restaurant_id = ${restaurantId}`
    const ratings = visits.map((v) => v.rating).filter((x): x is number => x !== null)
    await sql`UPDATE restaurants SET rating = ${avgRounded(ratings)} WHERE id = ${restaurantId}`
    revalidatePath(`/restaurants/${restaurantId}`)
    return { success: true }
  } catch (e) {
    return { error: String(e) }
  }
}

export async function addNote(restaurantId: string, content: string): Promise<ActionResult> {
  try {
    await sql`
      INSERT INTO restaurant_notes (restaurant_id, content)
      VALUES (${restaurantId}, ${content.trim()})
    `
    revalidatePath(`/restaurants/${restaurantId}`)
    return { success: true }
  } catch (e) {
    return { error: String(e) }
  }
}

export async function deleteNote(noteId: string, restaurantId: string): Promise<ActionResult> {
  try {
    await sql`DELETE FROM restaurant_notes WHERE id = ${noteId}`
    revalidatePath(`/restaurants/${restaurantId}`)
    return { success: true }
  } catch (e) {
    return { error: String(e) }
  }
}

export async function updateVisit(
  visitId: string,
  restaurantId: string,
  visitedAt: string | null,
  cost: number | null
): Promise<ActionResult> {
  try {
    await sql`
      UPDATE restaurant_visits SET visited_at = ${visitedAt}, cost = ${cost}
      WHERE id = ${visitId}
    `
    const visits = await sql`
      SELECT visited_at FROM restaurant_visits
      WHERE restaurant_id = ${restaurantId}
      ORDER BY visited_at ASC NULLS LAST
    `
    const datedVisits = visits.filter((v) => v.visited_at)
    await sql`
      UPDATE restaurants SET
        first_visit_date = ${datedVisits[0]?.visited_at ?? null},
        last_visit_date  = ${datedVisits[datedVisits.length - 1]?.visited_at ?? null}
      WHERE id = ${restaurantId}
    `
    revalidatePath(`/restaurants/${restaurantId}`)
    return { success: true }
  } catch (e) {
    return { error: String(e) }
  }
}

export async function setWouldGoAgain(
  restaurantId: string,
  value: 'definitely' | 'maybe' | 'no' | null
): Promise<ActionResult> {
  try {
    await sql`UPDATE restaurants SET would_go_again = ${value} WHERE id = ${restaurantId}`
    revalidatePath(`/restaurants/${restaurantId}`)
    return { success: true }
  } catch (e) {
    return { error: String(e) }
  }
}

export async function deleteVisit(visitId: string, restaurantId: string): Promise<ActionResult> {
  try {
    await sql`DELETE FROM restaurant_visits WHERE id = ${visitId}`
    await recalcRestaurant(restaurantId)
    revalidatePath(`/restaurants/${restaurantId}`)
    return { success: true }
  } catch (e) {
    return { error: String(e) }
  }
}

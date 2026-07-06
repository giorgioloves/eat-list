'use server'

import sql from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { TransactionSql } from 'postgres'

// Runs the visit aggregation and the row update as one statement so a
// concurrent insert/delete on the same restaurant can't be lost between
// a separate read and write (previously a two-step SELECT then UPDATE).
async function recalcRestaurant(tx: TransactionSql<{}>, restaurantId: string) {
  await tx`
    UPDATE restaurants r SET
      visit_count       = sub.cnt,
      first_visit_date  = sub.first_date,
      last_visit_date   = sub.last_date,
      rating            = sub.avg_rating,
      status            = CASE WHEN sub.cnt > 0 THEN 'visited' ELSE 'want_to_try' END
    FROM (
      SELECT
        COUNT(*)                                    AS cnt,
        MIN(visited_at) FILTER (WHERE visited_at IS NOT NULL) AS first_date,
        MAX(visited_at) FILTER (WHERE visited_at IS NOT NULL) AS last_date,
        ROUND(AVG(rating) FILTER (WHERE rating IS NOT NULL), 1) AS avg_rating
      FROM restaurant_visits
      WHERE restaurant_id = ${restaurantId}
    ) sub
    WHERE r.id = ${restaurantId}
  `
}

type ActionResult = { success?: true; error?: string }

export async function logVisit(
  restaurantId: string,
  visitedAt: string | null,
  rating: number | null
): Promise<ActionResult> {
  try {
    await sql.begin(async (tx) => {
      await tx`
        INSERT INTO restaurant_visits (restaurant_id, visited_at, rating)
        VALUES (${restaurantId}, ${visitedAt}, ${rating})
      `
      await recalcRestaurant(tx, restaurantId)
    })
    revalidatePath(`/restaurants/${restaurantId}`)
    return { success: true }
  } catch (e) {
    return { error: String(e) }
  }
}

export async function rateVisit(visitId: string, restaurantId: string, rating: number | null): Promise<ActionResult> {
  try {
    await sql.begin(async (tx) => {
      await tx`UPDATE restaurant_visits SET rating = ${rating} WHERE id = ${visitId}`
      await recalcRestaurant(tx, restaurantId)
    })
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
  visitedAt: string | null
): Promise<ActionResult> {
  try {
    await sql.begin(async (tx) => {
      await tx`UPDATE restaurant_visits SET visited_at = ${visitedAt} WHERE id = ${visitId}`
      await recalcRestaurant(tx, restaurantId)
    })
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
    await sql.begin(async (tx) => {
      await tx`DELETE FROM restaurant_visits WHERE id = ${visitId}`
      await recalcRestaurant(tx, restaurantId)
    })
    revalidatePath(`/restaurants/${restaurantId}`)
    return { success: true }
  } catch (e) {
    return { error: String(e) }
  }
}

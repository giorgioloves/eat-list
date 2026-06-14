import { NextResponse } from 'next/server'
import sql from '@/lib/db'

// One-time migration: converts 1–5 pip ratings to 0–100 scale.
// Drops the old 1–5 check constraint, migrates data, adds new 0–100 constraint.
export async function POST() {
  try {
    // Drop old check constraints (ignore error if already gone)
    await sql`ALTER TABLE restaurant_visits DROP CONSTRAINT IF EXISTS restaurant_visits_rating_check`
    await sql`ALTER TABLE restaurants       DROP CONSTRAINT IF EXISTS restaurants_rating_check`

    // Widen column type from NUMERIC(3,1) to NUMERIC(5,2) so it can hold 0–100
    await sql`ALTER TABLE restaurant_visits ALTER COLUMN rating TYPE NUMERIC(5,2)`
    await sql`ALTER TABLE restaurants       ALTER COLUMN rating TYPE NUMERIC(5,2)`

    // Migrate: multiply only values still in 1–5 range (safe to call twice)
    const visits = await sql`
      UPDATE restaurant_visits
      SET rating = rating * 20
      WHERE rating IS NOT NULL AND rating <= 5
      RETURNING id
    `
    const restaurants = await sql`
      UPDATE restaurants
      SET rating = rating * 20
      WHERE rating IS NOT NULL AND rating <= 5
      RETURNING id
    `

    // Add new constraints for 0–100 range
    await sql`ALTER TABLE restaurant_visits ADD CONSTRAINT restaurant_visits_rating_check CHECK (rating >= 0 AND rating <= 100)`
    await sql`ALTER TABLE restaurants       ADD CONSTRAINT restaurants_rating_check       CHECK (rating >= 0 AND rating <= 100)`

    return NextResponse.json({
      ok: true,
      visits_updated: visits.length,
      restaurants_updated: restaurants.length,
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

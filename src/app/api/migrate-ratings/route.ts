import { NextResponse } from 'next/server'
import sql from '@/lib/db'

// One-time migration: converts 0–100 ratings to 0–10 scale (÷10).
export async function POST() {
  try {
    await sql`ALTER TABLE restaurant_visits DROP CONSTRAINT IF EXISTS restaurant_visits_rating_check`
    await sql`ALTER TABLE restaurants       DROP CONSTRAINT IF EXISTS restaurants_rating_check`

    // Divide only values still in 0–100 range (> 10 means not yet converted)
    const visits = await sql`
      UPDATE restaurant_visits
      SET rating = ROUND((rating / 10.0)::numeric, 1)
      WHERE rating IS NOT NULL AND rating > 10
      RETURNING id
    `
    const restaurants = await sql`
      UPDATE restaurants
      SET rating = ROUND((rating / 10.0)::numeric, 1)
      WHERE rating IS NOT NULL AND rating > 10
      RETURNING id
    `

    await sql`ALTER TABLE restaurant_visits ADD CONSTRAINT restaurant_visits_rating_check CHECK (rating >= 0 AND rating <= 10)`
    await sql`ALTER TABLE restaurants       ADD CONSTRAINT restaurants_rating_check       CHECK (rating >= 0 AND rating <= 10)`

    return NextResponse.json({
      ok: true,
      visits_updated: visits.length,
      restaurants_updated: restaurants.length,
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

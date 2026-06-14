import { NextResponse } from 'next/server'
import sql from '@/lib/db'

// One-time migration: converts 1–5 pip ratings to 0–100 scale.
// Guard (rating <= 5) makes it safe to call multiple times.
export async function POST() {
  try {
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
    return NextResponse.json({
      ok: true,
      visits_updated: visits.length,
      restaurants_updated: restaurants.length,
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

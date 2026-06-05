import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ids = searchParams.get('ids')
  if (!ids) return NextResponse.json([])

  const idList = ids.split(',').filter(Boolean)
  if (idList.length === 0) return NextResponse.json([])

  const rows = await sql`
    SELECT id, restaurant_id, visited_at, rating, cost, created_at
    FROM restaurant_visits
    WHERE restaurant_id = ANY(${idList}::uuid[])
  `
  return NextResponse.json(rows.map(v => ({
    ...v,
    rating: v.rating !== null ? parseFloat(v.rating as string) : null,
    cost:   v.cost   !== null ? parseFloat(v.cost   as string) : null,
  })))
}

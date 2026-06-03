'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function logVisit(
  restaurantId: string,
  visitedAt: string | null,
  rating: number | null,
  cost: number | null
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error: visitErr } = await supabase.from('restaurant_visits').insert({
    restaurant_id: restaurantId,
    visited_by: user.id,
    visited_at: visitedAt,
    rating,
    cost,
  })

  if (visitErr) return { error: visitErr.message }

  // Recalculate restaurant stats from all visits
  const { data: r } = await supabase
    .from('restaurants')
    .select('visit_count, first_visit_date, status')
    .eq('id', restaurantId)
    .single()

  const { data: allVisits } = await supabase
    .from('restaurant_visits')
    .select('visited_at, rating')
    .eq('restaurant_id', restaurantId)
    .order('visited_at', { ascending: true })

  if (r && allVisits) {
    const ratings = allVisits.map((v) => v.rating).filter((x): x is number => x !== null)
    const avgRating = ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : null

    const datedVisits = allVisits.filter((v) => v.visited_at)
    const updates: Record<string, unknown> = {
      visit_count: allVisits.length,
      first_visit_date: datedVisits[0]?.visited_at ?? null,
      last_visit_date: datedVisits[datedVisits.length - 1]?.visited_at ?? null,
    }
    if (r.status === 'want_to_try') updates.status = 'visited'
    if (avgRating !== null) updates.rating = avgRating

    await supabase.from('restaurants').update(updates).eq('id', restaurantId)
  }

  revalidatePath(`/restaurants/${restaurantId}`)
  return { success: true }
}

export async function addNote(restaurantId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('restaurant_notes').insert({
    restaurant_id: restaurantId,
    added_by: user.id,
    content: content.trim(),
  })

  if (error) return { error: error.message }
  revalidatePath(`/restaurants/${restaurantId}`)
  return { success: true }
}

export async function deleteNote(noteId: string, restaurantId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('restaurant_notes').delete().eq('id', noteId)
  if (error) return { error: error.message }
  revalidatePath(`/restaurants/${restaurantId}`)
  return { success: true }
}

export async function deleteVisit(visitId: string, restaurantId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('restaurant_visits').delete().eq('id', visitId)
  if (error) return { error: error.message }

  // Recalculate from remaining visits
  const { data: remaining } = await supabase
    .from('restaurant_visits')
    .select('visited_at, rating')
    .eq('restaurant_id', restaurantId)
    .order('visited_at', { ascending: true })

  const visits = remaining ?? []
  const ratings = visits.map((v) => v.rating).filter((x): x is number => x !== null)
  const avgRating = ratings.length > 0
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : null

  const updates: Record<string, unknown> = {
    visit_count: visits.length,
    first_visit_date: visits[0]?.visited_at ?? null,
    last_visit_date: visits[visits.length - 1]?.visited_at ?? null,
    rating: avgRating,
  }
  if (visits.length === 0) updates.status = 'want_to_try'

  await supabase.from('restaurants').update(updates).eq('id', restaurantId)

  revalidatePath(`/restaurants/${restaurantId}`)
  return { success: true }
}

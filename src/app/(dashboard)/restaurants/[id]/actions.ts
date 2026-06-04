'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function avgRounded(nums: number[]): number | null {
  if (nums.length === 0) return null
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10
}

export async function logVisit(
  restaurantId: string,
  visitedAt: string | null,
  cost: number | null,
  myRating: number | null
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: visit, error: visitErr } = await supabase
    .from('restaurant_visits')
    .insert({
      restaurant_id: restaurantId,
      visited_by: user.id,
      visited_at: visitedAt,
      rating: myRating,
      cost,
    })
    .select()
    .single()

  if (visitErr) return { error: visitErr.message }

  if (myRating !== null) {
    const { error: ratingErr } = await supabase.from('visit_ratings').insert({
      visit_id: visit.id,
      user_id: user.id,
      rating: myRating,
    })
    if (ratingErr) return { error: ratingErr.message }
  }

  // Recalculate restaurant stats from all visits
  const { data: r } = await supabase
    .from('restaurants')
    .select('status')
    .eq('id', restaurantId)
    .single()

  const { data: allVisits } = await supabase
    .from('restaurant_visits')
    .select('visited_at, rating')
    .eq('restaurant_id', restaurantId)
    .order('visited_at', { ascending: true })

  if (r && allVisits) {
    const ratings = allVisits.map((v) => v.rating).filter((x): x is number => x !== null)
    const datedVisits = allVisits.filter((v) => v.visited_at)
    const updates: Record<string, unknown> = {
      visit_count: allVisits.length,
      first_visit_date: datedVisits[0]?.visited_at ?? null,
      last_visit_date: datedVisits[datedVisits.length - 1]?.visited_at ?? null,
      rating: avgRounded(ratings),
    }
    if (r.status === 'want_to_try') updates.status = 'visited'

    await supabase.from('restaurants').update(updates).eq('id', restaurantId)
  }

  revalidatePath(`/restaurants/${restaurantId}`)
  return { success: true }
}

export async function rateVisit(
  visitId: string,
  restaurantId: string,
  rating: number | null
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Always delete first, then insert if a rating was provided
  await supabase.from('visit_ratings').delete()
    .eq('visit_id', visitId)
    .eq('user_id', user.id)

  if (rating !== null) {
    const { error: insertErr } = await supabase.from('visit_ratings').insert({
      visit_id: visitId,
      user_id: user.id,
      rating,
    })
    if (insertErr) return { error: insertErr.message }
  }

  // Recalculate this visit's avg rating
  const { data: visitRatings } = await supabase
    .from('visit_ratings')
    .select('rating')
    .eq('visit_id', visitId)

  const avgVisitRating = avgRounded(visitRatings?.map(r => r.rating) ?? [])
  await supabase.from('restaurant_visits').update({ rating: avgVisitRating }).eq('id', visitId)

  // Recalculate restaurant avg rating
  const { data: allVisits } = await supabase
    .from('restaurant_visits')
    .select('rating')
    .eq('restaurant_id', restaurantId)

  if (allVisits) {
    const allRatings = allVisits.map(v => v.rating).filter((x): x is number => x !== null)
    await supabase.from('restaurants').update({ rating: avgRounded(allRatings) }).eq('id', restaurantId)
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { error } = await supabase.from('restaurant_notes').delete().eq('id', noteId)
  if (error) return { error: error.message }
  revalidatePath(`/restaurants/${restaurantId}`)
  return { success: true }
}

export async function updateVisit(
  visitId: string,
  restaurantId: string,
  visitedAt: string | null,
  cost: number | null
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('restaurant_visits')
    .update({ visited_at: visitedAt, cost })
    .eq('id', visitId)
    .eq('visited_by', user.id)

  if (error) return { error: error.message }

  // Recalculate first/last visit dates
  const { data: allVisits } = await supabase
    .from('restaurant_visits')
    .select('visited_at')
    .eq('restaurant_id', restaurantId)
    .order('visited_at', { ascending: true })

  if (allVisits) {
    const datedVisits = allVisits.filter((v) => v.visited_at)
    await supabase.from('restaurants').update({
      first_visit_date: datedVisits[0]?.visited_at ?? null,
      last_visit_date: datedVisits[datedVisits.length - 1]?.visited_at ?? null,
    }).eq('id', restaurantId)
  }

  revalidatePath(`/restaurants/${restaurantId}`)
  return { success: true }
}

export async function setWouldGoAgain(restaurantId: string, value: 'definitely' | 'maybe' | 'no' | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('restaurants')
    .update({ would_go_again: value, updated_at: new Date().toISOString() })
    .eq('id', restaurantId)

  if (error) return { error: error.message }
  revalidatePath(`/restaurants/${restaurantId}`)
  return { success: true }
}

export async function deleteVisit(visitId: string, restaurantId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

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
  const datedVisits = visits.filter((v) => v.visited_at)
  const updates: Record<string, unknown> = {
    visit_count: visits.length,
    first_visit_date: datedVisits[0]?.visited_at ?? null,
    last_visit_date: datedVisits[datedVisits.length - 1]?.visited_at ?? null,
    rating: avgRounded(ratings),
  }
  if (visits.length === 0) updates.status = 'want_to_try'

  await supabase.from('restaurants').update(updates).eq('id', restaurantId)

  revalidatePath(`/restaurants/${restaurantId}`)
  return { success: true }
}

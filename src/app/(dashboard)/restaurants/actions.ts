'use server'

import sql from '@/lib/db'
import { revalidatePath } from 'next/cache'

interface RestaurantInput {
  name: string
  cuisine: string | null
  address: string | null
  suburb: string | null
  city: string | null
  state: string | null
  latitude: number | null
  longitude: number | null
  website: string | null
  instagram: string | null
}

export async function addRestaurant(data: RestaurantInput): Promise<{ id?: string; error?: string }> {
  const [row] = await sql`
    INSERT INTO restaurants
      (name, cuisine, address, suburb, city, state, latitude, longitude, website, instagram, status, tags)
    VALUES
      (${data.name}, ${data.cuisine}, ${data.address}, ${data.suburb}, ${data.city}, ${data.state},
       ${data.latitude}, ${data.longitude}, ${data.website}, ${data.instagram},
       'want_to_try', ARRAY[]::text[])
    RETURNING id
  `
  revalidatePath('/restaurants')
  revalidatePath('/dashboard')
  return { id: row.id }
}

export async function updateRestaurant(id: string, data: RestaurantInput): Promise<{ success?: boolean; error?: string }> {
  await sql`
    UPDATE restaurants SET
      name      = ${data.name},
      cuisine   = ${data.cuisine},
      address   = ${data.address},
      suburb    = ${data.suburb},
      city      = ${data.city},
      state     = ${data.state},
      latitude  = ${data.latitude},
      longitude = ${data.longitude},
      website   = ${data.website},
      instagram = ${data.instagram}
    WHERE id = ${id}
  `
  revalidatePath('/restaurants')
  revalidatePath(`/restaurants/${id}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteRestaurant(id: string): Promise<{ success?: boolean; error?: string }> {
  await sql`DELETE FROM restaurants WHERE id = ${id}`
  revalidatePath('/restaurants')
  revalidatePath('/dashboard')
  return { success: true }
}

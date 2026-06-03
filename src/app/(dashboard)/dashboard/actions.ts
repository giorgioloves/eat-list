'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSharedList(name: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Generate the ID here so we never need to SELECT the row back
  // (avoids the chicken-and-egg: you can't see the list until you're a member,
  //  but you can't become a member until you know the list ID)
  const { randomUUID } = await import('crypto')
  const listId = randomUUID()

  const { error: listErr } = await supabase
    .from('shared_lists')
    .insert({ id: listId, name: name.trim(), created_by: user.id })

  if (listErr) return { error: listErr.message }

  const { error: memberErr } = await supabase
    .from('shared_list_members')
    .insert({ list_id: listId, user_id: user.id, role: 'owner' })

  if (memberErr) return { error: memberErr.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function joinSharedList(code: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Use the SECURITY DEFINER function so a non-member can find the list
  const { data: rows, error: listErr } = await supabase
    .rpc('get_list_by_invite_code', { code: code.trim() })

  if (listErr || !rows || rows.length === 0) {
    return { error: 'Invalid invite code — double-check and try again.' }
  }

  const listId = rows[0].id

  const { error: memberErr } = await supabase
    .from('shared_list_members')
    .insert({ list_id: listId, user_id: user.id, role: 'member' })

  if (memberErr) {
    if (memberErr.code === '23505') return { error: 'You are already a member of this list.' }
    return { error: memberErr.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

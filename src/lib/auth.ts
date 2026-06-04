import { cache } from 'react'
import { createClient } from './supabase/server'

export const getAuthUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

export const getListInfo = cache(async (userId: string): Promise<{ listId: string | null; listName: string | null }> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('shared_list_members')
    .select('list_id, shared_lists(name)')
    .eq('user_id', userId)
    .limit(1)
    .single()
  return {
    listId: data?.list_id ?? null,
    listName: (data?.shared_lists as any)?.name ?? null,
  }
})

// Convenience wrapper for pages that only need the id
export const getListId = cache(async (userId: string): Promise<string | null> => {
  const { listId } = await getListInfo(userId)
  return listId
})

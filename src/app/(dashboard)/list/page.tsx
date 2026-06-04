import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { ListSettingsClient } from './list-client'
import type { SharedList, SharedListMember } from '@/types'

export default async function ListSettingsPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const supabase = await createClient()

  const { data: memberships } = await supabase
    .from('shared_list_members')
    .select('list_id, role, shared_lists(id, name, invite_code, created_by, created_at, updated_at)')
    .eq('user_id', user.id)

  if (!memberships || memberships.length === 0) redirect('/dashboard')

  const membership = memberships[0]
  const list = membership.shared_lists as unknown as SharedList

  const { data: members } = await supabase
    .from('shared_list_members')
    .select('id, user_id, role, joined_at, profiles(id, name, email, avatar_url)')
    .eq('list_id', list.id)

  const { data: invitations } = await supabase
    .from('invitations')
    .select('*')
    .eq('list_id', list.id)
    .eq('status', 'pending')

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-espresso-50">List Settings</h1>
        <p className="text-sm text-espresso-300 mt-0.5">Manage your shared list</p>
      </div>

      <ListSettingsClient
        list={list}
        members={(members || []) as any}
        invitations={invitations || []}
        currentUserId={user.id}
        currentUserRole={membership.role as 'owner' | 'member'}
      />
    </div>
  )
}

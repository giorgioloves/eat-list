'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Copy, Check, Users, Mail, Shield, Crown } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import type { SharedList, Invitation } from '@/types'

interface Member {
  id: string
  user_id: string
  role: 'owner' | 'member'
  joined_at: string
  profiles: { id: string; name: string | null; email: string; avatar_url: string | null } | null
}

interface ListSettingsClientProps {
  list: SharedList
  members: Member[]
  invitations: Invitation[]
  currentUserId: string
  currentUserRole: 'owner' | 'member'
}

export function ListSettingsClient({ list, members, invitations, currentUserId, currentUserRole }: ListSettingsClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [copied, setCopied] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')

  function copyCode() {
    navigator.clipboard.writeText(list.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteError('')
    setInviteSuccess('')
    setInviteLoading(true)

    const email = inviteEmail.trim().toLowerCase()

    // Check if user already exists in the list
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingProfile) {
      // Check if already a member
      const alreadyMember = members.some((m) => m.profiles?.email === email)
      if (alreadyMember) {
        setInviteError('This person is already a member of your list.')
        setInviteLoading(false)
        return
      }

      // Add them directly
      const { error } = await supabase
        .from('shared_list_members')
        .insert({ list_id: list.id, user_id: existingProfile.id, role: 'member' })

      if (error) {
        setInviteError(error.message)
      } else {
        setInviteSuccess(`${email} has been added to your list!`)
        setInviteEmail('')
        router.refresh()
      }
    } else {
      // Store invitation
      const { error } = await supabase
        .from('invitations')
        .upsert({ list_id: list.id, invited_email: email, invited_by: currentUserId }, { onConflict: 'list_id,invited_email' })

      if (error) {
        setInviteError(error.message)
      } else {
        setInviteSuccess(`Invitation sent to ${email}. They'll see it when they sign up.`)
        setInviteEmail('')
        router.refresh()
      }
    }

    setInviteLoading(false)
  }

  return (
    <div className="space-y-4">
      {/* List info */}
      <div className="bg-espresso-800 border border-espresso-700 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-espresso-200 mb-3">Your List</h2>
        <p className="text-lg font-bold text-espresso-50">{list.name}</p>

        <div className="mt-4">
          <p className="text-xs text-espresso-400 mb-2">Invite code — share this with your partner</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-espresso-700 border border-espresso-600 rounded-lg px-3 py-2 font-mono text-sm text-gold-400 tracking-[0.2em]">
              {list.invite_code}
            </div>
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-espresso-700 hover:bg-espresso-600 border border-espresso-600 rounded-lg text-espresso-200 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="bg-espresso-800 border border-espresso-700 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-espresso-200 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Members ({members.length})
        </h2>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center text-xs font-bold text-espresso-900 flex-shrink-0">
                {getInitials(m.profiles?.name || null, m.profiles?.email || '')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-espresso-100 truncate">{m.profiles?.name || m.profiles?.email}</p>
                {m.profiles?.name && <p className="text-xs text-espresso-400 truncate">{m.profiles?.email}</p>}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {m.user_id === list.created_by ? (
                  <span className="flex items-center gap-1 text-xs text-gold-400">
                    <Crown className="w-3 h-3" />
                    Owner
                  </span>
                ) : (
                  <span className="text-xs text-espresso-400">Member</span>
                )}
                {m.user_id === currentUserId && (
                  <span className="text-xs text-espresso-500">(you)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite */}
      <div className="bg-espresso-800 border border-espresso-700 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-espresso-200 mb-3 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Invite by Email
        </h2>
        <form onSubmit={sendInvite} className="space-y-3">
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            type="email"
            placeholder="partner@example.com"
            required
            className="w-full bg-espresso-700 border border-espresso-600 rounded-lg px-3 py-2 text-sm text-espresso-50 placeholder-espresso-400
              focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-colors"
          />
          {inviteError && <p className="text-xs text-red-400">{inviteError}</p>}
          {inviteSuccess && <p className="text-xs text-green-400">{inviteSuccess}</p>}
          <button
            type="submit"
            disabled={inviteLoading}
            className="w-full py-2 text-sm font-medium bg-gold-500 hover:bg-gold-400 text-espresso-900 rounded-lg transition-colors disabled:opacity-50"
          >
            {inviteLoading ? 'Sending…' : 'Send Invite'}
          </button>
        </form>
      </div>

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <div className="bg-espresso-800 border border-espresso-700 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-espresso-200 mb-3">Pending Invitations</h2>
          <div className="space-y-2">
            {invitations.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between text-sm">
                <span className="text-espresso-300">{inv.invited_email}</span>
                <span className="text-xs text-espresso-500">Awaiting signup</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

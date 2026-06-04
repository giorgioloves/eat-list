'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Users } from 'lucide-react'
import { createSharedList, joinSharedList } from './actions'

export default function OnboardingClient() {
  const router = useRouter()

  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')
  const [listName, setListName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await createSharedList(listName)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await joinSharedList(inviteCode)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  if (mode === 'choose') {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setMode('create')}
          className="w-full flex items-center gap-3 p-4 bg-espresso-800 border border-espresso-700 rounded-xl
            hover:border-gold-500/50 hover:bg-gold-500/5 transition-all text-left"
        >
          <div className="w-10 h-10 bg-gold-500/20 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <p className="font-medium text-espresso-50">Create a new list</p>
            <p className="text-sm text-espresso-400">Start fresh and invite your partner</p>
          </div>
        </button>
        <button
          onClick={() => setMode('join')}
          className="w-full flex items-center gap-3 p-4 bg-espresso-800 border border-espresso-700 rounded-xl
            hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left"
        >
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-espresso-50">Join an existing list</p>
            <p className="text-sm text-espresso-400">Enter an invite code from your partner</p>
          </div>
        </button>
      </div>
    )
  }

  if (mode === 'create') {
    return (
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-espresso-300 mb-1.5">List name</label>
          <input
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="Our Restaurant List"
            required
            className="w-full bg-espresso-800 border border-espresso-600 rounded-lg px-3 py-2.5 text-sm text-espresso-50 placeholder-espresso-400
              focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-colors"
          />
        </div>
        {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">{error}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => { setMode('choose'); setError('') }}
            className="flex-1 py-2.5 text-sm text-espresso-300 border border-espresso-600 rounded-lg hover:bg-espresso-700 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-semibold bg-gold-500 hover:bg-gold-400 text-espresso-900 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create List'}
          </button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleJoin} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-espresso-300 mb-1.5">Invite code</label>
        <input
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="e.g. ABC12345"
          required
          className="w-full bg-espresso-800 border border-espresso-600 rounded-lg px-3 py-2.5 text-sm text-espresso-50 placeholder-espresso-400
            focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-colors uppercase tracking-widest"
        />
        <p className="text-xs text-espresso-400 mt-1.5">Ask your partner for the 8-character code from their list settings</p>
      </div>
      {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">{error}</p>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => { setMode('choose'); setError('') }}
          className="flex-1 py-2.5 text-sm text-espresso-300 border border-espresso-600 rounded-lg hover:bg-espresso-700 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 text-sm font-semibold bg-gold-500 hover:bg-gold-400 text-espresso-900 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Joining…' : 'Join List'}
        </button>
      </div>
    </form>
  )
}

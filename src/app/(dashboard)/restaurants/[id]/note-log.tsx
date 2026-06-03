'use client'

import { useState } from 'react'
import { Plus, Trash2, MessageSquare } from 'lucide-react'
import { addNote, deleteNote } from './actions'
import { formatDate } from '@/lib/utils'
import type { RestaurantNote } from '@/types'

interface NoteLogProps {
  restaurantId: string
  notes: RestaurantNote[]
}

export function NoteLog({ restaurantId, notes }: NoteLogProps) {
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setError('')
    setLoading(true)

    const result = await addNote(restaurantId, content)

    if (result.error) {
      setError(result.error)
    } else {
      setContent('')
      setShowForm(false)
    }
    setLoading(false)
  }

  async function handleDelete(noteId: string) {
    setDeletingId(noteId)
    await deleteNote(noteId, restaurantId)
    setDeletingId(null)
  }

  return (
    <div className="bg-espresso-800 border border-espresso-700 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-espresso-200">
          Notes
          {notes.length > 0 && (
            <span className="ml-2 text-xs text-espresso-400 font-normal">
              {notes.length}
            </span>
          )}
        </h3>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-gold-500 hover:bg-gold-400 text-espresso-900 font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Note
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mb-4 p-4 bg-espresso-700 border border-espresso-600 rounded-xl space-y-3"
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a note…"
            rows={3}
            required
            className="w-full bg-espresso-800 border border-espresso-500 rounded-lg px-2.5 py-1.5 text-sm text-espresso-50 placeholder-espresso-400 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-colors resize-none"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setContent(''); setError('') }}
              className="px-3 py-1.5 text-xs text-espresso-300 border border-espresso-500 rounded-lg hover:bg-espresso-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="flex-1 py-1.5 text-xs font-semibold bg-gold-500 hover:bg-gold-400 text-espresso-900 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Save Note'}
            </button>
          </div>
        </form>
      )}

      {notes.length === 0 ? (
        <p className="text-sm text-espresso-400 py-2">No notes yet.</p>
      ) : (
        <div className="space-y-2">
          {notes.map((n) => (
            <div
              key={n.id}
              className="flex items-start gap-3 p-3 bg-espresso-700/50 rounded-lg group"
            >
              <MessageSquare className="w-3.5 h-3.5 text-espresso-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-espresso-100 leading-relaxed">{n.content}</p>
                <p className="text-xs text-espresso-500 mt-1">
                  {(n.profiles as any)?.name || 'Someone'}
                  {' · '}
                  {formatDate(n.created_at)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(n.id)}
                disabled={deletingId === n.id}
                className="opacity-0 group-hover:opacity-100 p-1 text-espresso-500 hover:text-red-400 transition-all disabled:opacity-50 flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

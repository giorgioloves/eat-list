'use client'

import { useState } from 'react'
import { Plus, Trash2, MessageSquare } from 'lucide-react'
import { addNote, deleteNote } from './actions'
import { formatDate } from '@/lib/utils'
import type { RestaurantNote } from '@/types'

const T = {
  parchment:  '#f5f0e8',
  linen:      '#ede5d8',
  espresso:   '#3b2f27',
  terracotta: '#c4927a',
  stone:      '#c4b8a8',
  mist:       '#a08070',
  ghost:      '#b8a898',
  border:     '#c4b8a8',
}

interface NoteLogProps {
  restaurantId: string
  notes: RestaurantNote[]
}

export function NoteLog({ restaurantId, notes }: NoteLogProps) {
  const [showForm, setShowForm]     = useState(false)
  const [content, setContent]       = useState('')
  const [loading, setLoading]       = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError]           = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setError('')
    setLoading(true)
    const result = await addNote(restaurantId, content)
    if (result.error) { setError(result.error) } else { setContent(''); setShowForm(false) }
    setLoading(false)
  }

  async function handleDelete(noteId: string) {
    setDeletingId(noteId)
    await deleteNote(noteId, restaurantId)
    setDeletingId(null)
  }

  return (
    <div style={{
      backgroundColor: T.linen,
      border:          `0.5px solid ${T.border}`,
      borderRadius:    10,
      padding:         '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 10, color: T.mist, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>
            notes
          </span>
          {notes.length > 0 && (
            <span style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 10, color: T.ghost }}>
              {notes.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            display:         'flex',
            alignItems:      'center',
            gap:             4,
            fontFamily:      'var(--font-dm-mono), ui-monospace, monospace',
            fontSize: 10,
            letterSpacing:   '0.08em',
            color:           T.parchment,
            backgroundColor: T.espresso,
            border:          'none',
            padding:         '5px 9px',
            borderRadius:    6,
            cursor:          'pointer',
          }}
        >
          <Plus style={{ width: 10, height: 10 }} />
          add note
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={{
          marginBottom:    12,
          padding:         12,
          backgroundColor: T.parchment,
          border:          `0.5px solid ${T.border}`,
          borderRadius:    8,
          display:         'flex',
          flexDirection:   'column',
          gap:             8,
        }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="write a note…"
            rows={3}
            required
            style={{
              width:           '100%',
              backgroundColor: T.linen,
              border:          `0.5px solid ${T.border}`,
              borderRadius:    6,
              padding:         '8px 10px',
              fontFamily:      'var(--font-crimson), Georgia, serif',
              fontSize: 16,
              color:           T.espresso,
              outline:         'none',
              resize:          'none',
              boxSizing:       'border-box',
            }}
          />
          {error && <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 11, color: '#c47a7a' }}>{error}</p>}
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" onClick={() => { setShowForm(false); setContent(''); setError('') }} style={{
              padding: '6px 12px', fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 10,
              color: T.mist, backgroundColor: T.linen, border: `0.5px solid ${T.border}`, borderRadius: 6, cursor: 'pointer',
            }}>cancel</button>
            <button type="submit" disabled={loading || !content.trim()} style={{
              flex: 1, padding: '6px 0', fontFamily: 'var(--font-crimson), Georgia, serif', fontStyle: 'italic', fontSize: 16,
              color: T.parchment, backgroundColor: T.espresso, border: 'none', borderRadius: 6,
              cursor: loading || !content.trim() ? 'not-allowed' : 'pointer', opacity: loading || !content.trim() ? 0.6 : 1,
            }}>
              {loading ? 'saving…' : 'save note'}
            </button>
          </div>
        </form>
      )}

      {notes.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 12, color: T.ghost, padding: '6px 0' }}>no notes yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {notes.map((n) => (
            <div key={n.id} style={{
              display:         'flex',
              alignItems:      'flex-start',
              gap:             10,
              padding:         '9px 10px',
              backgroundColor: T.parchment,
              border:          `0.5px solid ${T.border}`,
              borderRadius:    7,
            }}>
              <MessageSquare style={{ width: 11, height: 11, color: T.stone, marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: 16, color: T.espresso, lineHeight: 1.5 }}>
                  {n.content}
                </p>
                <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 10, color: T.ghost, marginTop: 4 }}>
                  {formatDate(n.created_at)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(n.id)}
                disabled={deletingId === n.id}
                style={{ padding: 3, color: T.stone, background: 'none', border: 'none', cursor: 'pointer', opacity: deletingId === n.id ? 0.4 : 1, flexShrink: 0 }}
              >
                <Trash2 style={{ width: 12, height: 12 }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

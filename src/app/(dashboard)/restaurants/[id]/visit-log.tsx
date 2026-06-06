'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { logVisit, deleteVisit, updateVisit, rateVisit } from './actions'
import { formatDate } from '@/lib/utils'
import { PipRating, PipSelector } from '@/components/ui/pip-rating'
import type { RestaurantVisit } from '@/types'

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

interface VisitLogProps {
  restaurantId: string
  visits: RestaurantVisit[]
}

const inputStyle: React.CSSProperties = {
  width:           '100%',
  backgroundColor: T.parchment,
  border:          `0.5px solid ${T.border}`,
  borderRadius:    6,
  padding:         '6px 10px',
  fontFamily:      'var(--font-crimson), Georgia, serif',
  fontSize: 16,
  color:           T.espresso,
  outline:         'none',
  boxSizing:       'border-box',
}

export function VisitLog({ restaurantId, visits }: VisitLogProps) {
  const [showForm, setShowForm]       = useState(false)
  const [date, setDate]               = useState('')
  const [cost, setCost]               = useState('')
  const [myRating, setMyRating]       = useState<number | null>(null)
  const [loading, setLoading]         = useState(false)
  const [deletingId, setDeletingId]   = useState<string | null>(null)
  const [editingId, setEditingId]     = useState<string | null>(null)
  const [ratingVisitId, setRatingVisitId] = useState<string | null>(null)
  const [error, setError]             = useState('')

  function resetForm() {
    setShowForm(false)
    setError('')
    setDate('')
    setCost('')
    setMyRating(null)
  }

  async function handleLog(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await logVisit(restaurantId, date || null, cost ? parseFloat(cost) : null, myRating)
    if (result.error) { setError(result.error) } else { resetForm() }
    setLoading(false)
  }

  async function handleDelete(visitId: string) {
    setDeletingId(visitId)
    await deleteVisit(visitId, restaurantId)
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
            visit history
          </span>
          {visits.length > 0 && (
            <span style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 10, color: T.ghost }}>
              {visits.length}
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
          log visit
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleLog} style={{
          marginBottom:    12,
          padding:         12,
          backgroundColor: T.parchment,
          border:          `0.5px solid ${T.border}`,
          borderRadius:    8,
          display:         'flex',
          flexDirection:   'column',
          gap:             10,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 10, color: T.mist, letterSpacing: '0.1em', marginBottom: 5 }}>date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 10, color: T.mist, letterSpacing: '0.1em', marginBottom: 5 }}>spent</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.mist, fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: 16 }}>$</span>
                <input type="number" min="0" step="0.50" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" style={{ ...inputStyle, paddingLeft: 22 }} />
              </div>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 10, color: T.mist, letterSpacing: '0.1em', marginBottom: 8 }}>rating</label>
            <PipSelector value={myRating} onChange={setMyRating} />
          </div>
          {error && <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 11, color: '#c47a7a' }}>{error}</p>}
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" onClick={resetForm} style={{
              padding:         '6px 12px',
              fontFamily:      'var(--font-dm-mono), ui-monospace, monospace',
              fontSize: 10,
              color:           T.mist,
              backgroundColor: T.linen,
              border:          `0.5px solid ${T.border}`,
              borderRadius:    6,
              cursor:          'pointer',
            }}>cancel</button>
            <button type="submit" disabled={loading} style={{
              flex:            1,
              padding:         '6px 0',
              fontFamily:      'var(--font-crimson), Georgia, serif',
              fontStyle:       'italic',
              fontSize: 16,
              color:           T.parchment,
              backgroundColor: T.espresso,
              border:          'none',
              borderRadius:    6,
              cursor:          loading ? 'not-allowed' : 'pointer',
              opacity:         loading ? 0.6 : 1,
            }}>
              {loading ? 'saving…' : 'save visit'}
            </button>
          </div>
        </form>
      )}

      {visits.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 12, color: T.ghost, padding: '6px 0' }}>no visits logged yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {visits.map((v) => (
            editingId === v.id ? (
              <EditVisitRow
                key={v.id}
                visit={v}
                restaurantId={restaurantId}
                onDone={() => setEditingId(null)}
              />
            ) : (
              <div key={v.id} style={{
                padding:         '8px 10px',
                backgroundColor: T.parchment,
                border:          `0.5px solid ${T.border}`,
                borderRadius:    7,
              }} className="group">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
                      <span style={{ fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: 16, color: T.espresso }}>
                        {formatDate(v.visited_at)}
                      </span>
                      {v.cost !== null && (
                        <span style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 11, color: T.mist }}>
                          ${v.cost.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      {ratingVisitId === v.id ? (
                        <InlineRater
                          visitId={v.id}
                          restaurantId={restaurantId}
                          initialRating={v.rating}
                          onDone={() => setRatingVisitId(null)}
                        />
                      ) : v.rating !== null ? (
                        <button
                          onClick={() => setRatingVisitId(v.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                        >
                          <PipRating rating={v.rating} size="sm" />
                          <Pencil style={{ width: 10, height: 10, color: T.stone }} />
                        </button>
                      ) : (
                        <button
                          onClick={() => setRatingVisitId(v.id)}
                          style={{
                            display:     'flex',
                            alignItems:  'center',
                            gap:         4,
                            fontFamily:  'var(--font-dm-mono), ui-monospace, monospace',
                            fontSize: 10,
                            color:       T.terracotta,
                            background:  'none',
                            border:      'none',
                            cursor:      'pointer',
                            padding:     0,
                            letterSpacing: '0.06em',
                          }}
                        >
                          <Plus style={{ width: 9, height: 9 }} />
                          add rating
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                    <button
                      onClick={() => setEditingId(v.id)}
                      style={{ padding: 4, color: T.stone, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Pencil style={{ width: 12, height: 12 }} />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      disabled={deletingId === v.id}
                      style={{ padding: 4, color: T.stone, background: 'none', border: 'none', cursor: 'pointer', opacity: deletingId === v.id ? 0.4 : 1 }}
                    >
                      <Trash2 style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  )
}

function InlineRater({ visitId, restaurantId, initialRating, onDone }: {
  visitId: string
  restaurantId: string
  initialRating: number | null
  onDone: () => void
}) {
  const [rating, setRating]   = useState<number | null>(initialRating)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  async function handleSave() {
    if (rating === null) return
    setSaving(true)
    setError('')
    const result = await rateVisit(visitId, restaurantId, rating)
    if (result.error) { setError(result.error); setSaving(false) } else { onDone() }
  }

  async function handleRemove() {
    setSaving(true)
    setError('')
    const result = await rateVisit(visitId, restaurantId, null)
    if (result.error) { setError(result.error); setSaving(false) } else { onDone() }
  }

  const btnBase: React.CSSProperties = {
    padding:    '4px 10px',
    fontFamily: 'var(--font-dm-mono), ui-monospace, monospace',
    fontSize: 10,
    borderRadius: 5,
    cursor:     saving ? 'not-allowed' : 'pointer',
    border:     'none',
    letterSpacing: '0.06em',
  }

  return (
    <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {error && <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 11, color: '#c47a7a' }}>{error}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
        <PipSelector value={rating} onChange={setRating} />
        <div style={{ display: 'flex', gap: 5 }}>
          <button onClick={handleSave} disabled={saving || rating === null} style={{ ...btnBase, backgroundColor: T.espresso, color: T.parchment, opacity: saving || rating === null ? 0.5 : 1 }}>
            {saving ? '…' : 'save'}
          </button>
          {initialRating !== null && (
            <button onClick={handleRemove} disabled={saving} style={{ ...btnBase, backgroundColor: T.linen, color: '#c47a7a', border: `0.5px solid #c47a7a` }}>
              remove
            </button>
          )}
          <button onClick={onDone} style={{ ...btnBase, backgroundColor: T.linen, color: T.mist, border: `0.5px solid ${T.border}` }}>
            cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function EditVisitRow({ visit, restaurantId, onDone }: {
  visit: RestaurantVisit
  restaurantId: string
  onDone: () => void
}) {
  const [date, setDate]     = useState(visit.visited_at ?? '')
  const [cost, setCost]     = useState(visit.cost != null ? String(visit.cost) : '')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const result = await updateVisit(visit.id, restaurantId, date || null, cost ? parseFloat(cost) : null)
    if (result.error) { setError(result.error); setSaving(false) } else { onDone() }
  }

  return (
    <form onSubmit={handleSave} style={{
      padding:         10,
      backgroundColor: T.parchment,
      border:          `0.5px solid ${T.terracotta}`,
      borderRadius:    7,
      display:         'flex',
      flexDirection:   'column',
      gap:             8,
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 10, color: T.mist, letterSpacing: '0.1em', marginBottom: 4 }}>date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 10, color: T.mist, letterSpacing: '0.1em', marginBottom: 4 }}>spent</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.mist, fontFamily: 'var(--font-crimson), Georgia, serif', fontSize: 16 }}>$</span>
            <input type="number" min="0" step="0.50" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" style={{ ...inputStyle, paddingLeft: 22 }} />
          </div>
        </div>
      </div>
      {error && <p style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 11, color: '#c47a7a' }}>{error}</p>}
      <div style={{ display: 'flex', gap: 6 }}>
        <button type="button" onClick={onDone} style={{
          padding: '6px 12px', fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 10,
          color: T.mist, backgroundColor: T.linen, border: `0.5px solid ${T.border}`, borderRadius: 6, cursor: 'pointer',
        }}>cancel</button>
        <button type="submit" disabled={saving} style={{
          flex: 1, padding: '6px 0', fontFamily: 'var(--font-crimson), Georgia, serif', fontStyle: 'italic', fontSize: 16,
          color: T.parchment, backgroundColor: T.espresso, border: 'none', borderRadius: 6,
          cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
        }}>
          {saving ? 'saving…' : 'save'}
        </button>
      </div>
    </form>
  )
}

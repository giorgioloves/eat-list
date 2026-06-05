'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { logVisit, deleteVisit, updateVisit, rateVisit } from './actions'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { PipRating, PipSelector } from '@/components/ui/pip-rating'
import type { RestaurantVisit } from '@/types'

interface VisitLogProps {
  restaurantId: string
  visits: RestaurantVisit[]
}

export function VisitLog({ restaurantId, visits }: VisitLogProps) {
  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState('')
  const [cost, setCost] = useState('')
  const [myRating, setMyRating] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [ratingVisitId, setRatingVisitId] = useState<string | null>(null)
  const [error, setError] = useState('')

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
    if (result.error) {
      setError(result.error)
    } else {
      resetForm()
    }
    setLoading(false)
  }

  async function handleDelete(visitId: string) {
    setDeletingId(visitId)
    await deleteVisit(visitId, restaurantId)
    setDeletingId(null)
  }

  return (
    <div className="bg-espresso-800 border border-espresso-700 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-espresso-200">
          Visit History
          {visits.length > 0 && (
            <span className="ml-2 text-xs text-espresso-400 font-normal">
              {visits.length} visit{visits.length !== 1 ? 's' : ''}
            </span>
          )}
        </h3>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-gold-500 hover:bg-gold-400 text-espresso-900 font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Log Visit
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleLog} className="mb-4 p-4 bg-espresso-700 border border-espresso-600 rounded-xl space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-espresso-400 mb-1.5">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-espresso-400 mb-1.5">Spent</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-espresso-400 text-sm">$</span>
                <input type="number" min="0" step="0.50" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" className={cn(inputCls, 'pl-6')} />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs text-espresso-400 mb-2">Rating</label>
            <PipSelector value={myRating} onChange={setMyRating} />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={resetForm} className="px-3 py-1.5 text-xs text-espresso-300 border border-espresso-500 rounded-lg hover:bg-espresso-600 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-1.5 text-xs font-semibold bg-gold-500 hover:bg-gold-400 text-espresso-900 rounded-lg transition-colors disabled:opacity-50">
              {loading ? 'Saving…' : 'Save Visit'}
            </button>
          </div>
        </form>
      )}

      {visits.length === 0 ? (
        <p className="text-sm text-espresso-400 py-2">No visits logged yet.</p>
      ) : (
        <div className="space-y-2">
          {visits.map((v) => (
            editingId === v.id ? (
              <EditVisitRow
                key={v.id}
                visit={v}
                restaurantId={restaurantId}
                onDone={() => setEditingId(null)}
              />
            ) : (
              <div key={v.id} className="p-3 bg-espresso-700/50 rounded-lg group">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-espresso-200">{formatDate(v.visited_at)}</span>
                      {v.cost !== null && (
                        <span className="text-xs text-espresso-300 font-medium">${v.cost.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="mt-1.5">
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
                          className="flex items-center gap-2 hover:bg-espresso-700 rounded px-1 -mx-1 transition-colors"
                        >
                          <PipRating rating={v.rating} size="sm" />
                          <Pencil className="w-3 h-3 text-espresso-500" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setRatingVisitId(v.id)}
                          className="flex items-center gap-1.5 text-xs text-espresso-500 hover:text-gold-400 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Add rating
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                    <button
                      onClick={() => setEditingId(v.id)}
                      className="p-1 text-espresso-500 hover:text-espresso-200 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      disabled={deletingId === v.id}
                      className="p-1 text-espresso-500 hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
  const [rating, setRating] = useState<number | null>(initialRating)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (rating === null) return
    setSaving(true)
    setError('')
    const result = await rateVisit(visitId, restaurantId, rating)
    if (result.error) {
      setError(result.error)
      setSaving(false)
    } else {
      onDone()
    }
  }

  async function handleRemove() {
    setSaving(true)
    setError('')
    const result = await rateVisit(visitId, restaurantId, null)
    if (result.error) {
      setError(result.error)
      setSaving(false)
    } else {
      onDone()
    }
  }

  return (
    <div className="mt-2 space-y-1.5">
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex items-center gap-2 flex-wrap">
        <PipSelector value={rating} onChange={setRating} />
        <div className="flex gap-1.5">
          <button
            onClick={handleSave}
            disabled={saving || rating === null}
            className="px-2.5 py-1 text-xs font-semibold bg-gold-500 hover:bg-gold-400 text-espresso-900 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? '…' : 'Save'}
          </button>
          {initialRating !== null && (
            <button
              onClick={handleRemove}
              disabled={saving}
              className="px-2.5 py-1 text-xs text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition-colors disabled:opacity-50"
            >
              Remove
            </button>
          )}
          <button
            onClick={onDone}
            className="px-2.5 py-1 text-xs text-espresso-400 border border-espresso-600 rounded-lg hover:bg-espresso-700 transition-colors"
          >
            Cancel
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
  const [date, setDate] = useState(visit.visited_at ?? '')
  const [cost, setCost] = useState(visit.cost != null ? String(visit.cost) : '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const result = await updateVisit(visit.id, restaurantId, date || null, cost ? parseFloat(cost) : null)
    if (result.error) {
      setError(result.error)
      setSaving(false)
    } else {
      onDone()
    }
  }

  return (
    <form onSubmit={handleSave} className="p-3 bg-espresso-700 border border-gold-500/30 rounded-lg space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-espresso-400 mb-1">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-espresso-400 mb-1">Spent</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-espresso-400 text-sm">$</span>
            <input type="number" min="0" step="0.50" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" className={cn(inputCls, 'pl-6')} />
          </div>
        </div>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={onDone} className="px-3 py-1.5 text-xs text-espresso-300 border border-espresso-500 rounded-lg hover:bg-espresso-600 transition-colors">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 py-1.5 text-xs font-semibold bg-gold-500 hover:bg-gold-400 text-espresso-900 rounded-lg transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}

const inputCls =
  'w-full bg-espresso-800 border border-espresso-500 rounded-lg px-2.5 py-1.5 text-sm text-espresso-50 placeholder-espresso-400 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-colors'

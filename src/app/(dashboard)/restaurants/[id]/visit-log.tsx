'use client'

import { useState } from 'react'
import { Plus, Trash2, Calendar } from 'lucide-react'
import { logVisit, deleteVisit } from './actions'
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
  const [rating, setRating] = useState<number | null>(null)
  const [cost, setCost] = useState('')
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleLog(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await logVisit(
      restaurantId,
      date || null,
      rating,
      cost ? parseFloat(cost) : null
    )

    if (result.error) {
      setError(result.error)
    } else {
      setShowForm(false)
      setDate('')
      setRating(null)
      setCost('')
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

      {/* Add visit form */}
      {showForm && (
        <form
          onSubmit={handleLog}
          className="mb-4 p-4 bg-espresso-700 border border-espresso-600 rounded-xl space-y-4"
        >
          {/* Date + Cost row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-espresso-400 mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-espresso-400 mb-1.5">Spent</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-espresso-400 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.50"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  className={cn(inputCls, 'pl-6')}
                />
              </div>
            </div>
          </div>

          {/* Rating pips */}
          <div>
            <label className="block text-xs text-espresso-400 mb-2">Rating</label>
            <PipSelector value={rating} onChange={setRating} />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setError('') }}
              className="px-3 py-1.5 text-xs text-espresso-300 border border-espresso-500 rounded-lg hover:bg-espresso-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-1.5 text-xs font-semibold bg-gold-500 hover:bg-gold-400 text-espresso-900 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Save Visit'}
            </button>
          </div>
        </form>
      )}

      {/* Visit list */}
      {visits.length === 0 ? (
        <p className="text-sm text-espresso-400 py-2">No visits logged yet.</p>
      ) : (
        <div className="space-y-2">
          {visits.map((v) => (
            <div
              key={v.id}
              className="flex items-start gap-3 p-3 bg-espresso-700/50 rounded-lg group"
            >
              <Calendar className="w-3.5 h-3.5 text-espresso-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-espresso-200">{formatDate(v.visited_at)}</span>
                  {v.rating !== null && <PipRating rating={v.rating} size="sm" />}
                  {v.cost !== null && (
                    <span className="text-xs text-espresso-300 font-medium">
                      ${v.cost.toFixed(2)}
                    </span>
                  )}
                  {(v.profiles as any)?.name && (
                    <span className="text-xs text-espresso-500">
                      · {(v.profiles as any).name}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(v.id)}
                disabled={deletingId === v.id}
                className="opacity-0 group-hover:opacity-100 p-1 text-espresso-500 hover:text-red-400 transition-all disabled:opacity-50"
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

const inputCls =
  'w-full bg-espresso-800 border border-espresso-500 rounded-lg px-2.5 py-1.5 text-sm text-espresso-50 placeholder-espresso-400 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-colors'

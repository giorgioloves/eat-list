import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge, TierBadge } from '@/components/ui/badge'
import { PipRating } from '@/components/ui/pip-rating'
import { ArrowLeft, Pencil, MapPin } from 'lucide-react'
import { VisitLog } from './visit-log'
import { NoteLog } from './note-log'
import { WouldGoAgainToggle } from './would-go-again'
import type { Restaurant, RestaurantVisit, RestaurantNote } from '@/types'

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single()

  if (!restaurant) notFound()

  const r = restaurant as Restaurant

  const { data: visits } = await supabase
    .from('restaurant_visits')
    .select('*, profiles(name, email)')
    .eq('restaurant_id', id)
    .order('visited_at', { ascending: false })

  const { data: notes } = await supabase
    .from('restaurant_notes')
    .select('*, profiles(name, email)')
    .eq('restaurant_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/restaurants"
            className="p-1.5 rounded-lg text-espresso-300 hover:text-espresso-50 hover:bg-espresso-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-espresso-50 truncate">{r.name}</h1>
        </div>
        <Link
          href={`/restaurants/${r.id}/edit`}
          className="flex items-center gap-1.5 text-sm text-espresso-300 hover:text-espresso-50 border border-espresso-600 hover:border-espresso-500 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </Link>
      </div>

      <div className="space-y-3">
        {/* Header card */}
        <div className="bg-espresso-800 border border-espresso-700 rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="text-2xl font-bold text-espresso-50">{r.name}</h2>
              {r.cuisine && <p className="text-espresso-300 mt-0.5">{r.cuisine}</p>}
              {(r.address || r.suburb) && (
                <div className="flex items-center gap-1.5 text-sm text-espresso-400 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {[r.address, r.suburb].filter(Boolean).join(', ')}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([r.name, r.address, r.suburb].filter(Boolean).join(', '))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-500 hover:text-gold-400 ml-1"
                  >
                    ↗
                  </a>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {r.tier && <TierBadge tier={r.tier} />}
              <PipRating rating={r.rating} />
              {r.price_level && (
                <span className="text-xs text-espresso-400 font-medium">{r.price_level}</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={r.status} />
          </div>

          {r.status === 'visited' && (
            <div className="mt-3 pt-3 border-t border-espresso-700">
              <p className="text-xs text-espresso-400 mb-2">Would go again?</p>
              <WouldGoAgainToggle restaurantId={r.id} current={r.would_go_again} />
            </div>
          )}
        </div>

        {/* Visit log */}
        <VisitLog
          restaurantId={r.id}
          visits={(visits || []) as RestaurantVisit[]}
        />

        {/* Note log */}
        <NoteLog
          restaurantId={r.id}
          notes={(notes || []) as RestaurantNote[]}
        />
      </div>
    </div>
  )
}

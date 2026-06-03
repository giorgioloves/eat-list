import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/badge'
import { PipRating } from '@/components/ui/pip-rating'
import { Plus, UtensilsCrossed, Star, BookMarked, MapPin, ArrowRight, TrendingUp, RotateCcw } from 'lucide-react'
import type { Restaurant } from '@/types'
import OnboardingClient from './onboarding-client'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user's list memberships
  const { data: memberships } = await supabase
    .from('shared_list_members')
    .select('list_id, role, shared_lists(id, name, invite_code)')
    .eq('user_id', user.id)

  if (!memberships || memberships.length === 0) {
    return <OnboardingPage userId={user.id} />
  }

  const sharedList = memberships[0].shared_lists as unknown as { id: string; name: string; invite_code: string }
  const listId = sharedList.id
  const listName = sharedList.name

  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('*')
    .eq('list_id', listId)
    .order('created_at', { ascending: false })

  const all = (restaurants || []) as Restaurant[]
  const visited = all.filter((r) => r.status === 'visited')
  const wishlist = all.filter((r) => r.status === 'want_to_try')
  const rated = all.filter((r) => r.rating !== null)
  const avgRating = rated.length > 0
    ? (rated.reduce((sum, r) => sum + (r.rating ?? 0), 0) / rated.length).toFixed(1)
    : null

  const recent = all.slice(0, 6)

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-espresso-50">{listName}</h1>
          <p className="text-sm text-espresso-300 mt-0.5">Your shared restaurant list</p>
        </div>
        <Link
          href="/restaurants/add"
          className="flex items-center gap-1.5 bg-gold-500 hover:bg-gold-400 text-espresso-900 font-semibold text-sm px-3 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total" value={all.length} icon={<UtensilsCrossed className="w-4 h-4" />} />
        <StatCard label="Visited" value={visited.length} icon={<Star className="w-4 h-4 text-green-400" />} />
        <StatCard label="Want to Try" value={wishlist.length} icon={<BookMarked className="w-4 h-4 text-blue-400" />} />
        <StatCard label="Avg Rating" value={avgRating ?? '—'} icon={<TrendingUp className="w-4 h-4 text-gold-400" />} />
      </div>

      {/* Recent restaurants */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-espresso-200">Recent Activity</h2>
        <Link href="/restaurants" className="flex items-center gap-1 text-xs text-gold-500 hover:text-gold-400 transition-colors">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {recent.map((r) => (
            <Link
              key={r.id}
              href={`/restaurants/${r.id}`}
              className="flex items-center gap-3 p-3 bg-espresso-800 border border-espresso-700 rounded-xl hover:border-espresso-600 hover:bg-espresso-700/50 transition-all group"
            >
              <div className="w-10 h-10 bg-espresso-700 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-espresso-600 transition-colors">
                <MapPin className="w-4 h-4 text-espresso-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-espresso-50 truncate">{r.name}</span>
                  <PipRating rating={r.rating} size="sm" />
                  {r.visit_count > 1 && (
                    <span className="flex items-center gap-0.5 text-xs text-espresso-500 flex-shrink-0">
                      <RotateCcw className="w-3 h-3" />
                      {r.visit_count}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <StatusBadge status={r.status} />
                  {r.cuisine && <span className="text-xs text-espresso-400">{r.cuisine}</span>}
                  {r.price_level && <span className="text-xs text-espresso-400">{r.price_level}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  )
}

function StatCard({ label, value, icon }: {
  label: string; value: number | string; icon: React.ReactNode
}) {
  return (
    <div className="bg-espresso-800 border border-espresso-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-espresso-400">{label}</span>
        <span className="text-espresso-400">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-espresso-50">{value}</p>
    </div>
  )
}


function EmptyState() {
  return (
    <div className="text-center py-12 bg-espresso-800 border border-espresso-700 rounded-xl">
      <UtensilsCrossed className="w-10 h-10 text-espresso-500 mx-auto mb-3" />
      <p className="text-espresso-200 font-medium">No restaurants yet</p>
      <p className="text-espresso-400 text-sm mt-1">Add your first restaurant to get started</p>
      <Link
        href="/restaurants/add"
        className="inline-flex items-center gap-2 mt-4 bg-gold-500 hover:bg-gold-400 text-espresso-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Restaurant
      </Link>
    </div>
  )
}

async function OnboardingPage({ userId }: { userId: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-8 h-8 text-espresso-900" />
          </div>
          <h1 className="text-2xl font-bold text-espresso-50">Welcome to Eat List</h1>
          <p className="text-espresso-300 mt-2">Create or join a shared list to get started</p>
        </div>
        <OnboardingActions userId={userId} />
      </div>
    </div>
  )
}

function OnboardingActions({ userId }: { userId: string }) {
  return <OnboardingClient userId={userId} />
}

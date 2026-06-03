'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createClient } from '@/lib/supabase/client'
import { TIERS, TIER_COLORS, TIER_BG_COLORS, STATUS_LABELS } from '@/types'
import { RotateCcw } from 'lucide-react'
import { PipRating } from '@/components/ui/pip-rating'
import type { Restaurant, Tier } from '@/types'

interface TierBoardProps {
  restaurants: Restaurant[]
}

type TierGroup = { [key: string]: Restaurant[] }

function groupByTier(restaurants: Restaurant[]): TierGroup {
  const groups: TierGroup = { untiered: [] }
  for (const tier of TIERS) groups[tier] = []

  for (const r of restaurants) {
    if (r.tier && TIERS.includes(r.tier as Tier)) {
      groups[r.tier].push(r)
    } else {
      groups['untiered'].push(r)
    }
  }
  return groups
}

export function TierBoard({ restaurants }: TierBoardProps) {
  const supabase = createClient()
  const [groups, setGroups] = useState<TierGroup>(() => groupByTier(restaurants))
  const [activeId, setActiveId] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 1 } })
  )

  function findContainerOf(id: string): string | null {
    for (const [tier, items] of Object.entries(groups)) {
      if (items.find((r) => r.id === id)) return tier
    }
    return null
  }

  function getActiveRestaurant(): Restaurant | null {
    if (!activeId) return null
    for (const items of Object.values(groups)) {
      const r = items.find((r) => r.id === activeId)
      if (r) return r
    }
    return null
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return

    const activeContainer = findContainerOf(active.id as string)
    // over.id can be a tier name (droppable zone) OR a restaurant id (sortable item)
    const allTierKeys = [...TIERS, 'untiered']
    const overContainer = allTierKeys.includes(over.id as string)
      ? (over.id as string)
      : findContainerOf(over.id as string)

    if (!activeContainer || !overContainer || activeContainer === overContainer) return

    setGroups((prev) => {
      const activeItems = [...prev[activeContainer]]
      const overItems = [...(prev[overContainer] || [])]
      const activeIndex = activeItems.findIndex((r) => r.id === active.id)
      if (activeIndex === -1) return prev
      const [moved] = activeItems.splice(activeIndex, 1)
      overItems.push(moved)
      return { ...prev, [activeContainer]: activeItems, [overContainer]: overItems }
    })
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over) return

    const container = findContainerOf(active.id as string)
    if (!container) return

    const newTier = container === 'untiered' ? null : container as Tier
    const restaurant = getActiveRestaurant() ?? restaurants.find((r) => r.id === active.id)
    if (!restaurant) return
    if (restaurant.tier === newTier) return

    setSaving(active.id as string)
    await supabase
      .from('restaurants')
      .update({ tier: newTier, updated_at: new Date().toISOString() })
      .eq('id', active.id as string)
    setSaving(null)
  }

  const activeRestaurant = getActiveRestaurant()

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-3 select-none">
        {TIERS.map((tier) => (
          <TierRow
            key={tier}
            tier={tier}
            items={groups[tier] || []}
            savingId={saving}
          />
        ))}

        {(groups['untiered'] || []).length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-medium text-espresso-400 uppercase tracking-wider mb-2">Untiered</p>
            <TierRow tier="untiered" items={groups['untiered'] || []} savingId={saving} isUntiered />
          </div>
        )}
      </div>

      <DragOverlay>
        {activeRestaurant && (
          <RestaurantDragCard restaurant={activeRestaurant} isDragging />
        )}
      </DragOverlay>
    </DndContext>
  )
}

function TierRow({
  tier, items, savingId, isUntiered
}: {
  tier: string
  items: Restaurant[]
  savingId: string | null
  isUntiered?: boolean
}) {
  const bgClass = isUntiered
    ? 'bg-espresso-800/50 border-espresso-700'
    : TIER_BG_COLORS[tier as Tier]

  const { setNodeRef, isOver } = useDroppable({ id: tier })

  return (
    <div className={`flex gap-3 p-3 rounded-xl border transition-colors ${bgClass} ${isOver ? 'border-gold-500/50' : ''}`}>
      {!isUntiered && (
        <div className="flex flex-col items-center justify-center w-10 flex-shrink-0">
          <span className={`text-xl font-black ${TIER_COLORS[tier as Tier].split(' ').find((c) => c.startsWith('text-'))}`}>
            {tier}
          </span>
        </div>
      )}
      <div className="flex-1" ref={setNodeRef}>
        <SortableContext items={items.map((r) => r.id)} strategy={rectSortingStrategy}>
          {items.length === 0 ? (
            <div className={`border border-dashed rounded-lg h-12 flex items-center justify-center text-xs transition-colors ${isOver ? 'border-gold-500/50 text-gold-600 bg-gold-500/5' : 'border-espresso-600 text-espresso-500'}`}>
              Drop here
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {items.map((r) => (
                <RestaurantDragCard
                  key={r.id}
                  restaurant={r}
                  isSaving={savingId === r.id}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}

function RestaurantDragCard({
  restaurant, isDragging, isSaving
}: {
  restaurant: Restaurant
  isDragging?: boolean
  isSaving?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({
    id: restaurant.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, WebkitTouchCallout: 'none' } as React.CSSProperties}
      {...attributes}
      {...listeners}
      className={`select-none touch-none flex items-center gap-2 p-2.5 bg-espresso-800 border rounded-lg transition-all cursor-grab active:cursor-grabbing ${
        isDragging
          ? 'border-gold-500/50 shadow-lg shadow-black/30 rotate-1'
          : 'border-espresso-700 hover:border-espresso-600'
      } ${isSaving ? 'opacity-60' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-espresso-50 truncate">{restaurant.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {restaurant.cuisine && <span className="text-xs text-espresso-400 truncate">{restaurant.cuisine}</span>}
          {restaurant.suburb && <span className="text-xs text-espresso-500 truncate">{restaurant.suburb}</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {restaurant.visit_count > 1 && (
          <div className="flex items-center gap-1 text-xs text-espresso-400">
            <RotateCcw className="w-3 h-3" />
            {restaurant.visit_count}
          </div>
        )}
        <PipRating rating={restaurant.rating} size="sm" />
      </div>

      {isSaving && (
        <svg className="animate-spin w-3 h-3 text-gold-500 flex-shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
    </div>
  )
}

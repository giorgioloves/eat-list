'use client'

import { useState, useEffect } from 'react'
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
import { updateTier } from '@/app/(dashboard)/tiers/actions'
import { TIERS, TIER_ACCENT, TIER_BLOCK_BG, TIER_CHIP_BG, TIER_CHIP_TEXT } from '@/types'
import type { Restaurant, Tier } from '@/types'

const T = {
  parchment:  '#f5f0e8',
  linen:      '#ede5d8',
  espresso:   '#3b2f27',
  stone:      '#c4b8a8',
  mist:       '#a08070',
  ghost:      '#b8a898',
  border:     '#c4b8a8',
  chipBg:     '#e8ddd3',
  chipText:   '#6b5245',
}

interface TierBoardProps {
  restaurants: Restaurant[]
  editing?: boolean
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

export function TierBoard({ restaurants, editing = false }: TierBoardProps) {
  const [groups, setGroups] = useState<TierGroup>(() => groupByTier(restaurants))

  useEffect(() => {
    if (!editing) return
    const el = document.body
    const prev = el.style.userSelect
    el.style.userSelect = 'none';
    (el.style as any).webkitUserSelect = 'none'
    return () => {
      el.style.userSelect = prev;
      (el.style as any).webkitUserSelect = prev
    }
  }, [editing])

  const [activeId, setActiveId]   = useState<string | null>(null)
  const [saving, setSaving]       = useState<string | null>(null)

  const activeSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 1 } })
  )
  const noSensors = useSensors()
  const sensors = editing ? activeSensors : noSensors

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
    const allTierKeys = [...TIERS, 'untiered']
    const overContainer = allTierKeys.includes(over.id as string)
      ? (over.id as string)
      : findContainerOf(over.id as string)
    if (!activeContainer || !overContainer || activeContainer === overContainer) return
    setGroups((prev) => {
      const activeItems = [...prev[activeContainer]]
      const overItems   = [...(prev[overContainer] || [])]
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
    try {
      await updateTier(active.id as string, newTier)
    } catch (e) {
      console.error('Failed to save tier:', e)
    } finally {
      setSaving(null)
    }
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, userSelect: 'none' }}>
        {TIERS.map((tier) => (
          <TierRow
            key={tier}
            tier={tier}
            items={groups[tier] || []}
            savingId={saving}
            editing={editing}
          />
        ))}

        {(groups['untiered'] || []).length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{
              fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
              fontSize: 10,
              color:         T.mist,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom:  8,
            }}>untiered</p>
            <TierRow tier="untiered" items={groups['untiered'] || []} savingId={saving} isUntiered editing={editing} />
          </div>
        )}
      </div>

      <DragOverlay>
        {activeRestaurant && <DragCard restaurant={activeRestaurant} />}
      </DragOverlay>
    </DndContext>
  )
}

function TierRow({
  tier, items, savingId, isUntiered, editing,
}: {
  tier: string
  items: Restaurant[]
  savingId: string | null
  isUntiered?: boolean
  editing?: boolean
}) {
  const t = tier as Tier
  const accent   = isUntiered ? T.stone : TIER_ACCENT[t]
  const blockBg  = isUntiered ? T.parchment : TIER_BLOCK_BG[t]
  const chipBg   = isUntiered ? T.chipBg   : TIER_CHIP_BG[t]
  const chipText = isUntiered ? T.chipText  : TIER_CHIP_TEXT[t]
  const { setNodeRef, isOver } = useDroppable({ id: tier })

  return (
    <div style={{
      display:         'flex',
      gap:             10,
      backgroundColor: blockBg,
      borderRadius:    isUntiered ? 10 : '0 10px 10px 0',
      borderLeft:      isUntiered ? `0.5px solid ${T.border}` : `2.5px solid ${accent}`,
      borderTop:       `0.5px solid ${accent}22`,
      borderRight:     `0.5px solid ${accent}22`,
      borderBottom:    `0.5px solid ${accent}22`,
      padding:         '10px 12px',
      transition:      'border-color 0.12s',
      outline:         isOver ? `1px solid ${accent}` : 'none',
    }}>
      {!isUntiered && (
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          width:           30,
          flexShrink:      0,
        }}>
          <span style={{
            fontFamily: 'var(--font-crimson), Georgia, serif',
            fontSize: 26,
            fontStyle:  'italic',
            fontWeight: 400,
            color:      accent,
            lineHeight: 1,
          }}>{tier}</span>
        </div>
      )}

      <div style={{ flex: 1 }} ref={setNodeRef}>
        <SortableContext items={items.map((r) => r.id)} strategy={rectSortingStrategy}>
          {items.length === 0 ? (
            <div style={{
              height:          40,
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              border:          `0.5px dashed ${isOver ? accent : accent + '55'}`,
              borderRadius:    6,
              fontFamily:      'var(--font-dm-mono), ui-monospace, monospace',
              fontSize: 11,
              color:           isOver ? accent : accent + '88',
              letterSpacing:   '0.06em',
              transition:      'all 0.12s',
            }}>
              drop here
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {items.map((r) => (
                <SortableCard
                  key={r.id}
                  restaurant={r}
                  isSaving={savingId === r.id}
                  editing={editing}
                  chipBg={chipBg}
                  chipText={chipText}
                  accent={accent}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}

// Used in tier rows — has dnd-kit sortable hooks
function SortableCard({ restaurant, isSaving, editing, chipBg, chipText, accent }: {
  restaurant: Restaurant
  isSaving?: boolean
  editing?: boolean
  chipBg?: string
  chipText?: string
  accent?: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: restaurant.id,
  })

  const bg   = chipBg   ?? T.chipBg
  const text = chipText ?? T.chipText
  const border = accent ? accent + '55' : T.border

  const displayName = restaurant.name.replace(/\s*\([^)]+\)\s*$/, '').trim()

  return (
    <div
      ref={setNodeRef}
      style={{
        transform:       CSS.Transform.toString(transform),
        transition,
        opacity:         isDragging ? 0.35 : isSaving ? 0.6 : 1,
        WebkitTouchCallout: 'none' as React.CSSProperties['WebkitTouchCallout'],
        display:         'inline-flex',
        alignItems:      'center',
        gap:             4,
        padding:         '5px 12px',
        backgroundColor: bg,
        border:          `0.5px solid ${border}`,
        borderRadius:    6,
        cursor:          editing ? 'grab' : 'default',
        userSelect:      'none',
        touchAction:     editing ? 'none' : 'auto',
      }}
      {...(editing ? { ...attributes, ...listeners } : {})}
    >
      <span style={{
        fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
        fontSize: 10,
        color:         text,
        letterSpacing: '0.04em',
        pointerEvents: 'none',
        whiteSpace:    'nowrap',
      }}>{displayName}</span>

      {isSaving && (
        <svg style={{ width: 10, height: 10, color: accent ?? '#c4927a', flexShrink: 0, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
    </div>
  )
}

// Used in DragOverlay — no dnd-kit hooks, pure display
function DragCard({ restaurant }: { restaurant: Restaurant }) {
  const displayName = restaurant.name.replace(/\s*\([^)]+\)\s*$/, '').trim()
  const tier    = restaurant.tier as Tier | null
  const chipBg  = tier ? TIER_CHIP_BG[tier]   : T.chipBg
  const chipText = tier ? TIER_CHIP_TEXT[tier] : T.chipText
  const accent  = tier ? TIER_ACCENT[tier]     : T.mist

  return (
    <div style={{
      display:         'inline-flex',
      alignItems:      'center',
      gap:             4,
      padding:         '4px 10px',
      backgroundColor: chipBg,
      border:          `0.5px solid ${accent}`,
      borderRadius:    6,
      cursor:          'grabbing',
      userSelect:      'none',
      transform:       'rotate(1deg)',
      boxShadow:       '0 2px 8px rgba(59,47,39,0.12)',
    }}>
      <span style={{
        fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
        fontSize: 10,
        color:         chipText,
        letterSpacing: '0.04em',
        whiteSpace:    'nowrap',
      }}>{displayName}</span>
    </div>
  )
}

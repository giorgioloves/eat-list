'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ExternalLink, MapPin, RotateCcw, Shuffle } from 'lucide-react'
import { TierBadge } from '@/components/ui/badge'
import { ScoreRating } from '@/components/ui/pip-rating'
import { GoldSparkles } from './gold-sparkles'
import { CUISINE_EMOJI } from '@/types'
import type { Restaurant, Tier } from '@/types'

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

interface WinnerRevealProps {
  restaurant: Restaurant
  onPickAgain: () => void
}

export function WinnerReveal({ restaurant: r, onPickAgain }: WinnerRevealProps) {
  const [sparklesActive, setSparklesActive] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setSparklesActive(true), 100)
    const t2 = setTimeout(() => setSparklesActive(false), 2500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const emoji       = CUISINE_EMOJI[r.cuisine ?? ''] ?? '🍽️'
  const displayName = r.name.replace(/\s*\([^)]+\)\s*$/, '').trim()

  return (
    <div style={{ position: 'relative' }}>
      <GoldSparkles active={sparklesActive} />

      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        style={{
          backgroundColor: T.linen,
          border:          `0.5px solid ${T.terracotta}`,
          borderRadius:    10,
          padding:         24,
        }}
      >
        {/* Tonight's Pick label */}
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{
            fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase' as const,
            textAlign:     'center',
            color:         T.terracotta,
            marginBottom:  16,
          }}
        >
          tonight&apos;s pick
        </motion.p>

        {/* Emoji */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 350, damping: 18 }}
          style={{ textAlign: 'center', fontSize: 56, lineHeight: 1, marginBottom: 14, userSelect: 'none' }}
        >
          {emoji}
        </motion.div>

        {/* Name */}
        <motion.h2
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          style={{
            fontFamily: 'var(--font-crimson), Georgia, serif',
            fontSize: 30,
            fontWeight: 400,
            color:      T.espresso,
            textAlign:  'center',
            marginBottom: 4,
          }}
        >
          {displayName}
        </motion.h2>

        {/* Cuisine */}
        {r.cuisine && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.21 }}
            style={{
              fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
              fontSize: 12,
              color:         T.mist,
              letterSpacing: '0.06em',
              textAlign:     'center',
              marginBottom:  14,
            }}
          >
            {r.cuisine}
          </motion.p>
        )}

        {/* Tier + Rating */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' as const }}
        >
          {r.tier && <TierBadge tier={r.tier as Tier} />}
          <ScoreRating rating={r.rating} />
        </motion.div>

        {/* Location + visits */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' as const }}
        >
          {(r.address || r.suburb) && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 11, color: T.mist }}>
              <MapPin style={{ width: 10, height: 10 }} />
              {[r.address, r.suburb].filter(Boolean).join(', ')}
            </span>
          )}
          {r.visit_count > 1 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-dm-mono), ui-monospace, monospace', fontSize: 11, color: T.ghost }}>
              <RotateCcw style={{ width: 10, height: 10 }} />
              {r.visit_count} visits
            </span>
          )}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
          style={{ display: 'flex', gap: 8 }}
        >
          <Link
            href={`/restaurants/${r.id}`}
            style={{
              flex:            1,
              textAlign:       'center',
              fontFamily:      'var(--font-crimson), Georgia, serif',
              fontSize: 16,
              color:           T.espresso,
              padding:         '9px 0',
              backgroundColor: T.parchment,
              border:          `0.5px solid ${T.border}`,
              borderRadius:    8,
              textDecoration:  'none',
            }}
          >
            view details
          </Link>
          {(r.suburb || r.city) && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                [r.name, r.address, r.suburb].filter(Boolean).join(', ')
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display:         'flex',
                alignItems:      'center',
                gap:             5,
                fontFamily:      'var(--font-dm-mono), ui-monospace, monospace',
                fontSize: 11,
                color:           T.mist,
                padding:         '9px 12px',
                backgroundColor: T.parchment,
                border:          `0.5px solid ${T.border}`,
                borderRadius:    8,
                textDecoration:  'none',
              }}
            >
              <ExternalLink style={{ width: 11, height: 11 }} />
              maps
            </a>
          )}
          <button
            onClick={onPickAgain}
            style={{
              display:         'flex',
              alignItems:      'center',
              gap:             5,
              fontFamily:      'var(--font-dm-mono), ui-monospace, monospace',
              fontSize: 11,
              color:           T.mist,
              padding:         '9px 12px',
              backgroundColor: T.parchment,
              border:          `0.5px solid ${T.border}`,
              borderRadius:    8,
              cursor:          'pointer',
            }}
          >
            <Shuffle style={{ width: 11, height: 11 }} />
            again
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}

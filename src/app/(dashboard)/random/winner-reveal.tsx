'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ExternalLink, MapPin, RotateCcw, Shuffle } from 'lucide-react'
import { TierBadge } from '@/components/ui/badge'
import { PipRating } from '@/components/ui/pip-rating'
import { GoldSparkles } from './gold-sparkles'
import { CUISINE_EMOJI } from '@/types'
import type { Restaurant, Tier } from '@/types'

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

  const emoji = CUISINE_EMOJI[r.cuisine ?? ''] ?? '🍽️'

  return (
    <div className="relative">
      <GoldSparkles active={sparklesActive} />

      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        style={{
          background: 'linear-gradient(135deg, #2F2825 0%, #1E1A18 100%)',
          border: '1px solid rgba(217,182,93,0.4)',
          boxShadow: `
            0 0 0 1px rgba(217,182,93,0.2),
            0 0 20px rgba(217,182,93,0.15),
            0 0 60px rgba(217,182,93,0.07),
            0 20px 40px rgba(0,0,0,0.4)
          `,
          borderRadius: '1rem',
          padding: '1.5rem',
        }}
      >
        {/* Tonight's Pick label */}
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
          style={{ color: '#D9B65D' }}
        >
          Tonight&apos;s Pick
        </motion.p>

        {/* Emoji */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 350, damping: 18 }}
          className="text-center text-6xl leading-none mb-4 select-none"
        >
          {emoji}
        </motion.div>

        {/* Name */}
        <motion.h2
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="text-2xl font-black text-center text-espresso-50 mb-1"
        >
          {r.name}
        </motion.h2>

        {/* Cuisine */}
        {r.cuisine && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.21 }}
            className="text-center text-espresso-300 text-sm mb-4"
          >
            {r.cuisine}
          </motion.p>
        )}

        {/* Tier + Rating */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className="flex items-center justify-center gap-3 mb-3 flex-wrap"
        >
          {r.tier && <TierBadge tier={r.tier as Tier} />}
          <PipRating rating={r.rating} />
        </motion.div>

        {/* Location + visits */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-3 mb-5 flex-wrap"
        >
          {(r.address || r.suburb) && (
            <span className="flex items-center gap-1 text-xs text-espresso-400">
              <MapPin className="w-3 h-3" />
              {[r.address, r.suburb].filter(Boolean).join(', ')}
            </span>
          )}
          {r.visit_count > 1 && (
            <span className="flex items-center gap-1 text-xs text-espresso-500">
              <RotateCcw className="w-3 h-3" />
              {r.visit_count} visits
            </span>
          )}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
          className="flex gap-2"
        >
          <Link
            href={`/restaurants/${r.id}`}
            className="flex-1 text-center text-sm py-2 bg-espresso-700 hover:bg-espresso-600 text-espresso-100 rounded-xl transition-colors font-medium"
          >
            View details
          </Link>
          {(r.suburb || r.city) && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                [r.name, r.address, r.suburb].filter(Boolean).join(', ')
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm py-2 px-3 rounded-xl transition-colors"
              style={{ background: 'rgba(217,182,93,0.1)', color: '#D9B65D' }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Maps
            </a>
          )}
          <button
            onClick={onPickAgain}
            className="flex items-center gap-1.5 text-sm py-2 px-3 bg-espresso-700 hover:bg-espresso-600 text-espresso-300 rounded-xl transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Again
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}

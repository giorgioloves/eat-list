'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CUISINE_EMOJI } from '@/types'
import type { Restaurant } from '@/types'

const T = {
  parchment:  '#f5f0e8',
  linen:      '#ede5d8',
  espresso:   '#3b2f27',
  terracotta: '#c4927a',
  stone:      '#c4b8a8',
  mist:       '#a08070',
  border:     '#c4b8a8',
}

// Each value = ms to wait before next swap. Starts fast, slows to a stop.
const INTERVALS = [80, 100, 130, 180, 260, 390, 570, 830]

interface RestaurantRouletteProps {
  pool: Restaurant[]
  winner: Restaurant
  onComplete: () => void
}

export function RestaurantRoulette({ pool, winner, onComplete }: RestaurantRouletteProps) {
  const [current, setCurrent] = useState<Restaurant>(() => pool[Math.floor(Math.random() * pool.length)])
  const [step, setStep]       = useState(0)
  const onCompleteRef         = useRef(onComplete)
  onCompleteRef.current       = onComplete

  useEffect(() => {
    let cancelled = false

    function tick(currentStep: number) {
      if (cancelled) return
      if (currentStep < INTERVALS.length) {
        setTimeout(() => {
          if (cancelled) return
          const rand = pool[Math.floor(Math.random() * pool.length)]
          setCurrent(rand)
          setStep(currentStep + 1)
          tick(currentStep + 1)
        }, INTERVALS[currentStep])
      } else {
        setTimeout(() => {
          if (cancelled) return
          setCurrent(winner)
          setStep(INTERVALS.length + 1)
          setTimeout(() => onCompleteRef.current(), 120)
        }, INTERVALS[INTERVALS.length - 1])
      }
    }

    tick(0)
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const emoji     = CUISINE_EMOJI[current.cuisine ?? ''] ?? '🍽️'
  const isSlowing = step >= INTERVALS.length - 2
  const displayName = current.name.replace(/\s*\([^)]+\)\s*$/, '').trim()

  return (
    <div style={{
      borderRadius:    10,
      overflow:        'hidden',
      backgroundColor: T.linen,
      border:          `0.5px solid ${isSlowing ? T.terracotta : T.border}`,
      transition:      'border-color 0.4s',
    }}>
      <div style={{
        padding:        '32px 24px 24px',
        textAlign:      'center',
        minHeight:      140,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
      }}>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={step}
            initial={{ y: -12, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.07, ease: 'easeOut' }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
          >
            <span style={{ fontSize: 48, lineHeight: 1, userSelect: 'none' }}>{emoji}</span>
            <p style={{
              fontFamily: 'var(--font-crimson), Georgia, serif',
              fontSize: 26,
              fontWeight: 400,
              color:      T.espresso,
              marginTop:  4,
            }}>{displayName}</p>
            {current.cuisine && (
              <p style={{
                fontFamily:    'var(--font-dm-mono), ui-monospace, monospace',
                fontSize: 12,
                color:         T.mist,
                letterSpacing: '0.06em',
              }}>{current.cuisine}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 5, paddingBottom: 14 }}>
        {INTERVALS.map((_, i) => (
          <motion.div
            key={i}
            style={{ borderRadius: '50%', backgroundColor: T.terracotta }}
            animate={{
              width:   i < step ? 6 : 4,
              height:  i < step ? 6 : 4,
              opacity: i < step ? 1 : 0.25,
            }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>
    </div>
  )
}

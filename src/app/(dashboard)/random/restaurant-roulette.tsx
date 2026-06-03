'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CUISINE_EMOJI } from '@/types'
import type { Restaurant } from '@/types'

// Each value = ms to wait before next swap. Starts fast, slows to a stop.
const INTERVALS = [80, 100, 130, 180, 260, 390, 570, 830]

interface RestaurantRouletteProps {
  pool: Restaurant[]
  winner: Restaurant
  onComplete: () => void
}

export function RestaurantRoulette({ pool, winner, onComplete }: RestaurantRouletteProps) {
  const [current, setCurrent] = useState<Restaurant>(() => pool[Math.floor(Math.random() * pool.length)])
  const [step, setStep] = useState(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

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

  const emoji = CUISINE_EMOJI[current.cuisine ?? ''] ?? '🍽️'
  const isSlowing = step >= INTERVALS.length - 2

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #2B2623 0%, #1E1A18 100%)',
        border: '1px solid rgba(217,182,93,0.15)',
        boxShadow: isSlowing
          ? '0 0 0 1px rgba(217,182,93,0.25), 0 0 30px rgba(217,182,93,0.08)'
          : 'none',
        transition: 'box-shadow 0.4s ease',
      }}
    >
      {/* Subtle animated border glow as it slows */}
      {isSlowing && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            boxShadow: 'inset 0 0 20px rgba(217,182,93,0.06)',
          }}
        />
      )}

      <div className="p-8 text-center min-h-[160px] flex flex-col items-center justify-center">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={step}
            initial={{ y: -16, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.07, ease: 'easeOut' }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-5xl leading-none select-none">{emoji}</span>
            <p className="text-xl font-bold text-espresso-50 mt-1">{current.name}</p>
            {current.cuisine && (
              <p className="text-sm text-espresso-400">{current.cuisine}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 pb-4">
        {INTERVALS.map((_, i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ backgroundColor: '#D9B65D' }}
            animate={{
              width: i < step ? 6 : 4,
              height: i < step ? 6 : 4,
              opacity: i < step ? 1 : 0.2,
            }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>
    </div>
  )
}

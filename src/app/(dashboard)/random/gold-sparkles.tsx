'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface SparkleConfig {
  id: number
  angle: number
  distance: number
  size: number
  delay: number
  shape: 'circle' | 'diamond'
}

function generateSparkles(): SparkleConfig[] {
  const count = 80
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (i / count) * 360 + (i % 2 === 0 ? 11 : -11),
    distance: 70 + (i % 5) * 42,
    size: 2 + (i % 5),
    delay: (i % 8) * 0.06,
    shape: i % 3 === 0 ? 'diamond' : 'circle',
  }))
}

export function GoldSparkles({ active }: { active: boolean }) {
  const sparkles = useMemo(generateSparkles, [])

  if (!active) return null

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden rounded-2xl">
      {sparkles.map((s) => {
        const dx = Math.cos((s.angle * Math.PI) / 180) * s.distance
        const dy = Math.sin((s.angle * Math.PI) / 180) * s.distance

        return (
          <motion.div
            key={s.id}
            className="absolute"
            style={{
              width: s.size,
              height: s.size,
              backgroundColor: '#D9B65D',
              boxShadow: '0 0 6px 1px rgba(217,182,93,0.7)',
              borderRadius: s.shape === 'circle' ? '50%' : '2px',
              transform: s.shape === 'diamond' ? 'rotate(45deg)' : undefined,
            }}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: [0, dx * 0.6, dx],
              y: [0, dy * 0.6, dy],
              scale: [0, 1.4, 0.6],
            }}
            transition={{
              duration: 2.0,
              delay: s.delay,
              ease: [0.15, 0.8, 0.3, 1],
            }}
          />
        )
      })}
    </div>
  )
}

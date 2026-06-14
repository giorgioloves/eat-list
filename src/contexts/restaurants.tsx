'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import type { Restaurant } from '@/types'

interface RestaurantContextType {
  restaurants: Restaurant[]
  loading: boolean
  refresh: () => Promise<void>
}

const RestaurantContext = createContext<RestaurantContextType>({
  restaurants: [],
  loading: false,
  refresh: async () => {},
})

export function RestaurantProvider({
  children,
  initialRestaurants = [],
}: {
  children: React.ReactNode
  initialRestaurants?: Restaurant[]
}) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/restaurants')
      const data = await res.json()
      setRestaurants(data)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <RestaurantContext.Provider value={{ restaurants, loading, refresh }}>
      {children}
    </RestaurantContext.Provider>
  )
}

export function useRestaurants() {
  return useContext(RestaurantContext)
}

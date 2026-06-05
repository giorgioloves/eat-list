'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Restaurant } from '@/types'

interface RestaurantContextType {
  restaurants: Restaurant[]
  loading: boolean
  refresh: () => Promise<void>
}

const RestaurantContext = createContext<RestaurantContextType>({
  restaurants: [],
  loading: true,
  refresh: async () => {},
})

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/restaurants')
      const data = await res.json()
      setRestaurants(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return (
    <RestaurantContext.Provider value={{ restaurants, loading, refresh }}>
      {children}
    </RestaurantContext.Provider>
  )
}

export function useRestaurants() {
  return useContext(RestaurantContext)
}

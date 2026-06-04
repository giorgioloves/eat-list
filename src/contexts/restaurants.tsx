'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Restaurant } from '@/types'

interface RestaurantContextType {
  restaurants: Restaurant[]
  loading: boolean
  listId: string | null
  listName: string | null
  refresh: () => Promise<void>
}

const RestaurantContext = createContext<RestaurantContextType>({
  restaurants: [],
  loading: true,
  listId: null,
  listName: null,
  refresh: async () => {},
})

export function RestaurantProvider({
  listId,
  listName,
  children,
}: {
  listId: string | null
  listName: string | null
  children: React.ReactNode
}) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!listId) { setLoading(false); return }
    const supabase = createClient()
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .eq('list_id', listId)
      .order('created_at', { ascending: false })
    setRestaurants((data ?? []) as Restaurant[])
    setLoading(false)
  }, [listId])

  useEffect(() => { refresh() }, [refresh])

  return (
    <RestaurantContext.Provider value={{ restaurants, loading, listId, listName, refresh }}>
      {children}
    </RestaurantContext.Provider>
  )
}

export function useRestaurants() {
  return useContext(RestaurantContext)
}

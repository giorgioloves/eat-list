'use client'

import { RandomPicker } from './random-client'
import { useRestaurants } from '@/contexts/restaurants'

export default function RandomPage() {
  const { restaurants } = useRestaurants()

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-espresso-50">What Should We Eat Tonight?</h1>
        <p className="text-sm text-espresso-300 mt-0.5">Let fate decide your next meal</p>
      </div>
      <RandomPicker restaurants={restaurants} />
    </div>
  )
}

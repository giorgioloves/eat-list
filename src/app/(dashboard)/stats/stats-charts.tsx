'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend
} from 'recharts'

const COLORS = ['#D9B65D', '#E8A87C', '#7A8A6B', '#7D3A4A', '#5FA8FF', '#B983FF', '#F97316', '#84CC16', '#EC4899', '#14B8A6']

interface StatsChartsProps {
  cuisineData: { name: string; value: number }[]
  ratingBuckets: { label: string; count: number }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-espresso-700 border border-espresso-600 rounded-lg px-3 py-2 text-xs">
        <p className="text-espresso-100 font-medium">{label || payload[0].name}</p>
        <p className="text-gold-400">{payload[0].value} restaurants</p>
      </div>
    )
  }
  return null
}

export function StatsCharts({ cuisineData, ratingBuckets }: StatsChartsProps) {
  if (cuisineData.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      {/* Rating distribution */}
      <div className="bg-espresso-800 border border-espresso-700 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-espresso-200 mb-4">Rating Distribution</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={ratingBuckets} barSize={28}>
            <XAxis
              dataKey="label"
              tick={{ fill: '#A09590', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {ratingBuckets.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cuisine breakdown */}
      <div className="bg-espresso-800 border border-espresso-700 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-espresso-200 mb-4">Top Cuisines</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={cuisineData} layout="vertical" barSize={12}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#A09590', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {cuisineData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

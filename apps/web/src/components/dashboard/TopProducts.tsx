'use client'

import { useStore } from '@/lib/store'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { TrendingUp, Award } from 'lucide-react'

export function TopProducts() {
  const metrics = useStore((s) => s.metrics)
  const products = metrics?.top_products || []

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5 text-violet-500" />
          <h3 className="text-lg font-semibold text-slate-800">Top Products</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <TrendingUp className="h-6 w-6 text-slate-300" />
          </div>
          <p className="text-sm">No product data yet...</p>
        </div>
      </div>
    )
  }

  const maxRevenue = Math.max(...products.map((p) => p.revenue))

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Award className="h-5 w-5 text-violet-500" />
        <h3 className="text-lg font-semibold text-slate-800">Top Products</h3>
      </div>

      <div className="space-y-4">
        {products.map((product, i) => (
          <div key={product.name} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className={`
                  w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold
                  ${i === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' : 
                    i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                    i === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                    'bg-slate-100 text-slate-500'}
                `}>
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-slate-700 truncate max-w-[180px]">
                  {product.name}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-400">
                  {formatNumber(product.units)} sold
                </span>
                <span className="font-semibold text-emerald-600">
                  {formatCurrency(product.revenue)}
                </span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-violet-500 to-cyan-500"
                style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

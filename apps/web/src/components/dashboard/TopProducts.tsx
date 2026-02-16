'use client'

import { useStore } from '@/lib/store'
import { formatCurrency, formatNumber } from '@/lib/utils'

export function TopProducts() {
  const metrics = useStore((s) => s.metrics)
  const products = metrics?.top_products || []

  if (products.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Top Products</h3>
        <div className="text-center text-muted-foreground py-8">
          No product data yet...
        </div>
      </div>
    )
  }

  const maxRevenue = Math.max(...products.map((p) => p.revenue))

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Top Products</h3>

      <div className="space-y-4">
        {products.map((product, i) => (
          <div key={product.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground w-6">
                  #{i + 1}
                </span>
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {product.name}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  {formatNumber(product.units)} sold
                </span>
                <span className="font-medium text-green-500">
                  {formatCurrency(product.revenue)}
                </span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

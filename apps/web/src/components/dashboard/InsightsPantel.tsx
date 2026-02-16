'use client'

import { useStore } from '@/lib/store'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'

export function InsightsPanel() {
  const metrics = useStore((s) => s.metrics)
  const events = useStore((s) => s.events)

  if (!metrics) return null

  const topRegions = events
    .filter(e => e.type === 'order' && e.data.region_name)
    .reduce((acc, e) => {
      const region = e.data.region_name
      acc[region] = (acc[region] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  const topRegion = Object.entries(topRegions).sort(([,a], [,b]) => b - a)[0]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-normal text-slate-900" style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}>Business Insights</h2>
        <p className="text-slate-500">Key takeaways from your real-time data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="relative overflow-hidden rounded-xl p-6 text-white"
          style={{
            background: `linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.98) 100%), url('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80')`,
            backgroundSize: 'cover', backgroundPosition: 'center'
          }}
        >
          <p className="text-sm font-medium text-white/80 uppercase tracking-wide mb-3">Revenue Performance</p>
          <p className="text-3xl font-bold mb-2">{formatCurrency(metrics.revenue_total)}</p>
          <p className="text-sm text-white/80">
            Generating {formatCurrency(metrics.revenue_per_minute)} per minute with an average order value of {formatCurrency(metrics.average_order_value)}.
          </p>
        </div>

        <div 
          className="relative overflow-hidden rounded-xl p-6 text-white"
          style={{
            background: `linear-gradient(135deg, rgba(124, 58, 237, 0.95) 0%, rgba(109, 40, 217, 0.98) 100%), url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80')`,
            backgroundSize: 'cover', backgroundPosition: 'center'
          }}
        >
          <p className="text-sm font-medium text-white/80 uppercase tracking-wide mb-3">Conversion Analysis</p>
          <p className="text-3xl font-bold mb-2">{formatPercent(metrics.conversion_rate / 100)}</p>
          <p className="text-sm text-white/80">
            {formatNumber(metrics.page_views)} visitors resulted in {formatNumber(metrics.orders_total)} orders. Cart abandonment at {formatPercent(metrics.cart_abandonment_rate)}.
          </p>
        </div>

        <div 
          className="relative overflow-hidden rounded-xl p-6 text-white"
          style={{
            background: `linear-gradient(135deg, rgba(37, 99, 235, 0.95) 0%, rgba(29, 78, 216, 0.98) 100%), url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&q=80')`,
            backgroundSize: 'cover', backgroundPosition: 'center'
          }}
        >
          <p className="text-sm font-medium text-white/80 uppercase tracking-wide mb-3">Market Distribution</p>
          <p className="text-3xl font-bold mb-2">{topRegion ? topRegion[0] : 'Global'}</p>
          <p className="text-sm text-white/80">
            {topRegion ? `Leading market with ${topRegion[1]} orders.` : ''} {formatNumber(metrics.unique_visitors)} unique visitors across all regions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="card-base p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Processing</p>
          <p className="text-xl font-bold text-slate-900">{metrics.events_per_second.toFixed(1)}</p>
          <p className="text-xs text-slate-500">events/second</p>
        </div>
        <div className="card-base p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Error Rate</p>
          <p className={`text-xl font-bold ${metrics.error_rate > 5 ? 'text-red-600' : 'text-slate-900'}`}>{formatPercent(metrics.error_rate)}</p>
          <p className="text-xs text-slate-500">of all events</p>
        </div>
        <div className="card-base p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Pending</p>
          <p className="text-xl font-bold text-amber-600">{metrics.orders_pending}</p>
          <p className="text-xs text-slate-500">orders awaiting</p>
        </div>
        <div className="card-base p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Refunds</p>
          <p className={`text-xl font-bold ${metrics.orders_refunded > 5 ? 'text-red-600' : 'text-slate-900'}`}>{metrics.orders_refunded}</p>
          <p className="text-xs text-slate-500">processed today</p>
        </div>
      </div>
    </div>
  )
}

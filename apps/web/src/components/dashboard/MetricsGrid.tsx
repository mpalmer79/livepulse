'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'
import { DrillDownModal } from './DrillDownModal'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  trend?: { value: number; positive: boolean }
  bgClass: string
  onClick: () => void
}

function MetricCard({ title, value, subtitle, trend, bgClass, onClick }: MetricCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${bgClass}`}
    >
      <div className="relative z-10">
        <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
        <p className="text-3xl font-bold text-white mb-1 animate-count-up">{value}</p>
        {subtitle && <p className="text-sm text-white/70">{subtitle}</p>}
        {trend && (
          <div className={`mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend.positive ? 'bg-white/20 text-white' : 'bg-red-900/30 text-red-200'
          }`}>
            <span>{trend.positive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}% vs last hour</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function MetricsGrid() {
  const metrics = useStore((s) => s.metrics)
  const events = useStore((s) => s.events)
  const metricsHistory = useStore((s) => s.metricsHistory)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  if (!metrics) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-36 rounded-xl bg-slate-200 animate-pulse" />
        ))}
      </div>
    )
  }

  const recentOrders = events.filter(e => e.type === 'order').slice(0, 20)
  const recentCarts = events.filter(e => e.type === 'cart_add').slice(0, 20)
  const recentPageViews = events.filter(e => e.type === 'page_view').slice(0, 20)
  const recentRefunds = events.filter(e => e.type === 'refund').slice(0, 10)

  const ordersByRegion = recentOrders.reduce((acc, o) => {
    const region = o.data.region_name || 'Unknown'
    acc[region] = (acc[region] || 0) + (o.data.total || 0)
    return acc
  }, {} as Record<string, number>)

  const ordersByPayment = recentOrders.reduce((acc, o) => {
    const method = o.data.payment_method || 'Unknown'
    acc[method] = (acc[method] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pageViewsBySource = recentPageViews.reduce((acc, p) => {
    const source = p.data.source || 'Unknown'
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const cartsByProduct = recentCarts.reduce((acc, c) => {
    const product = c.data.product_name || 'Unknown'
    acc[product] = (acc[product] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const refundsByReason = recentRefunds.reduce((acc, r) => {
    const reason = r.data.reason || 'Unknown'
    acc[reason] = (acc[reason] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const calculateTrend = (current: number, key: keyof typeof metrics) => {
    if (metricsHistory.length < 10) return null
    const oldValue = metricsHistory[0]?.[key] as number || 0
    if (oldValue === 0) return null
    const change = ((current - oldValue) / oldValue) * 100
    return { value: Math.round(change * 10) / 10, positive: change >= 0 }
  }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.revenue_total)}
          subtitle={`${formatCurrency(metrics.revenue_per_minute)}/min`}
          trend={calculateTrend(metrics.revenue_total, 'revenue_total')}
          bgClass="metric-card-revenue"
          onClick={() => setActiveModal('revenue')}
        />
        <MetricCard
          title="Orders"
          value={formatNumber(metrics.orders_total)}
          subtitle={`${metrics.orders_per_minute.toFixed(1)}/min`}
          trend={calculateTrend(metrics.orders_total, 'orders_total')}
          bgClass="metric-card-orders"
          onClick={() => setActiveModal('orders')}
        />
        <MetricCard
          title="Avg Order Value"
          value={formatCurrency(metrics.average_order_value)}
          subtitle="Per transaction"
          bgClass="metric-card-aov"
          onClick={() => setActiveModal('aov')}
        />
        <MetricCard
          title="Page Views"
          value={formatNumber(metrics.page_views)}
          subtitle={`${formatNumber(metrics.unique_visitors)} unique`}
          bgClass="metric-card-traffic"
          onClick={() => setActiveModal('traffic')}
        />
        <MetricCard
          title="Cart Additions"
          value={formatNumber(metrics.cart_additions)}
          subtitle="Items added"
          bgClass="metric-card-cart"
          onClick={() => setActiveModal('cart')}
        />
        <MetricCard
          title="Conversion Rate"
          value={formatPercent(metrics.conversion_rate / 100)}
          subtitle="Visitors → Customers"
          bgClass="metric-card-conversion"
          onClick={() => setActiveModal('conversion')}
        />
        <MetricCard
          title="Cart Abandonment"
          value={formatPercent(metrics.cart_abandonment_rate)}
          subtitle="Carts not completed"
          bgClass="metric-card-abandonment"
          onClick={() => setActiveModal('abandonment')}
        />
        <MetricCard
          title="Events/sec"
          value={metrics.events_per_second.toFixed(1)}
          subtitle={`${formatPercent(metrics.error_rate)} errors`}
          bgClass="metric-card-events"
          onClick={() => setActiveModal('events')}
        />
      </div>

      {/* Revenue Modal */}
      <DrillDownModal isOpen={activeModal === 'revenue'} onClose={() => setActiveModal(null)} title="Revenue Analysis" subtitle="Breakdown of revenue sources">
        <div className="space-y-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-sm text-emerald-600 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-emerald-700">{formatCurrency(metrics.revenue_total)}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-600 font-medium">Revenue/Min</p>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(metrics.revenue_per_minute)}</p>
            </div>
            <div className="bg-violet-50 rounded-xl p-4 text-center">
              <p className="text-sm text-violet-600 font-medium">Avg Order Value</p>
              <p className="text-2xl font-bold text-violet-700">{formatCurrency(metrics.average_order_value)}</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-4">Revenue by Region</h4>
            <div className="space-y-3">
              {Object.entries(ordersByRegion).sort(([,a], [,b]) => b - a).slice(0, 5).map(([region, revenue]) => {
                const maxRevenue = Math.max(...Object.values(ordersByRegion))
                return (
                  <div key={region}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">{region}</span>
                      <span className="font-medium text-slate-900">{formatCurrency(revenue)}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill bg-emerald-500" style={{ width: `${(revenue / maxRevenue) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </DrillDownModal>

      {/* Orders Modal */}
      <DrillDownModal isOpen={activeModal === 'orders'} onClose={() => setActiveModal(null)} title="Orders Breakdown" subtitle="Order status and payment analysis">
        <div className="space-y-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-600 font-medium">Pending</p>
              <p className="text-3xl font-bold text-blue-700">{metrics.orders_pending}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-sm text-emerald-600 font-medium">Completed</p>
              <p className="text-3xl font-bold text-emerald-700">{metrics.orders_completed}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-sm text-red-600 font-medium">Refunded</p>
              <p className="text-3xl font-bold text-red-700">{metrics.orders_refunded}</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-4">Payment Methods</h4>
            <div className="space-y-3">
              {Object.entries(ordersByPayment).sort(([,a], [,b]) => b - a).map(([method, count]) => {
                const total = Object.values(ordersByPayment).reduce((a, b) => a + b, 0)
                const pct = total > 0 ? (count / total) * 100 : 0
                return (
                  <div key={method}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 capitalize">{method.replace('_', ' ')}</span>
                      <span className="font-medium text-slate-900">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill bg-blue-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </DrillDownModal>

      {/* AOV Modal */}
      <DrillDownModal isOpen={activeModal === 'aov'} onClose={() => setActiveModal(null)} title="Average Order Value" subtitle="Order value distribution">
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-8 text-center text-white">
            <p className="text-sm font-medium text-white/80 mb-2">Current AOV</p>
            <p className="text-5xl font-bold">{formatCurrency(metrics.average_order_value)}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-4">Recent Order Values</h4>
            <div className="space-y-2">
              {recentOrders.slice(0, 8).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">{order.data.order_id}</span>
                  <span className="text-sm font-semibold text-slate-900">{formatCurrency(order.data.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DrillDownModal>

      {/* Traffic Modal */}
      <DrillDownModal isOpen={activeModal === 'traffic'} onClose={() => setActiveModal(null)} title="Traffic Analysis" subtitle="Page views and sources">
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <p className="text-sm text-orange-600 font-medium">Page Views</p>
              <p className="text-3xl font-bold text-orange-700">{formatNumber(metrics.page_views)}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <p className="text-sm text-amber-600 font-medium">Unique Visitors</p>
              <p className="text-3xl font-bold text-amber-700">{formatNumber(metrics.unique_visitors)}</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-4">Traffic Sources</h4>
            <div className="space-y-3">
              {Object.entries(pageViewsBySource).sort(([,a], [,b]) => b - a).map(([source, count]) => {
                const total = Object.values(pageViewsBySource).reduce((a, b) => a + b, 0)
                const pct = total > 0 ? (count / total) * 100 : 0
                return (
                  <div key={source}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 capitalize">{source.replace('_', ' ')}</span>
                      <span className="font-medium text-slate-900">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill bg-orange-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </DrillDownModal>

      {/* Cart Modal */}
      <DrillDownModal isOpen={activeModal === 'cart'} onClose={() => setActiveModal(null)} title="Cart Activity" subtitle="Products being added">
        <div className="space-y-8">
          <div className="bg-sky-50 rounded-xl p-6 text-center">
            <p className="text-sm text-sky-600 font-medium mb-2">Total Cart Additions</p>
            <p className="text-4xl font-bold text-sky-700">{formatNumber(metrics.cart_additions)}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-4">Popular Cart Items</h4>
            <div className="space-y-3">
              {Object.entries(cartsByProduct).sort(([,a], [,b]) => b - a).slice(0, 6).map(([product, count]) => {
                const maxCount = Math.max(...Object.values(cartsByProduct))
                return (
                  <div key={product}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 truncate max-w-[200px]">{product}</span>
                      <span className="font-medium text-slate-900">{count} adds</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill bg-sky-500" style={{ width: `${(count / maxCount) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </DrillDownModal>

      {/* Conversion Modal */}
      <DrillDownModal isOpen={activeModal === 'conversion'} onClose={() => setActiveModal(null)} title="Conversion Funnel" subtitle="From view to purchase">
        <div className="space-y-4">
          <div className="bg-slate-100 rounded-xl p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Page Views</span>
            <span className="text-lg font-bold text-slate-900">{formatNumber(metrics.page_views)}</span>
          </div>
          <div className="flex justify-center"><div className="w-0.5 h-6 bg-slate-300" /></div>
          <div className="bg-orange-100 rounded-xl p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-orange-700">Cart Additions</span>
            <span className="text-lg font-bold text-orange-900">{formatNumber(metrics.cart_additions)}</span>
          </div>
          <div className="flex justify-center"><div className="w-0.5 h-6 bg-slate-300" /></div>
          <div className="bg-violet-100 rounded-xl p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-violet-700">Checkout Started</span>
            <span className="text-lg font-bold text-violet-900">{metrics.orders_pending + metrics.orders_completed}</span>
          </div>
          <div className="flex justify-center"><div className="w-0.5 h-6 bg-slate-300" /></div>
          <div className="bg-emerald-100 rounded-xl p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-emerald-700">Orders Completed</span>
            <span className="text-lg font-bold text-emerald-900">{formatNumber(metrics.orders_total)}</span>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-6 text-center text-white mt-6">
            <p className="text-sm font-medium text-white/80 mb-2">Overall Conversion Rate</p>
            <p className="text-5xl font-bold">{formatPercent(metrics.conversion_rate / 100)}</p>
          </div>
        </div>
      </DrillDownModal>

      {/* Abandonment Modal */}
      <DrillDownModal isOpen={activeModal === 'abandonment'} onClose={() => setActiveModal(null)} title="Cart Abandonment" subtitle="Understanding lost sales">
        <div className="space-y-8">
          <div className="bg-amber-50 rounded-xl p-6 text-center">
            <p className="text-sm text-amber-600 font-medium mb-2">Abandonment Rate</p>
            <p className="text-4xl font-bold text-amber-700">{formatPercent(metrics.cart_abandonment_rate)}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-4">Recent Refund Reasons</h4>
            <div className="space-y-2">
              {Object.entries(refundsByReason).map(([reason, count]) => (
                <div key={reason} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm text-red-700">{reason}</span>
                  <span className="badge badge-danger">{count}</span>
                </div>
              ))}
              {Object.keys(refundsByReason).length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No recent refunds</p>
              )}
            </div>
          </div>
        </div>
      </DrillDownModal>

      {/* Events Modal */}
      <DrillDownModal isOpen={activeModal === 'events'} onClose={() => setActiveModal(null)} title="Event Stream" subtitle="System performance">
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 rounded-xl p-4 text-center">
              <p className="text-sm text-indigo-600 font-medium">Events/Second</p>
              <p className="text-3xl font-bold text-indigo-700">{metrics.events_per_second.toFixed(1)}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-sm text-red-600 font-medium">Error Rate</p>
              <p className="text-3xl font-bold text-red-700">{formatPercent(metrics.error_rate)}</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-4">Event Types (Last 100)</h4>
            <div className="flex flex-wrap gap-2">
              {['page_view', 'cart_add', 'order', 'checkout_complete', 'refund'].map((type) => (
                <span key={type} className="badge badge-neutral capitalize">
                  {type.replace('_', ' ')}: {events.filter(e => e.type === type).length}
                </span>
              ))}
            </div>
          </div>
        </div>
      </DrillDownModal>
    </>
  )
}

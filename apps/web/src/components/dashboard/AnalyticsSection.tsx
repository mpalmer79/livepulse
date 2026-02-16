'use client'

import { useStore } from '@/lib/store'
import { formatCurrency, formatNumber, timeAgo } from '@/lib/utils'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

export function AnalyticsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <RevenueChart />
        <TopProducts />
      </div>
      <div className="space-y-6">
        <AlertsPanel />
        <ActivityFeed />
      </div>
    </div>
  )
}

function RevenueChart() {
  const metricsHistory = useStore((s) => s.metricsHistory)
  const data = metricsHistory.map((m, i) => ({
    time: `${i}s`,
    Revenue: m.revenue_per_minute,
    Orders: m.orders_per_minute * 100,
    Events: m.events_per_second * 20,
  }))

  if (data.length < 2) {
    return (
      <div className="card-base p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4" style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}>Revenue & Activity</h3>
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Collecting data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card-base p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6" style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}>Revenue & Activity</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientEvents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="time" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
            <Legend iconType="circle" />
            <Area type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2} fill="url(#gradientRevenue)" />
            <Area type="monotone" dataKey="Orders" stroke="#3b82f6" strokeWidth={2} fill="url(#gradientOrders)" />
            <Area type="monotone" dataKey="Events" stroke="#8b5cf6" strokeWidth={2} fill="url(#gradientEvents)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function TopProducts() {
  const metrics = useStore((s) => s.metrics)
  const products = metrics?.top_products || []

  if (products.length === 0) {
    return (
      <div className="card-base p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4" style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}>Top Products</h3>
        <div className="h-48 flex items-center justify-center text-slate-400">
          <p className="text-sm">Waiting for sales data...</p>
        </div>
      </div>
    )
  }

  const maxRevenue = Math.max(...products.map((p) => p.revenue))

  return (
    <div className="card-base p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6" style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}>Top Products</h3>
      <div className="space-y-4">
        {products.map((product, i) => (
          <div key={product.name}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-200 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                }`}>{i + 1}</span>
                <span className="text-sm font-medium text-slate-700">{product.name}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-500">{formatNumber(product.units)} sold</span>
                <span className="font-semibold text-slate-900">{formatCurrency(product.revenue)}</span>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ 
                width: `${(product.revenue / maxRevenue) * 100}%`,
                background: i === 0 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : i === 1 ? 'linear-gradient(90deg, #64748b, #94a3b8)' : 'linear-gradient(90deg, #3b82f6, #60a5fa)'
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AlertsPanel() {
  const { alerts, acknowledgeAlert } = useStore()
  const unacknowledged = alerts.filter((a) => !a.acknowledged)

  return (
    <div className="card-base overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Alerts</h3>
        {unacknowledged.length > 0 && <span className="badge badge-danger">{unacknowledged.length} new</span>}
      </div>
      <div className="max-h-[200px] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-emerald-600">All clear</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className={`px-5 py-3 flex items-start gap-3 ${alert.acknowledged ? 'opacity-50' : ''}`}>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                  alert.severity === 'error' ? 'bg-red-50 text-red-600' :
                  alert.severity === 'warning' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                }`}>{alert.severity}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{alert.name}</p>
                  <p className="text-xs text-slate-500 truncate">{alert.message}</p>
                </div>
                {!alert.acknowledged && (
                  <button onClick={() => acknowledgeAlert(alert.id)} className="text-xs text-slate-400 hover:text-slate-600">Dismiss</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ActivityFeed() {
  const { events, clearEvents } = useStore()

  const getEventStyles = (type: string) => {
    const styles: Record<string, { bg: string; label: string }> = {
      order: { bg: 'bg-emerald-500', label: 'Order' },
      cart_add: { bg: 'bg-blue-500', label: 'Cart Add' },
      cart_remove: { bg: 'bg-orange-500', label: 'Cart Remove' },
      page_view: { bg: 'bg-slate-400', label: 'Page View' },
      checkout_start: { bg: 'bg-violet-500', label: 'Checkout' },
      checkout_complete: { bg: 'bg-teal-500', label: 'Complete' },
      refund: { bg: 'bg-red-500', label: 'Refund' },
      review: { bg: 'bg-amber-500', label: 'Review' },
    }
    return styles[type] || { bg: 'bg-slate-400', label: type }
  }

  return (
    <div className="card-base overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Live Activity</h3>
        <button onClick={clearEvents} className="text-xs text-slate-400 hover:text-slate-600">Clear</button>
      </div>
      <div className="h-[400px] overflow-y-auto">
        {events.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-400">Waiting for events...</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {events.slice(0, 50).map((event) => {
              const styles = getEventStyles(event.type)
              return (
                <div key={event.id} className="event-item event-item-enter">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${styles.bg}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-slate-800">{styles.label}</span>
                        <span className="text-xs text-slate-400">{timeAgo(event.timestamp)}</span>
                      </div>
                      <div className="text-sm text-slate-500 mt-0.5">
                        {event.type === 'order' && <span className="text-emerald-600 font-medium">{formatCurrency(event.data.total)} • {event.data.item_count} items</span>}
                        {event.type === 'cart_add' && event.data.product_name}
                        {event.type === 'page_view' && `${event.data.page_type} • ${event.data.source}`}
                        {event.type === 'refund' && <span className="text-red-600">{formatCurrency(event.data.refund_amount)}</span>}
                        {event.type === 'checkout_complete' && <span className="text-teal-600 font-medium">{formatCurrency(event.data.total)}</span>}
                      </div>
                      {event.data.region_name && <p className="text-xs text-slate-400 mt-1">{event.data.region_name}</p>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Package,
  Eye,
  BarChart3,
  AlertCircle,
  ChevronRight,
  X
} from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  gradient: string
  onClick?: () => void
  trend?: { value: number; positive: boolean }
}

function MetricCard({ title, value, subtitle, icon, gradient, onClick, trend }: MetricCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-2xl p-5 shadow-sm border border-slate-100 
        card-hover drilldown-card group
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.positive ? 'text-emerald-600' : 'text-red-500'}`}>
              <TrendingUp className={`h-3 w-3 ${!trend.positive && 'rotate-180'}`} />
              <span>{trend.positive ? '+' : ''}{trend.value}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${gradient}`}>
          {icon}
        </div>
      </div>
      {onClick && (
        <div className="flex items-center gap-1 mt-3 text-xs text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>View details</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      )}
    </div>
  )
}

interface DrillDownModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
}

function DrillDownModal({ title, onClose, children }: DrillDownModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {children}
        </div>
      </div>
    </div>
  )
}

export function MetricsCards() {
  const metrics = useStore((s) => s.metrics)
  const events = useStore((s) => s.events)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  if (!metrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-24 mb-3" />
            <div className="h-8 bg-slate-200 rounded w-32" />
          </div>
        ))}
      </div>
    )
  }

  // Calculate breakdown data
  const recentOrders = events.filter(e => e.type === 'order').slice(0, 10)
  const ordersByRegion = recentOrders.reduce((acc, order) => {
    const region = order.data.region_name || 'Unknown'
    acc[region] = (acc[region] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const ordersByPayment = recentOrders.reduce((acc, order) => {
    const method = order.data.payment_method || 'Unknown'
    acc[method] = (acc[method] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.revenue_total)}
          subtitle={`${formatCurrency(metrics.revenue_per_minute)}/min`}
          icon={<DollarSign className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          onClick={() => setActiveModal('revenue')}
          trend={{ value: 12.5, positive: true }}
        />
        
        <MetricCard
          title="Orders"
          value={formatNumber(metrics.orders_total)}
          subtitle={`${metrics.orders_per_minute.toFixed(1)}/min`}
          icon={<Package className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-br from-violet-500 to-purple-600"
          onClick={() => setActiveModal('orders')}
          trend={{ value: 8.3, positive: true }}
        />
        
        <MetricCard
          title="Avg Order Value"
          value={formatCurrency(metrics.average_order_value)}
          icon={<TrendingUp className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
          onClick={() => setActiveModal('aov')}
        />
        
        <MetricCard
          title="Page Views"
          value={formatNumber(metrics.page_views)}
          subtitle={`${formatNumber(metrics.unique_visitors)} unique`}
          icon={<Eye className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-br from-slate-500 to-slate-600"
        />
        
        <MetricCard
          title="Cart Additions"
          value={formatNumber(metrics.cart_additions)}
          icon={<ShoppingCart className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-br from-orange-500 to-amber-600"
        />
        
        <MetricCard
          title="Conversion Rate"
          value={formatPercent(metrics.conversion_rate / 100)}
          icon={<BarChart3 className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-br from-pink-500 to-rose-600"
          onClick={() => setActiveModal('conversion')}
        />
        
        <MetricCard
          title="Cart Abandonment"
          value={formatPercent(metrics.cart_abandonment_rate)}
          icon={<AlertCircle className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-br from-yellow-500 to-orange-600"
        />
        
        <MetricCard
          title="Events/sec"
          value={metrics.events_per_second.toFixed(1)}
          subtitle={`${formatPercent(metrics.error_rate)} errors`}
          icon={<Users className="h-5 w-5 text-white" />}
          gradient="bg-gradient-to-br from-indigo-500 to-violet-600"
        />
      </div>

      {/* Drill-Down Modals */}
      {activeModal === 'revenue' && (
        <DrillDownModal title="Revenue Breakdown" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-3">Revenue by Region</h4>
              <div className="space-y-2">
                {Object.entries(ordersByRegion).map(([region, count]) => (
                  <div key={region} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">{region}</span>
                    <span className="text-sm text-slate-500">{count} orders</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-3">Key Metrics</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <p className="text-xs text-emerald-600 mb-1">Total Revenue</p>
                  <p className="text-xl font-bold text-emerald-700">{formatCurrency(metrics.revenue_total)}</p>
                </div>
                <div className="p-4 bg-violet-50 rounded-xl">
                  <p className="text-xs text-violet-600 mb-1">Revenue/Min</p>
                  <p className="text-xl font-bold text-violet-700">{formatCurrency(metrics.revenue_per_minute)}</p>
                </div>
              </div>
            </div>
          </div>
        </DrillDownModal>
      )}

      {activeModal === 'orders' && (
        <DrillDownModal title="Orders Breakdown" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-3">Payment Methods</h4>
              <div className="space-y-2">
                {Object.entries(ordersByPayment).map(([method, count]) => (
                  <div key={method} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700 capitalize">{method.replace('_', ' ')}</span>
                    <span className="text-sm text-slate-500">{count} orders</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-3">Order Status</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-blue-50 rounded-xl text-center">
                  <p className="text-xs text-blue-600 mb-1">Pending</p>
                  <p className="text-xl font-bold text-blue-700">{metrics.orders_pending}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl text-center">
                  <p className="text-xs text-emerald-600 mb-1">Completed</p>
                  <p className="text-xl font-bold text-emerald-700">{metrics.orders_completed}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl text-center">
                  <p className="text-xs text-red-600 mb-1">Refunded</p>
                  <p className="text-xl font-bold text-red-700">{metrics.orders_refunded}</p>
                </div>
              </div>
            </div>
          </div>
        </DrillDownModal>
      )}

      {activeModal === 'aov' && (
        <DrillDownModal title="Average Order Value Details" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl text-center">
              <p className="text-sm text-blue-600 mb-2">Current AOV</p>
              <p className="text-4xl font-bold text-blue-700">{formatCurrency(metrics.average_order_value)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-3">Recent Order Values</h4>
              <div className="space-y-2">
                {recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">{order.data.order_id}</span>
                    <span className="text-sm font-medium text-slate-800">{formatCurrency(order.data.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DrillDownModal>
      )}

      {activeModal === 'conversion' && (
        <DrillDownModal title="Conversion Funnel" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div className="relative">
              <div className="flex items-center justify-between p-4 bg-slate-100 rounded-xl">
                <span className="text-sm font-medium text-slate-700">Page Views</span>
                <span className="text-lg font-bold text-slate-800">{formatNumber(metrics.page_views)}</span>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-4 bg-slate-300" />
            </div>
            <div className="relative">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                <span className="text-sm font-medium text-orange-700">Cart Additions</span>
                <span className="text-lg font-bold text-orange-800">{formatNumber(metrics.cart_additions)}</span>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-4 bg-slate-300" />
            </div>
            <div className="relative">
              <div className="flex items-center justify-between p-4 bg-violet-50 rounded-xl">
                <span className="text-sm font-medium text-violet-700">Checkouts Started</span>
                <span className="text-lg font-bold text-violet-800">{metrics.orders_pending + metrics.orders_completed}</span>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-4 bg-slate-300" />
            </div>
            <div>
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                <span className="text-sm font-medium text-emerald-700">Orders Completed</span>
                <span className="text-lg font-bold text-emerald-800">{formatNumber(metrics.orders_total)}</span>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl text-center">
              <p className="text-white/80 text-sm">Conversion Rate</p>
              <p className="text-3xl font-bold text-white">{formatPercent(metrics.conversion_rate / 100)}</p>
            </div>
          </div>
        </DrillDownModal>
      )}
    </>
  )
}

'use client'

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
  AlertCircle
} from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  iconColor: string
}

function MetricCard({ title, value, subtitle, icon, iconColor }: MetricCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${iconColor}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export function MetricsCards() {
  const metrics = useStore((s) => s.metrics)

  if (!metrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-24 mb-2" />
            <div className="h-8 bg-muted rounded w-32" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        title="Total Revenue"
        value={formatCurrency(metrics.revenue_total)}
        subtitle={`${formatCurrency(metrics.revenue_per_minute)}/min`}
        icon={<DollarSign className="h-5 w-5" />}
        iconColor="bg-green-500/20 text-green-500"
      />
      
      <MetricCard
        title="Orders"
        value={formatNumber(metrics.orders_total)}
        subtitle={`${metrics.orders_per_minute.toFixed(1)}/min`}
        icon={<Package className="h-5 w-5" />}
        iconColor="bg-blue-500/20 text-blue-500"
      />
      
      <MetricCard
        title="Avg Order Value"
        value={formatCurrency(metrics.average_order_value)}
        icon={<TrendingUp className="h-5 w-5" />}
        iconColor="bg-purple-500/20 text-purple-500"
      />
      
      <MetricCard
        title="Page Views"
        value={formatNumber(metrics.page_views)}
        subtitle={`${formatNumber(metrics.unique_visitors)} unique`}
        icon={<Eye className="h-5 w-5" />}
        iconColor="bg-slate-500/20 text-slate-400"
      />
      
      <MetricCard
        title="Cart Additions"
        value={formatNumber(metrics.cart_additions)}
        icon={<ShoppingCart className="h-5 w-5" />}
        iconColor="bg-orange-500/20 text-orange-500"
      />
      
      <MetricCard
        title="Conversion Rate"
        value={formatPercent(metrics.conversion_rate / 100)}
        icon={<BarChart3 className="h-5 w-5" />}
        iconColor="bg-emerald-500/20 text-emerald-500"
      />
      
      <MetricCard
        title="Cart Abandonment"
        value={formatPercent(metrics.cart_abandonment_rate)}
        icon={<AlertCircle className="h-5 w-5" />}
        iconColor="bg-yellow-500/20 text-yellow-500"
      />
      
      <MetricCard
        title="Events/sec"
        value={metrics.events_per_second.toFixed(1)}
        subtitle={`${formatPercent(metrics.error_rate)} errors`}
        icon={<Users className="h-5 w-5" />}
        iconColor="bg-cyan-500/20 text-cyan-500"
      />
    </div>
  )
}

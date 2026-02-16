'use client'

import { useStore } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export function RevenueChart() {
  const metricsHistory = useStore((s) => s.metricsHistory)

  const data = metricsHistory.map((m, i) => ({
    time: i,
    revenue: m.revenue_per_minute,
    orders: m.orders_per_minute * 50,
    events: m.events_per_second * 10,
  }))

  if (data.length < 2) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue & Activity</h3>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          Collecting data...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Revenue & Activity</h3>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            
            <XAxis 
              dataKey="time" 
              stroke="#666"
              tick={{ fill: '#666', fontSize: 12 }}
              tickFormatter={(v) => `${v}s`}
            />
            
            <YAxis 
              stroke="#666"
              tick={{ fill: '#666', fontSize: 12 }}
              tickFormatter={(v) => `$${v}`}
            />
            
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a2e',
                border: '1px solid #333',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#999' }}
              formatter={(value: number, name: string) => {
                if (name === 'revenue') return [formatCurrency(value), 'Revenue/min']
                if (name === 'orders') return [(value / 50).toFixed(1), 'Orders/min']
                return [(value / 10).toFixed(1), 'Events/sec']
              }}
            />
            
            <Legend />
            
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#colorRevenue)"
              name="Revenue"
            />
            
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorOrders)"
              name="Orders"
            />
            
            <Area
              type="monotone"
              dataKey="events"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#colorEvents)"
              name="Events"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

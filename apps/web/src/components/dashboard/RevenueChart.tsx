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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Revenue & Activity</h3>
        <div className="h-[300px] flex items-center justify-center text-slate-400">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p>Collecting data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Revenue & Activity</h3>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(v) => `${v}s`}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            
            <YAxis 
              stroke="#94a3b8"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(v) => `$${v}`}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              labelStyle={{ color: '#64748b', marginBottom: '8px' }}
              formatter={(value: number, name: string) => {
                if (name === 'revenue') return [formatCurrency(value), 'Revenue/min']
                if (name === 'orders') return [(value / 50).toFixed(1), 'Orders/min']
                return [(value / 10).toFixed(1), 'Events/sec']
              }}
            />
            
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-slate-600 text-sm">{value}</span>}
            />
            
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorRevenue)"
              name="Revenue"
            />
            
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#colorOrders)"
              name="Orders"
            />
            
            <Area
              type="monotone"
              dataKey="events"
              stroke="#06b6d4"
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

'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Header } from '@/components/dashboard/Header'
import { MetricsCards } from '@/components/dashboard/MetricsCards'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { EventFeed } from '@/components/dashboard/EventFeed'
import { ControlPanel } from '@/components/dashboard/ControlPanel'
import { TopProducts } from '@/components/dashboard/TopProducts'
import { AlertsPanel } from '@/components/dashboard/AlertsPanel'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/stream'

export default function Dashboard() {
  const connect = useStore((s) => s.connect)

  useEffect(() => {
    connect(WS_URL)
  }, [connect])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-6">
        {/* Control Panel */}
        <ControlPanel />

        {/* Metrics Cards */}
        <MetricsCards />

        {/* Charts and Feed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Charts */}
          <div className="lg:col-span-2 space-y-6">
            <RevenueChart />
            <TopProducts />
          </div>

          {/* Right - Events & Alerts */}
          <div className="space-y-6">
            <AlertsPanel />
            <EventFeed />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-slate-500">
            LivePulse - Built by <span className="font-medium text-slate-700">Michael Palmer</span>
          </p>
          <a 
            href="https://github.com/mpalmer79" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-violet-600 hover:text-violet-700 hover:underline mt-1 inline-block"
          >
            github.com/mpalmer79
          </a>
        </div>
      </footer>
    </div>
  )
}

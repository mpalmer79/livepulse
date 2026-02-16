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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
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
      <footer className="border-t border-border mt-8 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>LivePulse - Built by Michael Palmer</p>
          <a 
            href="https://github.com/mpalmer79" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            github.com/mpalmer79
          </a>
        </div>
      </footer>
    </div>
  )
}

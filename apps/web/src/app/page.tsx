'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { Header } from '@/components/dashboard/Header'
import { HeroSection } from '@/components/dashboard/HeroSection'
import { MetricsGrid } from '@/components/dashboard/MetricsGrid'
import { AnalyticsSection } from '@/components/dashboard/AnalyticsSection'
import { InsightsPanel } from '@/components/dashboard/InsightsPanel'
import { Footer } from '@/components/dashboard/Footer'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/stream'

export default function Dashboard() {
  const connect = useStore((s) => s.connect)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    connect(WS_URL)
  }, [connect])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <HeroSection />
      
      <main className="container mx-auto px-6 -mt-8 relative z-10">
        <section className="mb-12">
          <MetricsGrid />
        </section>

        <section className="mb-12">
          <AnalyticsSection />
        </section>

        <section className="mb-16">
          <InsightsPanel />
        </section>
      </main>

      <Footer />
    </div>
  )
}

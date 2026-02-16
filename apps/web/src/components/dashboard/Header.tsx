'use client'

import { useStore } from '@/lib/store'
import { Activity, Wifi, WifiOff, Zap } from 'lucide-react'

export function Header() {
  const { isConnected, sandboxState } = useStore()

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">LivePulse</h1>
              <p className="text-xs text-slate-500">Real-time Analytics Sandbox</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-6">
            {/* Connection Status */}
            <div className="flex items-center gap-2 text-sm">
              {isConnected ? (
                <>
                  <div className="p-1.5 rounded-full bg-emerald-100">
                    <Wifi className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-emerald-600 font-medium">Connected</span>
                </>
              ) : (
                <>
                  <div className="p-1.5 rounded-full bg-red-100">
                    <WifiOff className="h-4 w-4 text-red-500" />
                  </div>
                  <span className="text-red-500 font-medium">Disconnected</span>
                </>
              )}
            </div>

            {/* Live Indicator */}
            {sandboxState?.is_running && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                <div className="live-dot" />
                <span className="text-emerald-600 font-semibold text-sm">LIVE</span>
              </div>
            )}

            {/* Events Count */}
            {sandboxState && (
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                <Activity className="h-4 w-4 text-violet-500" />
                <span className="font-medium">{sandboxState.events_generated.toLocaleString()} events</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

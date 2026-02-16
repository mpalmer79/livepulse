'use client'

import { useStore } from '@/lib/store'
import { Activity, Wifi, WifiOff, Zap } from 'lucide-react'

export function Header() {
  const { isConnected, sandboxState } = useStore()

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">LivePulse</h1>
              <p className="text-xs text-muted-foreground">Real-time Analytics Sandbox</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2 text-sm">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">Disconnected</span>
                </>
              )}
            </div>

            {/* Live Indicator */}
            {sandboxState?.is_running && (
              <div className="flex items-center gap-2 text-sm">
                <div className="live-dot" />
                <span className="text-green-500 font-medium">LIVE</span>
              </div>
            )}

            {/* Events Count */}
            {sandboxState && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>{sandboxState.events_generated.toLocaleString()} events</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

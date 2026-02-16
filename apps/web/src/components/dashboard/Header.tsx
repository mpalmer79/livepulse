'use client'

import { useStore } from '@/lib/store'

export function Header() {
  const { isConnected, sandboxState } = useStore()

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div 
              className="h-10 w-10 rounded-lg bg-cover bg-center"
              style={{
                backgroundImage: `
                  linear-gradient(135deg, rgba(37, 99, 235, 0.9) 0%, rgba(124, 58, 237, 0.9) 100%),
                  url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&q=80')
                `
              }}
            />
            <div>
              <h1 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}>
                LivePulse
              </h1>
              <p className="text-xs text-slate-500">Real-time Analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className={`text-sm font-medium ${isConnected ? 'text-emerald-600' : 'text-red-600'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {sandboxState?.is_running && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                <div className="live-pulse" />
                <span className="text-sm font-semibold text-emerald-700">LIVE</span>
              </div>
            )}

            {sandboxState && (
              <div className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{sandboxState.events_generated.toLocaleString()}</span>
                <span className="ml-1">events</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

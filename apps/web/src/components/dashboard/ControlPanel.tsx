'use client'

import { useStore } from '@/lib/store'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle,
  ShoppingCart,
  Package,
  CreditCard,
  Gauge
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function ControlPanel() {
  const { 
    sandboxState, 
    setSpeed, 
    toggleChaos, 
    pauseSimulation, 
    resumeSimulation, 
    resetSimulation,
    injectEvent 
  } = useStore()

  const speeds = [1, 5, 10, 25, 50]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className="flex flex-wrap items-center gap-6">
        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Gauge className="h-4 w-4" />
            <span className="font-medium">Playback</span>
          </div>
          
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {sandboxState?.is_running ? (
              <button
                onClick={pauseSimulation}
                className="p-2 rounded-lg bg-white shadow-sm hover:shadow transition-all"
                title="Pause"
              >
                <Pause className="h-4 w-4 text-slate-700" />
              </button>
            ) : (
              <button
                onClick={resumeSimulation}
                className="p-2 rounded-lg bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 transition-all"
                title="Resume"
              >
                <Play className="h-4 w-4" />
              </button>
            )}
            
            <button
              onClick={resetSimulation}
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all"
              title="Reset"
            >
              <RotateCcw className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200" />

        {/* Speed Control */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 font-medium">Speed</span>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  sandboxState?.speed === s
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-white hover:shadow-sm'
                )}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200" />

        {/* Chaos Mode */}
        <button
          onClick={toggleChaos}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
            sandboxState?.chaos_enabled
              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          <AlertTriangle className="h-4 w-4" />
          Chaos {sandboxState?.chaos_enabled ? 'ON' : 'OFF'}
        </button>

        {/* Event Injection */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-slate-500 font-medium">Inject</span>
          
          <button
            onClick={() => injectEvent('order', 5)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
            title="Inject 5 orders"
          >
            <Package className="h-4 w-4" />
            Orders
          </button>
          
          <button
            onClick={() => injectEvent('cart_add', 10)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            title="Inject 10 cart adds"
          >
            <ShoppingCart className="h-4 w-4" />
            Carts
          </button>
          
          <button
            onClick={() => injectEvent('refund', 3)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            title="Inject 3 refunds"
          >
            <CreditCard className="h-4 w-4" />
            Refunds
          </button>
        </div>
      </div>
    </div>
  )
}

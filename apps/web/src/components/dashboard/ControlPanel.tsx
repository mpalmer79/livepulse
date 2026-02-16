'use client'

import { useStore } from '@/lib/store'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  AlertTriangle,
  ShoppingCart,
  Package,
  CreditCard
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
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex flex-wrap items-center gap-6">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">Playback:</span>
          
          {sandboxState?.is_running ? (
            <button
              onClick={pauseSimulation}
              className="p-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
              title="Pause"
            >
              <Pause className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={resumeSimulation}
              className="p-2 rounded-md bg-green-600 hover:bg-green-700 transition-colors"
              title="Resume"
            >
              <Play className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={resetSimulation}
            className="p-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Speed:</span>
          <div className="flex gap-1">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={cn(
                  'px-3 py-1 rounded text-sm font-medium transition-colors',
                  sandboxState?.speed === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80'
                )}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Chaos Mode */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleChaos}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              sandboxState?.chaos_enabled
                ? 'bg-red-600 text-white'
                : 'bg-secondary hover:bg-secondary/80'
            )}
          >
            <AlertTriangle className="h-4 w-4" />
            Chaos {sandboxState?.chaos_enabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Event Injection */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-muted-foreground">Inject:</span>
          
          <button
            onClick={() => injectEvent('order', 5)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors"
            title="Inject 5 orders"
          >
            <Package className="h-3.5 w-3.5" />
            Orders
          </button>
          
          <button
            onClick={() => injectEvent('cart_add', 10)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
            title="Inject 10 cart adds"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Carts
          </button>
          
          <button
            onClick={() => injectEvent('refund', 3)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
            title="Inject 3 refunds"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Refunds
          </button>
        </div>
      </div>
    </div>
  )
}

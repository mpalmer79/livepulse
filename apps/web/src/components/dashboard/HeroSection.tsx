'use client'

import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function HeroSection() {
  const { 
    sandboxState, 
    setSpeed, 
    toggleChaos, 
    pauseSimulation, 
    resumeSimulation, 
    resetSimulation,
    injectEvent 
  } = useStore()

  const speeds = [
    { value: 1, label: '1×' },
    { value: 5, label: '5×' },
    { value: 10, label: '10×' },
    { value: 25, label: '25×' },
    { value: 50, label: '50×' },
  ]

  return (
    <section className="relative overflow-hidden">
      {/* Background with subtle gradient and image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `
            linear-gradient(135deg, rgba(248, 250, 252, 0.88) 0%, rgba(241, 245, 249, 0.92) 50%, rgba(248, 250, 252, 1) 100%),
            url('https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1920&q=80')
          `
        }}
      />
      
      <div className="relative container mx-auto px-6 pt-12 pb-24">
        {/* Headline */}
        <div className="max-w-3xl mb-10">
          <h1 className="text-4xl md:text-5xl font-normal text-slate-900 mb-4 leading-tight">
            E-Commerce Analytics
            <span className="block text-blue-600">in Real-Time</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Watch simulated e-commerce activity unfold live. This sandbox demonstrates 
            real-time data streaming, interactive visualizations, and actionable business 
            intelligence—the building blocks of modern analytics platforms.
          </p>
        </div>

        {/* Sandbox Controls */}
        <div className="card-elevated p-6 max-w-4xl">
          <div className="flex flex-wrap items-center gap-8">
            {/* Simulation Status */}
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                Simulation
              </div>
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                {sandboxState?.is_running ? (
                  <button
                    onClick={pauseSimulation}
                    className="px-4 py-2 rounded-md bg-white shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={resumeSimulation}
                    className="px-4 py-2 rounded-md bg-emerald-500 shadow-sm text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
                  >
                    Resume
                  </button>
                )}
                <button
                  onClick={resetSimulation}
                  className="px-4 py-2 rounded-md text-sm font-medium text-slate-500 hover:bg-white hover:shadow-sm transition-all"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                Speed
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                {speeds.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSpeed(s.value)}
                    className={cn(
                      'px-3 py-2 rounded-md text-sm font-medium transition-all',
                      sandboxState?.speed === s.value
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-white hover:shadow-sm'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chaos Mode */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleChaos}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  sandboxState?.chaos_enabled
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                Chaos {sandboxState?.chaos_enabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Event Injection */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                Inject Events
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => injectEvent('order', 5)}
                  className="btn-success"
                >
                  + 5 Orders
                </button>
                <button
                  onClick={() => injectEvent('cart_add', 10)}
                  className="btn-primary"
                >
                  + 10 Cart Adds
                </button>
                <button
                  onClick={() => injectEvent('page_view', 25)}
                  className="btn-secondary"
                >
                  + 25 Page Views
                </button>
                <button
                  onClick={() => injectEvent('refund', 3)}
                  className="btn-danger"
                >
                  + 3 Refunds
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

The key change is line 28-31 where the background image URL is now:
```
https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1920&q=80

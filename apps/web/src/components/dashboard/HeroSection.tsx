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
    injectEvent,
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
      {/* Background image (VISIBLE) */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-70"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1920&q=80')",
        }}
        aria-hidden="true"
      />

      {/* Light overlay (keep subtle so image shows through) */}
      <div
        className="absolute inset-0 z-10 bg-gradient-to-br from-slate-50/55 via-slate-50/65 to-slate-50/80"
        aria-hidden="true"
      />

      <div className="relative z-20 container mx-auto px-6 pt-12 pb-24">
        {/* Headline */}
        <div className="max-w-3xl mb-10">
          <h1 className="text-4xl md:text-5xl font-normal text-slate-900 mb-4 leading-tight">
            E-Commerce Analytics
            <span className="block text-blue-600">in Real-Time</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Watch simulated e-commerce activity unfold live. This sandbox demonstrates real-time data
            streaming, interactive visualizations, and actionable business intelligence—the building
            blocks of modern analytics platforms.
          </p>
        </div>

        {/* Sandbox Controls */}
        <div className="card-elevated p-6 max-w-4xl">
          <div className="flex flex-wrap items-center gap-8">
            {/* Simulation Status */}
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Simulation
              </div>
              <div className="flex items-center gap-2">
                {sandboxState?.isRunning ? (
                  <button onClick={pauseSimulation} className="btn-secondary">
                    Pause
                  </button>
                ) : (
                  <button onClick={resumeSimulation} className="btn-primary">
                    Resume
                  </button>
                )}
                <button onClick={resetSimulation} className="btn-secondary">
                  Reset
                </button>
              </div>
            </div>

            {/* Speed Controls */}
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Speed</div>
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                {speeds.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSpeed(s.value)}
                    className={cn(
                      'px-3 py-2 rounded-md text-sm font-medium transition-all',
                      sandboxState?.speed === s.value
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chaos Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleChaos}
                className={cn('btn-secondary', sandboxState?.chaosEnabled ? 'ring-2 ring-purple-300' : '')}
              >
                Chaos {sandboxState?.chaosEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Inject Events */}
            <div className="w-full pt-6 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  Inject Events
                </div>
                <button onClick={() => injectEvent('order', 5)} className="btn-success">
                  + 5 Orders
                </button>
                <button onClick={() => injectEvent('cart_add', 10)} className="btn-primary">
                  + 10 Cart Adds
                </button>
                <button onClick={() => injectEvent('page_view', 25)} className="btn-secondary">
                  + 25 Page Views
                </button>
                <button onClick={() => injectEvent('refund', 3)} className="btn-danger">
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

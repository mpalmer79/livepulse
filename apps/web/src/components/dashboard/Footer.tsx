'use client'

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}>LivePulse</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              A real-time analytics sandbox demonstrating WebSocket data streaming, 
              interactive visualizations, and modern dashboard design patterns.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">Tech Stack</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Next.js 14 + TypeScript</li>
              <li>FastAPI + WebSockets</li>
              <li>Recharts + Tailwind CSS</li>
              <li>Zustand State Management</li>
              <li>Railway + Vercel Deploy</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://github.com/mpalmer79" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">GitHub Profile</a></li>
              <li><a href="https://github.com/mpalmer79/livepulse" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Source Code</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">Built by <span className="text-white font-medium">Michael Palmer</span></p>
          <p className="text-sm text-slate-500">Portfolio Project • {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  )
}

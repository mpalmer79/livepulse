'use client'

import { useStore } from '@/lib/store'
import { cn, timeAgo } from '@/lib/utils'
import { AlertTriangle, Bell, CheckCircle2, X } from 'lucide-react'

const severityConfig: Record<string, { bg: string; text: string; icon: string }> = {
  info: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
  warning: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: 'text-yellow-500' },
  error: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', icon: 'text-red-600' },
}

export function AlertsPanel() {
  const { alerts, acknowledgeAlert } = useStore()
  const unacknowledged = alerts.filter((a) => !a.acknowledged)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-violet-500" />
          <h3 className="font-semibold text-slate-800">Alerts</h3>
          {unacknowledged.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
              {unacknowledged.length}
            </span>
          )}
        </div>
      </div>

      <div className="max-h-[200px] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-emerald-600">All clear!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {alerts.slice(0, 10).map((alert) => {
              const config = severityConfig[alert.severity] || severityConfig.info
              
              return (
                <div
                  key={alert.id}
                  className={cn(
                    'p-4 flex items-start gap-3 transition-all',
                    alert.acknowledged ? 'opacity-50 bg-slate-50' : config.bg
                  )}
                >
                  <AlertTriangle className={cn('h-5 w-5 mt-0.5', config.icon)} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn('text-sm font-medium', config.text)}>{alert.name}</span>
                      <span className="text-xs text-slate-400">
                        {timeAgo(alert.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {alert.message}
                    </p>
                  </div>

                  {!alert.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                      title="Acknowledge"
                    >
                      <X className="h-4 w-4 text-slate-400" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

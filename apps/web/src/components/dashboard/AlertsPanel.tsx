'use client'

import { useStore } from '@/lib/store'
import { cn, getSeverityColor, timeAgo } from '@/lib/utils'
import { AlertTriangle, Bell, Check, X } from 'lucide-react'

export function AlertsPanel() {
  const { alerts, acknowledgeAlert } = useStore()
  const unacknowledged = alerts.filter((a) => !a.acknowledged)

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <h3 className="font-semibold">Alerts</h3>
          {unacknowledged.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">
              {unacknowledged.length}
            </span>
          )}
        </div>
      </div>

      <div className="max-h-[200px] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Check className="h-8 w-8 mb-2 text-green-500" />
            <p className="text-sm">All clear!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {alerts.slice(0, 10).map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'p-3 flex items-start gap-3 transition-colors',
                  alert.acknowledged ? 'opacity-50' : 'bg-muted/30'
                )}
              >
                <AlertTriangle className={cn('h-4 w-4 mt-0.5', getSeverityColor(alert.severity))} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{alert.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(alert.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {alert.message}
                  </p>
                </div>

                {!alert.acknowledged && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    title="Acknowledge"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

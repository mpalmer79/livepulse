'use client'

import { useStore } from '@/lib/store'
import { cn, getEventColor, timeAgo, formatCurrency } from '@/lib/utils'
import { 
  Package, 
  ShoppingCart, 
  Eye, 
  CreditCard, 
  Star,
  Trash2,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

const eventIcons: Record<string, React.ReactNode> = {
  order: <Package className="h-3.5 w-3.5" />,
  cart_add: <ShoppingCart className="h-3.5 w-3.5" />,
  cart_remove: <Trash2 className="h-3.5 w-3.5" />,
  page_view: <Eye className="h-3.5 w-3.5" />,
  checkout_start: <ArrowRight className="h-3.5 w-3.5" />,
  checkout_complete: <CheckCircle className="h-3.5 w-3.5" />,
  refund: <CreditCard className="h-3.5 w-3.5" />,
  review: <Star className="h-3.5 w-3.5" />,
}

export function EventFeed() {
  const { events, clearEvents } = useStore()

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold">Live Events</h3>
        <button
          onClick={clearEvents}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="h-[400px] overflow-y-auto">
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Waiting for events...
          </div>
        ) : (
          <div className="divide-y divide-border">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-3 hover:bg-muted/50 transition-colors animate-fade-in"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={cn(
                    'p-1.5 rounded-md mt-0.5',
                    getEventColor(event.type).replace('bg-', 'bg-') + '/20',
                    getEventColor(event.type).replace('bg-', 'text-')
                  )}>
                    {eventIcons[event.type] || <Eye className="h-3.5 w-3.5" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium capitalize">
                        {event.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(event.timestamp)}
                      </span>
                    </div>

                    {/* Event details */}
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {event.type === 'order' && (
                        <span className="text-green-400">
                          {formatCurrency(event.data.total)} • {event.data.item_count} items
                        </span>
                      )}
                      {event.type === 'cart_add' && (
                        <span>{event.data.product_name}</span>
                      )}
                      {event.type === 'page_view' && (
                        <span>{event.data.page_type} • {event.data.source}</span>
                      )}
                      {event.type === 'refund' && (
                        <span className="text-red-400">
                          {formatCurrency(event.data.refund_amount)} • {event.data.reason}
                        </span>
                      )}
                      {event.type === 'review' && (
                        <span>
                          {'⭐'.repeat(event.data.rating)} {event.data.product_name}
                        </span>
                      )}
                      {event.type === 'checkout_start' && (
                        <span>{formatCurrency(event.data.total)} • {event.data.item_count} items</span>
                      )}
                      {event.type === 'checkout_complete' && (
                        <span className="text-emerald-400">
                          {formatCurrency(event.data.total)} • {event.data.payment_method}
                        </span>
                      )}
                    </div>

                    {/* Region */}
                    {event.data.region_name && (
                      <div className="text-xs text-muted-foreground/60 mt-0.5">
                        📍 {event.data.region_name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

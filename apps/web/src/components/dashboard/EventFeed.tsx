'use client'

import { useStore } from '@/lib/store'
import { cn, timeAgo, formatCurrency } from '@/lib/utils'
import { 
  Package, 
  ShoppingCart, 
  Eye, 
  CreditCard, 
  Star,
  Trash2,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react'

const eventConfig: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
  order: { 
    icon: <Package className="h-4 w-4" />, 
    bg: 'bg-emerald-100', 
    text: 'text-emerald-600' 
  },
  cart_add: { 
    icon: <ShoppingCart className="h-4 w-4" />, 
    bg: 'bg-blue-100', 
    text: 'text-blue-600' 
  },
  cart_remove: { 
    icon: <Trash2 className="h-4 w-4" />, 
    bg: 'bg-orange-100', 
    text: 'text-orange-600' 
  },
  page_view: { 
    icon: <Eye className="h-4 w-4" />, 
    bg: 'bg-slate-100', 
    text: 'text-slate-600' 
  },
  checkout_start: { 
    icon: <ArrowRight className="h-4 w-4" />, 
    bg: 'bg-violet-100', 
    text: 'text-violet-600' 
  },
  checkout_complete: { 
    icon: <CheckCircle className="h-4 w-4" />, 
    bg: 'bg-teal-100', 
    text: 'text-teal-600' 
  },
  refund: { 
    icon: <CreditCard className="h-4 w-4" />, 
    bg: 'bg-red-100', 
    text: 'text-red-600' 
  },
  review: { 
    icon: <Star className="h-4 w-4" />, 
    bg: 'bg-yellow-100', 
    text: 'text-yellow-600' 
  },
}

export function EventFeed() {
  const { events, clearEvents } = useStore()

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-500" />
          <h3 className="font-semibold text-slate-800">Live Events</h3>
        </div>
        <button
          onClick={clearEvents}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
        >
          Clear
        </button>
      </div>

      <div className="h-[400px] overflow-y-auto">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Sparkles className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-sm">Waiting for events...</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {events.map((event) => {
              const config = eventConfig[event.type] || eventConfig.page_view
              
              return (
                <div
                  key={event.id}
                  className="p-4 hover:bg-slate-50 transition-colors event-enter"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={cn('p-2 rounded-xl', config.bg, config.text)}>
                      {config.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-slate-800 capitalize">
                          {event.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400">
                          {timeAgo(event.timestamp)}
                        </span>
                      </div>

                      {/* Event details */}
                      <div className="text-sm text-slate-500 mt-1">
                        {event.type === 'order' && (
                          <span className="text-emerald-600 font-medium">
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
                          <span className="text-red-500">
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
                          <span className="text-teal-600 font-medium">
                            {formatCurrency(event.data.total)} • {event.data.payment_method}
                          </span>
                        )}
                      </div>

                      {/* Region */}
                      {event.data.region_name && (
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <span>📍</span>
                          <span>{event.data.region_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

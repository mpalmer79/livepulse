import { create } from 'zustand'

export interface Event {
  id: string
  type: string
  source: string
  data: Record<string, any>
  severity: 'info' | 'warning' | 'error' | 'critical'
  scenario: string
  timestamp: string
}

export interface Metrics {
  scenario: string
  period_seconds: number
  events_per_second: number
  total_events: number
  error_rate: number
  revenue_total: number
  revenue_per_minute: number
  average_order_value: number
  orders_total: number
  orders_per_minute: number
  orders_pending: number
  orders_completed: number
  orders_refunded: number
  cart_additions: number
  cart_abandonment_rate: number
  page_views: number
  unique_visitors: number
  conversion_rate: number
  top_products: Array<{ name: string; units: number; revenue: number }>
  timestamp: string
}

export interface Alert {
  id: string
  name: string
  message: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  timestamp: string
  acknowledged: boolean
}

export interface SandboxState {
  scenario: string
  speed: number
  is_running: boolean
  chaos_enabled: boolean
  events_generated: number
  uptime_seconds: number
  available_scenarios: string[]
}

interface Store {
  // Connection
  isConnected: boolean
  socket: WebSocket | null
  
  // Data
  events: Event[]
  metrics: Metrics | null
  metricsHistory: Metrics[]
  alerts: Alert[]
  sandboxState: SandboxState | null
  
  // Actions
  connect: (url: string) => void
  disconnect: () => void
  setSpeed: (speed: number) => void
  injectEvent: (eventType: string, count?: number) => void
  toggleChaos: () => void
  pauseSimulation: () => void
  resumeSimulation: () => void
  resetSimulation: () => void
  clearEvents: () => void
  acknowledgeAlert: (id: string) => void
}

export const useStore = create<Store>((set, get) => ({
  isConnected: false,
  socket: null,
  events: [],
  metrics: null,
  metricsHistory: [],
  alerts: [],
  sandboxState: null,

  connect: (url: string) => {
    const existingSocket = get().socket
    if (existingSocket) {
      existingSocket.close()
    }

    const socket = new WebSocket(url)

    socket.onopen = () => {
      set({ isConnected: true, socket })
      socket.send(JSON.stringify({ type: 'get_state', payload: {} }))
    }

    socket.onclose = () => {
      set({ isConnected: false, socket: null })
      // Auto reconnect after 3s
      setTimeout(() => {
        if (!get().isConnected) {
          get().connect(url)
        }
      }, 3000)
    }

    socket.onerror = (err) => {
      console.error('WebSocket error:', err)
    }

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        const { type, payload } = msg

        switch (type) {
          case 'event':
            set((s) => ({
              events: [payload, ...s.events].slice(0, 100)
            }))
            break

          case 'metrics':
            const m = { ...payload, timestamp: new Date().toISOString() }
            set((s) => ({
              metrics: m,
              metricsHistory: [...s.metricsHistory, m].slice(-60)
            }))
            break

          case 'alert':
            set((s) => ({
              alerts: [payload, ...s.alerts].slice(0, 50)
            }))
            break

          case 'state':
            if (payload.scenario) {
              set({ sandboxState: payload })
            }
            break
        }
      } catch (e) {
        console.error('Parse error:', e)
      }
    }

    set({ socket })
  },

  disconnect: () => {
    const { socket } = get()
    if (socket) socket.close()
    set({ socket: null, isConnected: false })
  },

  setSpeed: (speed: number) => {
    const { socket, isConnected } = get()
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'control',
        payload: { action: 'set_speed', payload: { speed } }
      }))
    }
  },

  injectEvent: (eventType: string, count = 1) => {
    const { socket, isConnected } = get()
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'control',
        payload: { action: 'inject_event', payload: { event_type: eventType, count } }
      }))
    }
  },

  toggleChaos: () => {
    const { socket, isConnected, sandboxState } = get()
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'control',
        payload: { action: 'toggle_chaos', payload: { enabled: !sandboxState?.chaos_enabled } }
      }))
    }
  },

  pauseSimulation: () => {
    const { socket, isConnected } = get()
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'control',
        payload: { action: 'pause', payload: {} }
      }))
    }
  },

  resumeSimulation: () => {
    const { socket, isConnected } = get()
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'control',
        payload: { action: 'resume', payload: {} }
      }))
    }
  },

  resetSimulation: () => {
    const { socket, isConnected } = get()
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'control',
        payload: { action: 'reset', payload: {} }
      }))
    }
    set({ events: [], metricsHistory: [], alerts: [] })
  },

  clearEvents: () => set({ events: [] }),

  acknowledgeAlert: (id: string) => {
    set((s) => ({
      alerts: s.alerts.map((a) =>
        a.id === id ? { ...a, acknowledged: true } : a
      )
    }))
  },
}))

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K'
  return value.toFixed(0)
}

export function formatPercent(value: number): string {
  return (value * 100).toFixed(1) + '%'
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
}

export function timeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  return `${Math.floor(seconds / 3600)}h ago`
}

export function getEventColor(type: string): string {
  const colors: Record<string, string> = {
    order: 'bg-green-500',
    cart_add: 'bg-blue-500',
    cart_remove: 'bg-orange-500',
    page_view: 'bg-slate-500',
    checkout_start: 'bg-purple-500',
    checkout_complete: 'bg-emerald-500',
    refund: 'bg-red-500',
    review: 'bg-yellow-500',
  }
  return colors[type] || 'bg-slate-500'
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    info: 'text-blue-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
    critical: 'text-red-600',
  }
  return colors[severity] || 'text-slate-400'
}

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LivePulse | Real-time E-Commerce Analytics',
  description: 'A real-time analytics sandbox demonstrating WebSocket data streaming, interactive visualizations, and modern dashboard design patterns.',
  keywords: ['analytics', 'dashboard', 'real-time', 'e-commerce', 'websocket', 'react', 'next.js'],
  authors: [{ name: 'Michael Palmer', url: 'https://github.com/mpalmer79' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}

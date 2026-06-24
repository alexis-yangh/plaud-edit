import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Plaud Edit',
  description: 'AI-powered copy generation and audit for Plaud',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 min-h-screen">{children}</body>
    </html>
  )
}

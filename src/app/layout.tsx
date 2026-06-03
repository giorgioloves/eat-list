import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Eat List — Your Shared Restaurant Tracker',
  description: 'Track, rate, and discover restaurants with your partner.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-AU" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-espresso-900 text-espresso-50 min-h-[100dvh]`}>
        {children}
      </body>
    </html>
  )
}

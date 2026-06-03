import type { Metadata } from 'next'
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-espresso-900 text-espresso-50 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}

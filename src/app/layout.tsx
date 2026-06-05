import type { Metadata, Viewport } from 'next'
import { Crimson_Pro, DM_Mono } from 'next/font/google'
import './globals.css'

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style:  ['normal', 'italic'],
  variable: '--font-crimson',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-dm-mono',
})

export const metadata: Metadata = {
  title: 'avec',
  description: 'Your personal restaurant list.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-AU"
      className={`${crimsonPro.variable} ${dmMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased bg-parchment text-espresso min-h-[100dvh]">
        {children}
      </body>
    </html>
  )
}

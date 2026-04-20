import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { getFaviconMetadata } from '@/lib/site-icons'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FAMM',
  description: 'Product design collective working across industrial and creative fields.',
  icons: getFaviconMetadata(),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}


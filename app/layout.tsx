import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FAMM Design Studio | Industrial Design Milano | F-a-m-m',
  description: 'FAMM is a product design collective and industrial design studio based in Milan. We work across industrial and creative fields, combining problem-solving design with future-focused exploration.',
  keywords: 'FAMM, f-a-m-m, Famm Design, Famm design studio, industrial design studio, design studio milan, Design Industriale milano, Famm',
  authors: [{ name: 'FAMM Design Studio' }],
  creator: 'FAMM Design Studio',
  publisher: 'FAMM Design Studio',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://f-a-m-m.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'FAMM Design Studio | Industrial Design Milano',
    description: 'A product design collective working across industrial and creative fields in Milan.',
    type: 'website',
    locale: 'en_US',
    siteName: 'FAMM Design Studio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAMM Design Studio | Industrial Design Milano',
    description: 'A product design collective working across industrial and creative fields in Milan.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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


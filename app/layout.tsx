import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FAMM',
  description: 'FAMM, product design collective founded in 2024 working across industrial design and creative fields. Based in Milan, founded by Matteo Bulla, Matteo Corradini, Federico Fanucchi & Andrea Mastroianni.',
  keywords: 'FAMM, f-a-m-m, Famm Design, Famm design studio, industrial design studio, design studio milan, Design Industriale milano, Famm, Matteo Bulla, Matteo Corradini, Federico Fanucchi, Andrea Mastroianni',
  authors: [{ name: 'FAMM Design Studio' }],
  creator: 'FAMM Design Studio',
  publisher: 'FAMM Design Studio',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://f-a-m-m.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'FAMM',
    description: 'FAMM, product design collective founded in 2024 working across industrial design and creative fields. Based in Milan, founded by Matteo Bulla, Matteo Corradini, Federico Fanucchi & Andrea Mastroianni.',
    type: 'website',
    locale: 'en_US',
    siteName: 'FAMM',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAMM',
    description: 'FAMM, product design collective founded in 2024 working across industrial design and creative fields. Based in Milan, founded by Matteo Bulla, Matteo Corradini, Federico Fanucchi & Andrea Mastroianni.',
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


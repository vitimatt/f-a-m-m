import fs from 'fs'
import path from 'path'
import type { Metadata } from 'next'

const faviconDir = path.join(process.cwd(), 'public', 'favicon')

/** Drop assets in public/favicon/: favicon.ico, favicon-famm.png, icon.png, icon.svg, apple-touch-icon.png */
export function getFaviconMetadata(): Metadata['icons'] {
  const icon: { url: string; sizes?: string; type?: string }[] = []

  if (fs.existsSync(path.join(faviconDir, 'favicon.ico'))) {
    icon.push({ url: '/favicon/favicon.ico', sizes: '48x48' })
  }
  if (fs.existsSync(path.join(faviconDir, 'favicon-famm.png'))) {
    icon.push({ url: '/favicon/favicon-famm.png', type: 'image/png', sizes: '32x32' })
  }
  if (fs.existsSync(path.join(faviconDir, 'icon.png'))) {
    icon.push({ url: '/favicon/icon.png', type: 'image/png', sizes: '32x32' })
  }
  if (fs.existsSync(path.join(faviconDir, 'icon.svg'))) {
    icon.push({ url: '/favicon/icon.svg', type: 'image/svg+xml' })
  }

  if (icon.length === 0) {
    icon.push({ url: '/favicon/icon.svg', type: 'image/svg+xml' })
  }

  const out: Metadata['icons'] = { icon }

  if (fs.existsSync(path.join(faviconDir, 'apple-touch-icon.png'))) {
    out.apple = [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ]
  }

  return out
}

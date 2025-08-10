import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Gaish Elmafdein',
  description: 'Orthodox Digital Cathedral',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
}

export const viewport = {
  themeColor: '#243b53'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}

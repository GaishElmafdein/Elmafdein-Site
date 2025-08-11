import type { ReactNode } from 'react';

import './globals.css';

import { metadata, viewport } from './layout.constants';
export { metadata, viewport };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}

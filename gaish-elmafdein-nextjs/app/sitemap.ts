// app/sitemap.ts
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const pages = [
    '/', '/ar', '/en',
    '/ar/library', '/en/library',
    // Add more static pages here as they are introduced
  ]
  const now = new Date().toISOString()
  return pages.map((p) => ({
    url: new URL(p, base).toString(),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: p.endsWith('/library') ? 0.8 : 0.7,
  }))
}

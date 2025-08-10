/**
 * Sacred Middleware - Locale Routing and Authentication
 * Handles automatic locale detection and routing for Arabic/English support
 */

import { NextRequest, NextResponse } from 'next/server'

// Supported locales (Arabic is now the primary default)
const locales = ['en', 'ar']
const defaultLocale = 'ar'

/**
 * Get locale from pathname
 */
function getLocale(pathname: string): string | undefined {
  const segments = pathname.split('/')
  const locale = segments[1]
  return locales.includes(locale) ? locale : undefined
}

/**
 * Detect preferred locale from Accept-Language header
 */
function getPreferredLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language') || ''
  
  // Check for Arabic language preference
  if (acceptLanguage.includes('ar') || 
      acceptLanguage.includes('Arabic') ||
      acceptLanguage.includes('egypt') ||
      acceptLanguage.includes('eg')) {
    return 'ar'
  }
  
  return defaultLocale
}

/**
 * Sacred Middleware Function
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }
  
  // Check if pathname already has a locale
  const locale = getLocale(pathname)
  
  if (!locale) {
    // No locale in pathname, redirect to preferred locale
    const preferredLocale = getPreferredLocale(request)
    const newUrl = new URL(`/${preferredLocale}${pathname}`, request.url)
    return NextResponse.redirect(newUrl)
  }
  
  // Locale is present and valid, continue
  return NextResponse.next()
}

/**
 * Middleware Configuration
 * Apply middleware to all routes except static files and API routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}

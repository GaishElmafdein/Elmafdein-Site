// Supabase client (browser) and server helpers
// Env vars required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
import { cookies } from 'next/headers'

import { type CookieOptions,createBrowserClient, createServerClient } from '@supabase/ssr'

export const getSupabaseBrowser = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  if (!url || !key) throw new Error('Missing Supabase env vars')
  return createBrowserClient(url, key)
}

export const getSupabaseServer = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cookieStore: any = await cookies() // adapt to environment (sync or promise)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  if (!url || !key) throw new Error('Missing Supabase env vars')
  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore?.get?.(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore?.set?.({ name, value, ...options })
        } catch (err) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[supabase cookies] set failed', err)
          }
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore?.set?.({ name, value: '', ...options })
        } catch (err) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[supabase cookies] remove failed', err)
          }
        }
      }
    }
  })
}

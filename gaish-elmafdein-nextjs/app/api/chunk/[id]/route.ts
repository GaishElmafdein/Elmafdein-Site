import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL / SUPABASE keys)')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function GET(req: NextRequest) {
  const segments = req.nextUrl.pathname.split('/')
  const idParam = segments[segments.length - 1] || ''
  if (!/^\d+$/.test(idParam)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  }
  const id = Number(idParam)

  let supa
  try { supa = getClient() } catch { return NextResponse.json({ error: 'server misconfigured' }, { status: 500 }) }

  const { data, error } = await supa
    .from('book_chunks')
    .select('id, content, source_title, locator, url, book_id, lang')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const res = NextResponse.json({ chunk: data })
  res.headers.set('Cache-Control', 'no-store')
  return res
}

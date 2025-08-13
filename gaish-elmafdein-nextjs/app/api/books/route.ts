import { NextRequest, NextResponse } from 'next/server'

import { fetchBooksFromSupabase } from '@/lib/booksRepo'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || undefined
  const books = await fetchBooksFromSupabase(q)
  return NextResponse.json({ items: books })
}

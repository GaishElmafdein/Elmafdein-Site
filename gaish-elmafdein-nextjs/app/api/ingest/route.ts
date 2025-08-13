import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'
import mammoth from 'mammoth'
import OpenAI from 'openai'

// NOTE: This route uses the service role key. Protect via auth/secret header in production.

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars missing for ingest route')
  return createClient(url, key, { auth: { persistSession: false } })
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export const maxDuration = 60
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

interface Body {
  storagePath?: string
  publicUrl?: string
  book: {
    id?: string
    title: string
    author?: string | null
    source_url?: string | null
    lang?: 'ar' | 'en' | 'ar-eg' | null
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 })
    }
    const body = (await req.json()) as Body
    if (!body?.book?.title || !(body.storagePath || body.publicUrl)) {
      return NextResponse.json({ error: 'missing params' }, { status: 400 })
    }
    const adminToken = process.env.INGEST_ADMIN_TOKEN
    if (adminToken && req.headers.get('x-admin-token') !== adminToken) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const fileBuf = await fetchFile(body)
    const { text, pages } = await extractText(fileBuf, body.storagePath || body.publicUrl!)
    if (!text.trim()) return NextResponse.json({ error: 'empty file text' }, { status: 400 })

    const detected = body.book.lang ?? detectLang(text)
    const lang: 'ar' | 'en' = detected === 'ar-eg' ? 'ar' : detected

    let bookId = body.book.id || null
    if (!bookId) {
  const supa = getClient()
  const { data: inserted, error } = await supa
        .from('books')
        .insert({ title: body.book.title, author: body.book.author, source: body.book.source_url, lang, download_url: body.publicUrl ?? null })
        .select('id')
        .single()
      if (error) throw error
      bookId = inserted.id
    }

    const chunks = chunkByPages(pages, { chunkChars: 800, overlap: 120, title: body.book.title, author: body.book.author ?? null, url: body.publicUrl ?? null, lang })
    if (!chunks.length) return NextResponse.json({ error: 'no chunks generated' }, { status: 400 })

    const embeddings = await embedBatch(chunks.map(c => c.content))
    const rows = chunks.map((c, i) => ({
      book_id: bookId,
      chunk_index: i,
      content: c.content,
      embedding: embeddings[i] as unknown as number[],
      lang,
      source_title: body.book.title,
      locator: c.locator,
      url: c.url,
    }))

    const batchSize = 100
    const supa = getClient()
    for (let i = 0; i < rows.length; i += batchSize) {
      const slice = rows.slice(i, i + batchSize)
      const { error } = await supa.from('book_chunks').insert(slice)
      if (error) throw error
    }

    return NextResponse.json({ ok: true, book_id: bookId, inserted_chunks: rows.length, lang, pages: pages.length })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'ingest failed'
    console.error('[ingest error]', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

async function fetchFile(body: Body): Promise<Buffer> {
  if (body.storagePath) {
  const supa = getClient()
  const { data, error } = await supa.storage.from('books').download(body.storagePath)
    if (error || !data) throw error || new Error('download failed')
    return Buffer.from(await data.arrayBuffer())
  }
  const r = await fetch(body.publicUrl!)
  if (!r.ok) throw new Error('fetch publicUrl failed')
  return Buffer.from(await r.arrayBuffer())
}

interface PageText { page: number; text: string }

async function extractText(buf: Buffer, pathOrUrl: string) {
  if (/\.(pdf)$/i.test(pathOrUrl)) {
  const pdfModule = await import('pdf-parse')
  const res = await pdfModule.default(buf, { pagerender: defaultPageRenderer })
    const rawPages = res.text.split('\f')
    const pages: PageText[] = rawPages.map((t, i) => ({ page: i + 1, text: t }))
    return { text: res.text, pages }
  }
  if (/\.(docx?)$/i.test(pathOrUrl)) {
    const { value } = await mammoth.extractRawText({ buffer: buf })
    return { text: value, pages: [{ page: 1, text: value }] }
  }
  const text = buf.toString('utf8')
  return { text, pages: [{ page: 1, text }] }
}

// pdf-parse page renderer (typed loosely without relying on internal types)
function defaultPageRenderer(pageData: unknown) {
  if (
    pageData &&
    typeof pageData === 'object' &&
    'getTextContent' in pageData &&
    typeof (pageData as { getTextContent?: unknown }).getTextContent === 'function'
  ) {
    type TextItem = { str: string }
    type TextContent = { items: TextItem[] }
    const getTextContent = (pageData as { getTextContent: () => Promise<TextContent> }).getTextContent
    return getTextContent().then(tc => tc.items.map(i => i.str).join(' '))
  }
  return ''
}

function detectLang(s: string): 'ar' | 'en' | 'ar-eg' {
  const sample = s.slice(0, 4000)
  const arabicChars = sample.match(/[\u0600-\u06FF]/g)?.length ?? 0
  const ratio = arabicChars / Math.max(1, sample.length)
  if (ratio > 0.05) {
    const dialectHits = /(مش |عايز|ليه |اللي |بتاع|ايه )/i.test(sample)
    if (dialectHits) return 'ar-eg'
    return 'ar'
  }
  return 'en'
}

interface ChunkInputOpts { chunkChars: number; overlap: number; title: string; author: string | null; url: string | null; lang: string }
interface ChunkRecord { content: string; locator: string; page: number; url: string | null }

function chunkByPages(pages: PageText[], opts: ChunkInputOpts): ChunkRecord[] {
  const out: ChunkRecord[] = []
  const { chunkChars, overlap } = opts
  for (const pg of pages) {
    const clean = pg.text.replace(/\s+/g, ' ').trim()
    if (!clean) continue
    let start = 0
    let localIndex = 0
    while (start < clean.length) {
      const end = Math.min(clean.length, start + chunkChars)
      const slice = clean.slice(start, end)
      out.push({ content: slice, locator: `p${pg.page}:c${localIndex}`, page: pg.page, url: opts.url })
      if (end === clean.length) break
      start += chunkChars - overlap
      localIndex++
    }
  }
  return out
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const batches: number[][] = []
  const maxBatch = 80
  for (let i = 0; i < texts.length; i += maxBatch) {
    const slice = texts.slice(i, i + maxBatch)
    const resp = await openai.embeddings.create({ model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small', input: slice })
    resp.data.forEach(d => batches.push(d.embedding as unknown as number[]))
  }
  return batches
}

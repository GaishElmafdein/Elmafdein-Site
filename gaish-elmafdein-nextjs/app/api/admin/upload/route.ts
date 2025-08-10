import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import mammoth from 'mammoth'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const maxDuration = 120

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars missing for upload route')
  return createClient(url, key, { auth: { persistSession: false } })
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const title = form.get('title') as string | null
    if (!file || !title) return NextResponse.json({ error: 'missing file or title' }, { status: 400 })
    const author = (form.get('author') as string) || null
    const lang = (form.get('lang') as string) || 'ar'
    const source = (form.get('source') as string) || null

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['pdf','docx'].includes(ext||'')) return NextResponse.json({ error: 'unsupported type' }, { status: 400 })

    const path = `${crypto.randomUUID()}.${ext}`
  const supa = getClient()
  const { error: uploadErr } = await supa.storage.from('books').upload(path, file)
    if (uploadErr) throw uploadErr
    const { data: pub } = supa.storage.from('books').getPublicUrl(path)

    const { data: book, error: bookErr } = await supa.from('books').insert({ title, author, lang, source, download_url: pub.publicUrl }).select().single()
    if (bookErr) throw bookErr

    const buf = Buffer.from(await file.arrayBuffer())
    let text = ''
    if (ext === 'pdf') {
  const pdfModule = await import('pdf-parse')
  const parsed = await pdfModule.default(buf)
      text = parsed.text
    } else if (ext === 'docx') {
      const { value } = await mammoth.extractRawText({ buffer: buf })
      text = value
    }
    text = text.replace(/\s+/g, ' ').trim()
    if (!text) return NextResponse.json({ error: 'empty text' }, { status: 400 })

    const chunks = chunkText(text, 800, 120)
    const embeddings: number[][] = []
    const maxBatch = 80
    for (let i=0;i<chunks.length;i+=maxBatch) {
      const slice = chunks.slice(i,i+maxBatch)
      const resp = await openai.embeddings.create({ model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small', input: slice })
      resp.data.forEach(d=>embeddings.push(d.embedding as unknown as number[]))
    }
    const rows = chunks.map((c,i)=>({ book_id: book.id, chunk_index: i, content: c, embedding: embeddings[i], lang, source }))
    for (let i=0;i<rows.length;i+=100) {
      const slice = rows.slice(i,i+100)
      const { error } = await supa.from('book_chunks').insert(slice)
      if (error) throw error
    }
    return NextResponse.json({ ok: true, book_id: book.id, chunks: rows.length })
  } catch (e: unknown) {
    console.error('[admin upload]', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : 'upload failed' }, { status: 500 })
  }
}

function chunkText(text: string, size = 800, overlap = 120) {
  const out: string[] = []
  let i = 0
  while (i < text.length) {
    const end = Math.min(text.length, i + size)
    out.push(text.slice(i, end))
    if (end === text.length) break
    i += size - overlap
  }
  return out
}

// RAG ingestion script (node -r ts-node/register scripts/ingest.ts <pdfPath>)
// Outline only; implement parsing + chunking + embedding upsert
import fs from 'fs'
import path from 'path'
import pdfParse from 'pdf-parse'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const CHUNK_SIZE = 1000
const CHUNK_OVERLAP = 120

function chunkText(text: string): string[] {
  const chunks: string[] = []
  let start = 0
  while (start < text.length) {
    const end = Math.min(text.length, start + CHUNK_SIZE)
    chunks.push(text.slice(start, end))
    start += CHUNK_SIZE - CHUNK_OVERLAP
  }
  return chunks
}

async function embed(openai: OpenAI, input: string[]): Promise<number[][]> {
  const resp = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input
  })
  return resp.data.map(d => d.embedding)
}

function deriveLang(text: string): 'ar' | 'en' {
  const sample = text.slice(0, 800)
  const arabicRatio = (sample.match(/[ء-ي]/g)?.length || 0) / Math.max(1, sample.length)
  return arabicRatio > 0.05 ? 'ar' : 'en'
}

function buildLocator(index: number): string {
  return `chunk:${index}`
}

async function main() {
  const pdfPath = process.argv[2]
  if (!pdfPath) throw new Error('Usage: ingest <pdfPath> [title] [author] [lang]')
  const customTitle = process.argv[3]
  const customAuthor = process.argv[4]
  const customLang = process.argv[5] as 'ar' | 'en' | undefined
  const raw = fs.readFileSync(pdfPath)
  const parsed = await pdfParse(raw)
  const text = parsed.text.replace(/\s+/g, ' ').trim()
  const chunks = chunkText(text)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const supabase = createClient(supabaseUrl, service, { auth: { persistSession: false } })

  const lang = customLang || deriveLang(text)
  const title = customTitle || path.basename(pdfPath, path.extname(pdfPath))
  const author = customAuthor || null
  const sourceUrl = null

  // Create book row
  const { data: bookRow, error: bookErr } = await supabase.from('books').insert({ title, author, lang, source: sourceUrl }).select('id').single()
  if (bookErr) throw bookErr
  const bookId = bookRow.id

  const embeddings = await embed(openai, chunks)
  for (let i = 0; i < chunks.length; i++) {
    const { error } = await supabase.from('book_chunks').insert({
      book_id: bookId,
      chunk_index: i,
      content: chunks[i],
      embedding: embeddings[i],
      lang,
      source_title: title,
      locator: buildLocator(i),
      url: sourceUrl
    })
    if (error) {
      console.error('Insert error', error.message)
      if (error.message.includes('violates')) break
    }
  }
  console.log('Ingestion complete:', { chunks: chunks.length, bookId, title, lang })
}

main().catch(e => { console.error(e); process.exit(1) })

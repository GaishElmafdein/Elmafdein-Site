import { createBrowserClient } from '@supabase/ssr'
import mammoth from 'mammoth'
import OpenAI from 'openai'
import pdfParse from 'pdf-parse'

import { chunkText } from './chunk'


export interface UploadIngestOptions { title: string; author?: string; lang?: string; source?: string }

export async function handleUpload(file: File, opts: UploadIngestOptions) {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const ext = file.name.split('.').pop()?.toLowerCase()
  const bucket = 'books'
  const path = `${crypto.randomUUID()}.${ext}`
  const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, file)
  if (uploadErr) throw uploadErr
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path)
  const { data: book, error: bookErr } = await supabase.from('books').insert({ title: opts.title, author: opts.author, lang: opts.lang, source: opts.source, download_url: pub.publicUrl }).select().single()
  if (bookErr) throw bookErr
  let text = ''
  if (ext === 'pdf') {
    const buf = await file.arrayBuffer()
    const parsed = await pdfParse(Buffer.from(buf))
    text = parsed.text
  } else if (ext === 'docx') {
    const buf = await file.arrayBuffer()
    const { value } = await mammoth.extractRawText({ buffer: Buffer.from(buf) })
    text = value
  } else {
    throw new Error('Unsupported file type')
  }
  text = text.replace(/\s+/g, ' ').trim()
  const chunks = chunkText(text)
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const embeddingsResp = await openai.embeddings.create({ model: 'text-embedding-3-small', input: chunks })
  const rows = embeddingsResp.data.map((d,i) => ({ book_id: book.id, chunk_index: i, content: chunks[i], embedding: d.embedding, lang: opts.lang, source: opts.source }))
  type Row = { book_id: string; chunk_index: number; content: string; embedding: number[]; lang?: string; source?: string }
  for (let i=0;i<rows.length;i+=100) {
    const slice: Row[] = rows.slice(i, i+100) as Row[]
    const { error } = await supabase.from('book_chunks').insert(slice)
    if (error) throw error
  }
  return { bookId: book.id, chunks: rows.length }
}

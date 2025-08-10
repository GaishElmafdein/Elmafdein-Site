/* RAG core utilities */
import OpenAI from 'openai'
import { getSupabaseServer } from './supabaseClient'
import { SYSTEM_PROMPT, ANSWER_COMPOSER_TEMPLATE, ABUSE_REGEX, EMPTY_INSUFFICIENT, StructuredAnswer } from './ragPrompts'

export interface RetrievedChunk {
  id: number
  content: string
  similarity: number
  text_rank?: number
  hybrid_score?: number
  source_title?: string | null
  lang?: string | null
  locator?: string | null
  url?: string | null
  book_id?: string | null
  source?: string | null // backward compat
}

export interface AskResult {
  answer_markdown: string
  language: string
  sources: { id: number | string; title: string; author: string | null; locator: string | null; url: string | null; similarity: number }[]
  confidence: number
  insufficient_evidence: boolean
  follow_up: string[]
  raw_model: string
  tookMs: number
}

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small'
const GENERATION_MODEL = process.env.GPT_MODEL || 'gpt-4o-mini'

export async function generateEmbedding(question: string): Promise<number[]> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const e = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: question })
  return e.data[0].embedding as unknown as number[]
}

interface VectorSearchOptions { lang?: string; limit?: number }

export async function hybridSearch(query: string, queryEmbedding: number[], opts: VectorSearchOptions = {}): Promise<RetrievedChunk[]> {
  const supabase = await getSupabaseServer()
  const limit = opts.limit ?? 5
  // expects an RPC function 'match_book_chunks'
  const sql = supabase.rpc('match_book_chunks', {
    query_embedding: queryEmbedding,
    match_count: limit,
    query_text: query
  })
  if (opts.lang) {
    const { data, error } = await sql
    if (error) throw error
    type Raw = RetrievedChunk
    return (data as Raw[]).filter(r => !opts.lang || r.lang === opts.lang)
  }
  const { data, error } = await sql
  if (error) throw error
  return data as RetrievedChunk[]
}

function buildContextsForTemplate(chunks: RetrievedChunk[]) {
  // Expand minimal chunk metadata for structured referencing (faking title/locator if not present)
  return chunks.map((c, idx) => ({
    id: c.id,
    index: idx + 1,
    content: c.content,
    title: c.source_title || c.source || 'غير معروف',
    author: null,
    locator: c.locator || null,
    url: c.url || null,
    similarity: c.similarity
  }))
}

export async function synthesizeStructured(question: string, lang: string, chunks: RetrievedChunk[]): Promise<StructuredAnswer> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const contextsObj = buildContextsForTemplate(chunks)
  const contextsJson = JSON.stringify(contextsObj, null, 2)
  const prompt = ANSWER_COMPOSER_TEMPLATE
    .replace('{question}', question)
    .replace('{lang}', lang)
    .replace('{contexts_json}', contextsJson)

  const response = await openai.chat.completions.create({
    model: GENERATION_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2,
    max_tokens: 900
  })
  const content = response.choices[0].message.content?.trim() || ''
  // Try parse JSON; if failure => fallback simple answer.
  try {
    const parsed: StructuredAnswer = JSON.parse(content)
    return parsed
  } catch {
    return {
      ...EMPTY_INSUFFICIENT,
      answer_markdown: 'تعذر تحليل الإجابة (JSON parsing failed).',
      language: lang,
    }
  }
}

export async function askQuestion(question: string, lang: string): Promise<AskResult> {
  const started = Date.now()
  const q = question.trim()
  if (!q) {
    return { ...EMPTY_INSUFFICIENT, language: lang, raw_model: GENERATION_MODEL, tookMs: 0 } as AskResult
  }
  if (ABUSE_REGEX.test(q)) {
    return {
      answer_markdown: 'نُعيد صياغة السؤال بروح هادئة: يرجى طرح موضوع عقائدي أو كتابي محدد لنخدمك بمحبة.',
      language: lang,
      sources: [],
      confidence: 0,
      insufficient_evidence: true,
      follow_up: ['يمكنك سؤال: ما معنى التجسد؟', 'اسأل عن تفسير آية محددة.'],
      raw_model: GENERATION_MODEL,
      tookMs: 0
    }
  }
  const embedding = await generateEmbedding(q)
  const chunks = await hybridSearch(q, embedding, { lang, limit: 6 })
  if (!chunks.length) {
    return { ...EMPTY_INSUFFICIENT, language: lang, raw_model: GENERATION_MODEL, tookMs: Date.now() - started } as AskResult
  }
  const structured = await synthesizeStructured(q, lang, chunks)
  // Compute a naive confidence from similarities
  const avgSim = chunks.reduce((s, c) => s + c.similarity, 0) / chunks.length
  const confidence = Math.min(0.99, Math.max(0.1, avgSim))
  return {
    answer_markdown: structured.answer_markdown || '—',
    language: structured.language || lang,
  sources: structured.sources && structured.sources.length ? structured.sources : chunks.map(c => ({ id: c.id, title: c.source_title || c.source || 'غير معروف', author: null, locator: c.locator || null, url: c.url || null, similarity: c.similarity })),
    confidence,
    insufficient_evidence: structured.insufficient_evidence || !chunks.length,
    follow_up: structured.follow_up && structured.follow_up.length ? structured.follow_up : ['هل تحتاج شرح نقطة معينة؟'],
    raw_model: GENERATION_MODEL,
    tookMs: Date.now() - started
  }
}

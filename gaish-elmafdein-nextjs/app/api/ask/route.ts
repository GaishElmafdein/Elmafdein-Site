import { NextRequest, NextResponse } from 'next/server'

import { cacheGet, cacheKey,cacheSet } from '@/lib/cache'
import { askQuestion } from '@/lib/rag'
import { rateLimit } from '@/lib/rateLimit'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const question: string = body.question?.toString().trim()
    const lang: string = (body.lang || 'ar').toString()
    if (!question) {
      return NextResponse.json({ error: 'Missing question' }, { status: 400 })
    }
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 })
    }
    // Rate limit (per IP + lang)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
    const rl = rateLimit(`ask:${ip}`, 8, 60_000)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded', retry_after: rl.reset }, { status: 429 })
    }
    // Cache lookup
    const key = cacheKey(['ask', lang, question.toLowerCase()])
  // Use AskResult shape (imported indirectly via askQuestion return)
  const cached = cacheGet<ReturnType<typeof askQuestion> extends Promise<infer R> ? R : never>(key)
    if (cached) {
      return NextResponse.json({ ...cached, cached: true })
    }
    const result = await askQuestion(question, lang)
    cacheSet(key, result, 5 * 60_000) // 5 min TTL
    return NextResponse.json(result)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    console.error('ask route error', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

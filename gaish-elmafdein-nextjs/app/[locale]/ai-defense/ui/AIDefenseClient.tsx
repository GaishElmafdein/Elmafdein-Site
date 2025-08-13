"use client"
import React, { useState } from 'react'

import ReactMarkdown from 'react-markdown'

interface Props { locale: string }

interface SourceItem { id: number | string; title: string; author: string | null; locator: string | null; url: string | null; similarity: number }
interface AskResponse {
  answer_markdown: string
  language: string
  sources: SourceItem[]
  confidence: number
  insufficient_evidence: boolean
  follow_up: string[]
  raw_model: string
  tookMs: number
}

export default function AIDefenseClient({ locale }: Props) {
  const isArabic = locale === 'ar'
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<{ q: string; a: AskResponse }[]>([])
  const [openChunk, setOpenChunk] = useState<null | { id: number | string; title?: string | null; content?: string; locator?: string | null; url?: string | null; lang?: string | null }>(null)
  const [sourceLoading, setSourceLoading] = useState(false)
  const [sourceError, setSourceError] = useState<string | null>(null)

  async function showSource(id: number | string, fallbackTitle?: string | null) {
    setSourceError(null)
    setSourceLoading(true)
    try {
  if (typeof id !== 'number') return // only numeric chunks stored
  const res = await fetch(`/api/chunk/${id}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(isArabic ? 'لم يتم العثور على المصدر' : 'Source not found')
      const { chunk } = await res.json()
      setOpenChunk({
        id,
        title: chunk?.source_title ?? fallbackTitle ?? (isArabic ? 'مصدر' : 'Source'),
        content: chunk?.content ?? '',
        locator: chunk?.locator ?? null,
        url: chunk?.url ?? null,
        lang: chunk?.lang ?? null
      })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : (isArabic ? 'تعذّر جلب المصدر' : 'Failed to load source')
      setSourceError(msg)
    } finally {
      setSourceLoading(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, lang: isArabic ? 'ar' : 'en' })
      })
      if (!res.ok) throw new Error(await res.text())
      const data: AskResponse = await res.json()
      setHistory(h => [{ q: question, a: data }, ...h])
      setQuestion('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-sacred-gold to-sacred-amber bg-clip-text text-transparent">
        {isArabic ? 'الدفاع الذكي' : 'AI Defense'}
      </h1>
      <form onSubmit={submit} className="flex gap-3" dir={isArabic ? 'rtl' : 'ltr'}>
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder={isArabic ? 'اكتب سؤالك اللاهوتي...' : 'Ask a theological question...'}
          className="flex-1 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-sacred-gold"
        />
        <button disabled={loading} className="px-5 py-2 rounded-xl bg-sacred-gradient text-slate-900 font-semibold shadow-sacred disabled:opacity-50">
          {loading ? (isArabic ? 'جارٍ...' : '...') : (isArabic ? 'اسأل' : 'Ask')}
        </button>
      </form>
      {error && <div className="text-red-400 text-sm">{error}</div>}
      <div className="space-y-5">
        {history.map((item, idx) => (
          <div key={idx} className="p-5 rounded-2xl border border-sacred-gold/20 bg-white/5 space-y-4">
            <div className="text-sm text-sacred-gold font-semibold" dir={isArabic ? 'rtl' : 'ltr'}>
              {isArabic ? 'سؤال:' : 'Question:'} {item.q}
            </div>
            <div className="prose prose-invert max-w-none text-sm" dir={isArabic ? 'rtl' : 'ltr'}>
              <ReactMarkdown>{item.a.answer_markdown}</ReactMarkdown>
            </div>
            <div className="flex flex-col gap-2" dir={isArabic ? 'rtl' : 'ltr'}>
              {!!item.a.sources.length && (
                <div className="mt-2 w-full" dir={isArabic ? 'rtl' : 'ltr'}>
                  <h4 className="text-xs font-semibold text-sacred-gold mb-1">{isArabic ? 'المصادر' : 'Sources'}</h4>
                  <ul className="space-y-1 text-[11px] leading-relaxed">
                    {item.a.sources.map((s, i) => (
                      <li key={String(s.id) + i} className="flex flex-wrap items-center gap-1 text-white/70">
                        <span className="text-white/90">[{i + 1}] {s.title}</span>
                        {s.author && <span className="text-white/50">— {s.author}</span>}
                        {s.locator && <span className="text-white/40">— {s.locator}</span>}
                        <span className="text-white/30">— sim {s.similarity.toFixed(2)}</span>
                        {s.url && <a href={s.url} target="_blank" className="underline text-sacred-gold/70 hover:text-sacred-gold" rel="noreferrer">{isArabic ? 'رابط' : 'Link'}</a>}
                        {typeof s.id === 'number' && (
                          <button
                            type="button"
                            onClick={() => showSource(s.id, s.title)}
                            className="ml-2 rounded-full border border-sacred-gold/30 px-2 py-0.5 text-[10px] text-sacred-gold hover:bg-sacred-gold/15 transition"
                          >
                            {isArabic ? 'هات المصدر' : 'Show'}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex items-center gap-3 text-[10px] text-white/40">
                <span>{(item.a.confidence * 100).toFixed(0)}% {isArabic ? 'ثقة' : 'confidence'}</span>
                {item.a.insufficient_evidence && (
                  <span className="px-2 py-0.5 rounded bg-red-600/30 text-red-300 text-[10px] font-medium">
                    {isArabic ? 'أدلة غير كافية' : 'Insufficient evidence'}
                  </span>
                )}
                <span>{item.a.raw_model}</span>
                <span>{item.a.tookMs}ms</span>
              </div>
              {item.a.follow_up?.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-2">
                  {item.a.follow_up.slice(0,3).map((f,i)=>(
                    <button
                      key={i}
                      onClick={()=> setQuestion(f)}
                      className="text-[10px] px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition"
                    >{f}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {!history.length && (
          <div className="text-white/50 text-sm" dir={isArabic ? 'rtl' : 'ltr'}>
            {isArabic ? 'ابدأ بطرح سؤال لاهوتي لتحصل على إجابة مستندة إلى مصادر.' : 'Start by asking a question to receive a sources-grounded answer.'}
          </div>
        )}
      </div>
      {openChunk && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900/95 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-semibold text-sacred-gold text-sm">
                {openChunk.title} {openChunk.locator ? `— ${openChunk.locator}` : ''}
              </h5>
              <div className="flex items-center gap-2">
                {sourceLoading && <span className="text-[10px] text-white/40 animate-pulse">{isArabic ? 'جارٍ...' : '...'}</span>}
                {sourceError && <span className="text-[10px] text-red-400">{sourceError}</span>}
                <button
                  onClick={() => setOpenChunk(null)}
                  className="rounded-lg border border-white/20 px-3 py-1 text-xs hover:bg-white/10 text-white/70 hover:text-white"
                >{isArabic ? 'إغلاق' : 'Close'}</button>
              </div>
            </div>
            <div className="text-xs whitespace-pre-wrap leading-relaxed text-white/90 max-h-[60vh] overflow-auto font-mono">
              {sourceLoading ? (isArabic ? 'جارٍ التحميل...' : 'Loading...') : (openChunk.content || (isArabic ? 'لا يوجد نص متاح لهذا المقتطف.' : 'No text available for this chunk.'))}
            </div>
            {openChunk.url && (
              <div className="mt-4 text-[10px]">
                {isArabic ? 'مصدر خارجي:' : 'External Source:'}{' '}
                <a className="underline text-sacred-gold/80 hover:text-sacred-gold" href={openChunk.url} target="_blank" rel="noreferrer">
                  {isArabic ? 'فتح الرابط' : 'Open link'}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

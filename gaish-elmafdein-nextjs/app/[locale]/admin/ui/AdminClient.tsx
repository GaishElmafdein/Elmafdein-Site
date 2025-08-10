"use client"
import React, { useState } from 'react'
// Uses server API /api/admin/upload now

interface Props { locale: string }

export default function AdminClient({ locale }: Props) {
  const isAr = locale === 'ar'
  const [file, setFile] = useState<File|null>(null)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [lang, setLang] = useState<'ar'|'en'>('ar')
  const [source, setSource] = useState('')
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !title) return
    setLoading(true)
    setStatus(isAr ? 'جاري الرفع...' : 'Uploading...')
    try {
  const form = new FormData()
  form.append('file', file)
  form.append('title', title)
  form.append('author', author)
  form.append('lang', lang)
  form.append('source', source)
  const r = await fetch('/api/admin/upload', { method: 'POST', body: form })
  const data = await r.json()
  if (!r.ok) throw new Error(data.error || 'failed')
  setStatus((isAr ? 'تم إدخال ' : 'Inserted ') + data.chunks + (isAr ? ' مقطع.' : ' chunks.'))
      setFile(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown'
      setStatus((isAr ? 'خطأ: ' : 'Error: ') + msg)
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl mx-auto py-16 space-y-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-sacred-gold to-sacred-amber bg-clip-text text-transparent">{isAr ? 'لوحة الإدارة' : 'Admin Panel'}</h1>
      <form onSubmit={submit} className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
        <input type="text" placeholder={isAr ? 'العنوان' : 'Title'} value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-3 py-2 rounded bg-white/10 border border-white/20" />
        <input type="text" placeholder={isAr ? 'المؤلف' : 'Author'} value={author} onChange={e=>setAuthor(e.target.value)} className="w-full px-3 py-2 rounded bg-white/10 border border-white/20" />
        <input type="text" placeholder={isAr ? 'المصدر' : 'Source'} value={source} onChange={e=>setSource(e.target.value)} className="w-full px-3 py-2 rounded bg-white/10 border border-white/20" />
  <label className="block text-xs text-white/60" htmlFor="langSel">{isAr ? 'اللغة' : 'Language'}</label>
  <select id="langSel" aria-label="language" value={lang} onChange={e=>setLang(e.target.value as 'ar'|'en')} className="w-full px-3 py-2 rounded bg-white/10 border border-white/20">
          <option value="ar">العربية</option>
          <option value="en">English</option>
        </select>
  <label className="block text-xs text-white/60" htmlFor="fileInput">{isAr ? 'ملف PDF أو DOCX' : 'PDF or DOCX File'}</label>
  <input id="fileInput" aria-label="book file" type="file" accept=".pdf,.docx" onChange={e=>setFile(e.target.files?.[0]||null)} className="text-sm" />
        <button disabled={loading} className="px-5 py-2 rounded-xl bg-sacred-gradient text-slate-900 font-semibold disabled:opacity-50">{loading ? (isAr ? '...' : '...') : (isAr ? 'رفع' : 'Upload')}</button>
      </form>
      {status && <div className="text-sm text-white/70" dir={isAr ? 'rtl' : 'ltr'}>{status}</div>}
    </div>
  )
}

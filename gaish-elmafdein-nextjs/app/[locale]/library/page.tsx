"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

type Book = {
  title: string;
  author?: string;
  source: string;
  details_url?: string;
  download_url?: string;
  cover_image?: string;
  pages?: number;
  size_mb?: number;
  lang?: string;
  category?: string;
  year?: number;
};

type LibraryResponse = {
  items: Book[];
  count?: number;
  took_ms?: number;
  cached?: boolean;
  error?: string;
  hint?: string;
};

export default function LibraryPage() {
  // External search links
  const externalSearchLinks = {
    christianlib: 'https://christianlib.com/search',
    coptictreasures: 'https://coptic-treasures.com/books',
  };

  // Helper to build params from current state
  function makeParams(extra?: { q?: string }) {
    const p = new URLSearchParams();
    if (extra?.q) p.set('q', extra.q);
    else if (debouncedQ) p.set('q', debouncedQ);
    if (site) p.set('site', site);
    if (maxPages) p.set('max_pages', String(maxPages));
    if (maxFollow) p.set('max_follow', String(maxFollow));
    return p;
  }
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [site, setSite] = useState<"" | "coptic" | "christianlib">("");
  const [maxPages, setMaxPages] = useState<number>(3);
  const [maxFollow, setMaxFollow] = useState<number>(6);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<Book[]>([]);
  const [meta, setMeta] = useState<{ took_ms?: number; cached?: boolean } | null>(null);
  // Unified controller + sequence guards
  const ctrlRef = useRef<AbortController | null>(null);
  const seqRef = useRef(0);

  // Debounce
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 500);
    return () => clearTimeout(id);
  }, [q]);

  // Robust fetch with raw text capture
  async function requestLibrary(params: URLSearchParams) {
    const seq = ++seqRef.current;
    // Abort previous request fully to save bandwidth
    if (ctrlRef.current) {
      try { ctrlRef.current.abort(); } catch { /* ignore */ }
    }
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;

    setLoading(true);
    setErr(null);
    try {
      const r = await fetch('/api/proxy/library?' + params.toString(), {
        cache: 'no-store',
        signal: ctrl.signal,
      });
      const txt = await r.text();
      let j: LibraryResponse;
      try { j = JSON.parse(txt); } catch { throw new Error(`Invalid JSON from proxy. Raw: ${txt.slice(0,300)}`); }
      if (seq !== seqRef.current) return; // late
  if (!r.ok || j?.error) throw new Error(j?.hint || j?.error || `HTTP ${r.status}`);
  setData(Array.isArray(j.items) ? j.items : []);
  setMeta({ took_ms: j.took_ms, cached: j.cached });
    } catch (e: unknown) {
      const errObj = e as Error & { name?: string };
      if (errObj?.name === 'AbortError') return; // intentional cancel
      if (seq !== seqRef.current) return; // stale response
      setErr(errObj?.message || 'Fetch failed');
  setData([]);
  setMeta(null);
    } finally {
      if (seq === seqRef.current) setLoading(false);
    }
  }

  // Initial + changes
  useEffect(() => {
    const buildParams = (overrideQ?: string) => {
      const p = new URLSearchParams();
      if (overrideQ) p.set('q', overrideQ); else if (debouncedQ) p.set('q', debouncedQ);
      if (site) p.set('site', site);
      if (maxPages) p.set('max_pages', String(maxPages));
      if (maxFollow) p.set('max_follow', String(maxFollow));
      return p;
    };
    if (!debouncedQ) {
      requestLibrary(buildParams('most_downloaded'));
    } else {
      requestLibrary(buildParams());
    }
  }, [debouncedQ, site, maxPages, maxFollow]);

  const skeletons = useMemo(() => Array.from({ length: 8 }), []);

  return (
    <main className="min-h-screen px-4 md:px-8 py-8">
      {/* Hero Section */}
      <section
        className="w-full flex flex-col items-center justify-center py-6 mb-2 bg-gradient-to-b from-gold-100/30 to-midnight-900/10 rounded-xl shadow-lg"
      >
        <h1 className="font-arabic text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gold-600 mb-4 leading-[1.05]">
          كاتدرائية رقمية
        </h1>
        <h2 className="font-arabic text-3xl md:text-4xl lg:text-5xl font-bold text-midnight-700 mb-3 leading-tight">
          لتسليم الإيمان القويم
        </h2>
        <p className="font-arabic text-2xl md:text-3xl text-midnight-700 font-semibold mb-3 text-center leading-snug">
          المُسلَّم مرة واحدة للقديسين
        </p>
        <p className="font-arabic text-lg md:text-2xl text-midnight-600/90 mb-6 text-center max-w-2xl font-medium tracking-wide">
          بث حي · دفاعيات · آبائيات · مقارنة &quot;ديانات&quot;
        </p>
        <blockquote className="text-xs md:text-sm font-arabic text-gold-700/90 italic text-center max-w-xl">
          &quot;كونوا مستعدين في كل حين لمجاوبة كل من يسألكم عن سبب الرجاء الذي فيكم&quot; – ١ بطرس ٣:١٥
        </blockquote>
      </section>
  <header className="mb-4">
        <h1 className="text-3xl font-bold text-yellow-400">📚 مكتبة جيش المفديين</h1>
        <p className="text-slate-300">
          بحث مباشر من Coptic Treasures / ChristianLib عبر Proxy داخلي.
        </p>
      </header>

      <section className="mb-6 grid grid-cols-1 lg:grid-cols-12 gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث: didache / أنطونيوس / تجسد..."
          className="lg:col-span-6 w-full rounded-2xl px-4 py-3 bg-slate-900/60 text-slate-100 border border-slate-700 focus:ring-2 focus:ring-amber-500"
          aria-label="بحث عن الكتب"
        />

        <select
          value={site}
          onChange={(e) => setSite(e.target.value as "" | "coptic" | "christianlib")}
          className="lg:col-span-3 w-full rounded-2xl px-4 py-3 bg-slate-900/60 text-slate-100 border border-slate-700"
          aria-label="تصفية حسب المصدر"
        >
          <option value="">All sources</option>
          <option value="coptic">Coptic Treasures</option>
          <option value="christianlib">ChristianLib</option>
        </select>

        <select
          value={maxPages}
          onChange={(e) => setMaxPages(Number(e.target.value))}
          className="lg:col-span-3 w-full rounded-2xl px-4 py-3 bg-slate-900/60 text-slate-100 border border-slate-700"
          aria-label="عدد الصفحات لكل موقع"
        >
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} page{n>1?"s":""} / site</option>)}
        </select>
        <select
          value={maxFollow}
          onChange={(e) => setMaxFollow(Number(e.target.value))}
          className="lg:col-span-3 w-full rounded-2xl px-4 py-3 bg-slate-900/60 text-slate-100 border border-slate-700"
          aria-label="عدد الصفحات التفصيلية العميقة (max_follow)"
        >
          {[0,2,4,6,8,10].map(n => <option key={n} value={n}>{n} deep</option>)}
        </select>
      </section>


      {/* Direct links block (always visible) */}
      <div className="mb-4 flex gap-3 flex-wrap">
        <a
          href={externalSearchLinks.christianlib}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 text-sm"
        >
          🔍 فتح بحث ChristianLib مباشرة
        </a>
        <a
          href={externalSearchLinks.coptictreasures}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 text-sm"
        >
          📚 فتح قائمة Coptic Treasures مباشرة
        </a>
      </div>

      {err && (
        <div className="mb-4 rounded-xl border border-red-700 bg-red-900/40 text-red-200 px-4 py-3">
          خطأ في جلب النتائج: {err}
          <button
            onClick={() => {
              requestLibrary(makeParams());
            }}
            className="ml-2 underline"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {loading && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {skeletons.map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              <div className="aspect-[16/10] bg-slate-800 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-slate-800 animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-slate-800 animate-pulse rounded" />
                <div className="h-8 w-full bg-slate-800 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </section>
      )}

      {!loading && (
        <>
          <div className="text-sm text-slate-400 mb-3 flex flex-wrap gap-4 items-center">
            <span>النتائج: <strong>{data.length}</strong></span>
            {meta && process.env.NODE_ENV === 'development' && (
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs">
                {meta.took_ms} ms {meta.cached ? '• cached' : ''}
              </span>
            )}
          </div>

          {data.length === 0 && !err && (
            <div className="mb-6 rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-slate-300 space-y-3">
              <p>لا توجد نتائج من المصدر. جرّب كلمة أخرى أو افتح البحث في المصدر مباشرةً.</p>
              <div className="flex gap-3 flex-wrap">
                <a
                  href={`https://www.christianlib.com/?s=${encodeURIComponent(debouncedQ || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 text-sm"
                >فتح بحث ChristianLib</a>
                <a
                  href={`https://coptic-treasures.com/sections/books/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 text-sm"
                >فتح قائمة Coptic Treasures</a>
              </div>
            </div>
          )}

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {data.map((b, i) => (
              <article
                key={`${b.title}-${i}`}
                className="group rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden hover:border-amber-500/60 transition shadow-lg hover:shadow-amber-500/10"
              >
                <div className="aspect-[16/10] bg-slate-800 overflow-hidden grid place-items-center text-slate-400">
                  <div className="relative w-full h-full">
                    <Image
                      src={b.cover_image || '/fallback-cover.png'}
                      alt={b.title || 'Book cover'}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition"
                    />
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-slate-100 line-clamp-2">{b.title}</h3>
                  <p className="text-sm text-slate-400 space-y-1">
                    <span className="block">{b.author || '—'} • {b.lang?.toUpperCase() || ''}</span>
                    <span className="inline-block rounded-full border border-slate-600 px-2 py-0.5">📚 المصدر: {b.source}</span>
                  </p>
                  {(b.category || b.year) && (
                    <p className="text-xs text-slate-500 mt-1">
                      {b.category && <span className="mr-2">{b.category}</span>}
                      {b.year && <span>{b.year}</span>}
                    </p>
                  )}

                  <div className="mt-3 flex gap-2 flex-wrap">
                    {b.details_url && (
                      <a
                        href={b.details_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`فتح صفحة المصدر لكتاب ${b.title}`}
                        className="px-3 py-2 rounded-xl bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700"
                      >
                        المصدر
                      </a>
                    )}
                    {b.download_url ? (
                      <a
                        href={b.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`قراءة أو تحميل كتاب ${b.title}`}
                        className="px-3 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-500"
                      >
                        قراءة/تحميل
                      </a>
                    ) : (
                      <span role="status" aria-live="polite" className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 border border-slate-700">
                        غير متاح
                      </span>
                    )}
                    <button
                      onClick={async () => {
                        try {
                          await fetch('/api/report-broken', { method: 'POST', body: JSON.stringify({ url: b.download_url || b.details_url, title: b.title }), headers: { 'Content-Type': 'application/json' } });
                          alert('تم إرسال التقرير. شكرًا لك.');
                        } catch { /* ignore */ }
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-900 text-slate-400 border border-slate-700 hover:bg-slate-800 text-xs"
                    >الإبلاغ عن رابط مكسور</button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  );
}

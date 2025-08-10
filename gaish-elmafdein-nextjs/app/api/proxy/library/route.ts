import { NextRequest, NextResponse } from "next/server";

// Force Node.js runtime and dynamic rendering to avoid edge/runtime ambiguity during debugging
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Timeout after tuning (was 35s/30s). Further adjust if backend stabilizes.
const TIMEOUT_MS = 20_000;

// Helper: coerce a query string value to bounded integer (returns undefined if invalid)
function coerceInt(raw: string | null, { min, max }: { min: number; max: number }): number | undefined {
  if (!raw) return undefined;
  // strip non-digits (allow leading minus only if min < 0 but here we only expect positive)
  const cleaned = raw.replace(/[^0-9]/g, "");
  if (!cleaned) return undefined;
  const n = parseInt(cleaned, 10);
  if (Number.isNaN(n)) return undefined;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

export async function GET(req: NextRequest) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  console.log('[proxy/library] start', { apiBase });
  if (!apiBase) {
    return NextResponse.json(
      { error: "api_base_missing", hint: "Set NEXT_PUBLIC_API_BASE (e.g., http://localhost:8000) in .env.local then restart dev server" },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const site = searchParams.get("site") ?? "";
  // Raw numeric params (may contain stray chars pasted by user) -> sanitize
  const max_pages_int = coerceInt(searchParams.get("max_pages"), { min: 1, max: 5 });
  const max_follow_int = coerceInt(searchParams.get("max_follow"), { min: 0, max: 10 });
    const ping = searchParams.get("ping");
    const debug = searchParams.get('debug');

    if (ping) {
      return NextResponse.json({ ok: true, message: 'proxy alive', apiBase }, { status: 200 });
    }
    if (debug) {
  return NextResponse.json({ ok: true, message: 'debug bypass', note: 'Upstream fetch skipped', q, site, max_pages: max_pages_int, apiBase }, { status: 200 });
    }

  const target = new URL("/api/library", apiBase);
  if (q) target.searchParams.set("q", q);
  if (site) target.searchParams.set("site", site);
  if (typeof max_pages_int === 'number') target.searchParams.set("max_pages", String(max_pages_int));
  if (typeof max_follow_int === 'number') target.searchParams.set("max_follow", String(max_follow_int));

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort("timeout"), TIMEOUT_MS);

    let upstream: Response | null = null;
    let attempt = 0;
    const maxAttempts = 2; // single retry for transient cold-start / race
    while (attempt < maxAttempts) {
      attempt++;
      try {
        upstream = await fetch(target.toString(), {
          signal: ctrl.signal,
          headers: { accept: "application/json", 'x-proxy-attempt': String(attempt) },
          cache: "no-store",
        });
        console.log('[proxy/library] upstream status', upstream.status, 'attempt', attempt);
        break; // success path (even if non-200 we'll handle later)
      } catch (fetchErr: unknown) {
        if (attempt >= maxAttempts) {
          clearTimeout(timer);
          console.error('[proxy/library] fetch failed final', fetchErr);
          return NextResponse.json({
            error: 'fetch_failed',
            hint: (fetchErr as Error)?.message || 'Unable to reach backend',
            target: target.toString(),
            attempts: attempt,
          }, { status: 502 });
        }
        console.warn('[proxy/library] transient fetch error, retrying...', fetchErr);
        await new Promise(r => setTimeout(r, 350));
      }
    }
    clearTimeout(timer);
    if (!upstream) {
      return NextResponse.json({ error: 'fetch_failed', hint: 'Unknown failure (no response object)', target: target.toString() }, { status: 502 });
    }

  const text = await upstream.text();
  console.log('[proxy/library] raw length', text.length);
  let payload: unknown;
  try { payload = JSON.parse(text); } catch { payload = text; }

    // Unified response: always return { items, count, took_ms, cached }
  if (Array.isArray(payload)) {
      payload = { items: payload, count: payload.length, took_ms: 0, cached: false };
  } else if (payload && typeof payload === "object" && "items" in payload) {
      // leave as-is
    } else if (!upstream.ok) {
      return NextResponse.json(
        { error: "upstream_failed", status: upstream.status, body: payload },
        { status: 502 }
      );
    } else {
      payload = { items: [payload], count: 1, took_ms: 0, cached: false };
    }
  // Always return 200 for normalized success objects even if upstream returned 200 with different shape
  console.log('[proxy/library] success payload keys', typeof payload === 'object' && payload ? Object.keys(payload as Record<string, unknown>) : []);
  return NextResponse.json(payload, { status: 200 });
  } catch (err: unknown) {
    const e = err as { name?: string; message?: string };
    const isAbort = e?.name === 'AbortError' || String(e?.message || '').includes('timeout');
    console.error('[proxy/library] error', e);
    return NextResponse.json({
      error: isAbort ? 'timeout' : 'proxy_error',
      hint: isAbort ? `Upstream > ${TIMEOUT_MS / 1000}s` : 'Start backend: uvicorn backend.main:app --port 8000 --reload',
      items: [],
      count: 0,
      took_ms: 0,
      cached: false,
    }, { status: 502 });
  }
}

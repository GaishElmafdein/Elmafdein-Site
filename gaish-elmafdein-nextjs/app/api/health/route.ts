import { NextResponse } from 'next/server';

/**
 * Lightweight health endpoint: reports frontend status and basic backend reachability.
 */
export async function GET() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  let upstream = { ok: false, status: 0 };
  if (apiBase) {
    try {
      const r = await fetch(`${apiBase}/api/library`, { cache: 'no-store' });
      upstream = { ok: r.ok, status: r.status };
    } catch {
      upstream = { ok: false, status: 0 };
    }
  }
  return NextResponse.json({
    ok: true,
    frontend: 'up',
    backend_base: apiBase || null,
    backend_reachable: upstream.ok,
    backend_status: upstream.status,
    ts: new Date().toISOString(),
  });
}

// scripts/test-proxy.mjs
// Node 18+ (global fetch available)
/*
  Usage:
    node scripts/test-proxy.mjs
    TEST_BASE="https://your-vercel-url" node scripts/test-proxy.mjs
*/
const BASE = process.env.TEST_BASE || "http://localhost:3000";

const cases = [
  { name: "valid-minimal", q: "didache" },
  { name: "with-site-coptic", q: "أثناسيوس", site: "coptic", max_pages: "1", max_follow: "0" },
  { name: "with-site-christianlib", q: "didache", site: "christianlib", max_pages: "2", max_follow: "2" },
  { name: "digits-mixed (sanitized)", q: "test", max_pages: "  5abc  ", max_follow: "  10xyz " },
  { name: "too-large (bounded)", q: "test", max_pages: "9999", max_follow: "9999" },
  { name: "negative (bounded)", q: "test", max_pages: "-3", max_follow: "-2" },
  { name: "empty-query", q: "" },
  { name: "no-params" },
];

const healthUrls = [
  `${BASE}/api/health`,
];

function qs(params = {}) {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) s.set(k, String(v));
  }
  return s.toString();
}

async function runCase(c) {
  const url = `${BASE}/api/proxy/library?${qs({
    q: c.q,
    site: c.site,
    max_pages: c.max_pages,
    max_follow: c.max_follow,
  })}`;
  const t0 = Date.now();
  let status = 0, ok = false, body;
  try {
    const r = await fetch(url, { cache: "no-store" });
    status = r.status;
    ok = r.ok;
    body = await r.json().catch(async () => ({ raw: await r.text() }));
  } catch (e) {
    body = { error: String(e) };
  }
  const dt = Date.now() - t0;

  let summary = {};
  if (body && typeof body === "object") {
    summary = {
      itemsCount: Array.isArray(body.items) ? body.items.length : undefined,
      took_ms: body.took_ms,
      cached: body.cached,
      error: body.error,
      hint: body.hint,
      placeholder: body.placeholder,
    };
  }

  return { name: c.name, url, status, ok, ms: dt, summary };
}

async function main() {
  console.log("== Health checks ==");
  for (const u of healthUrls) {
    try {
      const r = await fetch(u, { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      console.log(u, "->", r.status, j);
    } catch (e) {
      console.log(u, "-> ERROR", String(e));
    }
  }

  console.log("\n== Proxy test cases ==");
  const results = [];
  for (const c of cases) {
    const res = await runCase(c);
    results.push(res);
    console.log(
      `• ${res.name} → ${res.status} (${res.ms}ms)`,
      JSON.stringify(res.summary)
    );
  }

  const hardFails = results.filter(r =>
    (!r.ok && (r.status >= 500 || r.status === 0)) ||
    (r.summary && r.summary.error)
  );
  if (hardFails.length) {
    console.log("\nHard failures:", hardFails.map(f => ({ name: f.name, status: f.status, summary: f.summary })));
    process.exitCode = 1;
  } else {
    console.log("\nAll good ✅");
  }
}

main().catch(e => {
  console.error("Test runner crashed:", e);
  process.exit(1);
});

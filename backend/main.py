"""Elmafdein Library API
---------------------------------
FastAPI + Playwright scrapers (Coptic Treasures / ChristianLib) with:
 - Polite scraping (delays, robots awareness handled in scrapers)
 - Daily in‑memory cache (no caching of empty results)
 - Unified response shape { items, count, took_ms, cached, hint? }
 - NO local storage of PDFs (only deep links / metadata)
 - Secondary hop fallback for ChristianLib when initial deep phase empty
"""

from __future__ import annotations

import asyncio
import logging
import os
import random
import re
import time
from typing import Any, Dict, List, Optional, Tuple

from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from playwright.async_api import async_playwright, Browser, Page

"""Import strategy
We prefer absolute imports (models_types, scrapers, cache) but we proactively
ensure this file's directory is at the front of sys.path so that cache.py inside
backend/ is chosen over the sibling top-level cache/ directory (which is not a
module). This avoids AttributeError: module 'cache' has no attribute 'make_key'.
"""

import sys as _sys, pathlib as _pl
_HERE = _pl.Path(__file__).resolve().parent
if str(_HERE) not in _sys.path:
    _sys.path.insert(0, str(_HERE))

from models_types import Book, LibraryResponse  # local module
from scrapers import coptic as scraper_coptic
from scrapers import christianlib as scraper_christianlib
import daycache

APP_TITLE = "Elmafdein Library API"
REQUEST_TIMEOUT_MS = 15_000
HEADLESS = os.getenv("DEBUG", "0") not in ("1", "true", "True")
USER_AGENTS = [
    "ElmafdeinBot/1.0 (+contact: example@example.com) Chrome/125",
    "ElmafdeinBot/1.0 (+contact: example@example.com) Safari/16.6",
]

# --- Simple in-process IP rate limiting (fixed window) ---
RATE_LIMIT_MAX = int(os.getenv("RATE_LIMIT_MAX", "30"))  # requests
RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW_SEC", "300"))  # seconds
_RL_STORE: Dict[str, Tuple[int, float]] = {}

def _rl_now() -> float:
    return time.time()


def _dedup(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen = set()
    out: List[Dict[str, Any]] = []
    for it in items:
        key = ((it.get("title") or "").strip().lower(), it.get("download_url") or it.get("details_url"))
        if key in seen:
            continue
        seen.add(key)
        out.append(it)
    return out


class PWSession:
    def __init__(self):
        self.playwright = None
        self.browser: Optional[Browser] = None

    async def __aenter__(self):
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(headless=HEADLESS)
        return self

    async def __aexit__(self, exc_type, exc, tb):
        try:
            if self.browser:
                await self.browser.close()
        finally:
            if self.playwright:
                await self.playwright.stop()

    async def new_page(self) -> Page:
        assert self.browser
        ctx = await self.browser.new_context(
            user_agent=random.choice(USER_AGENTS),
            locale="ar-EG",
            viewport={"width": 1280, "height": 900},
        )
        p = await ctx.new_page()
        p.set_default_navigation_timeout(REQUEST_TIMEOUT_MS)
        p.set_default_timeout(REQUEST_TIMEOUT_MS)
        return p


async def _secondary_hop_fallback(page: Page, query: str, max_follow: int, tried: List[str]) -> List[Dict[str, Any]]:
    """Attempt a secondary hop on ChristianLib search results pages to salvage suggestions.

    We visit up to `max_follow` candidate detail pages and return first batch
    of minimal book records (may lack download_url if none clearly found).
    """
    base = "https://www.christianlib.com"
    search_urls = [f"{base}/?s={query}", f"{base}/search/{query}"]
    visited: set[str] = set()
    results: List[Dict[str, Any]] = []
    for surl in search_urls:
        try:
            await page.goto(surl)
            await asyncio.sleep(0.5)
        except Exception:
            continue
        anchors = await page.query_selector_all("a[href]")
        candidates: List[str] = []
        for a in anchors:
            href = await a.get_attribute("href") or ""
            if not href or href.startswith("#"):
                continue
            if any(p in href for p in ["/book/", "/?p=", ".html"]):
                full = href if href.startswith("http") else base + href
                if full not in visited:
                    visited.add(full)
                    candidates.append(full)
            if len(candidates) >= max_follow:
                break
        for url in candidates:
            if len(results) >= max_follow:
                break
            try:
                await page.goto(url)
                await asyncio.sleep(0.4)
                pdf = ""
                a_pdf = await page.query_selector("a[href*='.pdf']")
                if a_pdf:
                    h = await a_pdf.get_attribute("href")
                    if h:
                        pdf = h if h.startswith("http") else base + h
                if not pdf:
                    btn = await page.query_selector("a:has-text('تحميل'), a:has-text('Download'), button:has-text('PDF')")
                    if btn:
                        h = await btn.get_attribute("href")
                        if h:
                            pdf = h if h.startswith("http") else base + h
                if not pdf:
                    ifr = await page.query_selector("iframe[src*='.pdf']")
                    if ifr:
                        src = await ifr.get_attribute("src")
                        if src:
                            pdf = src if src.startswith("http") else base + src
                title_el = await page.query_selector("h1, h2, .entry-title")
                title = (await title_el.inner_text() if title_el else "").strip()
                if not title:
                    continue
                results.append(
                    {
                        "title": title,
                        "author": "",
                        "source": "christianlib",
                        "details_url": url,
                        "download_url": pdf,
                        "cover_image": "",
                        "lang": "ar" if re.search(r"[\u0600-\u06FF]", title) else "en",
                    }
                )
            except Exception:
                continue
        if results:
            break
    if results:
        tried.append("secondary_hop")
    return results


async def search_books(
    query: Optional[str], site: Optional[str], max_pages: int, max_follow: int
) -> Tuple[List[Dict[str, Any]], bool, List[str]]:
    """Orchestrate scrapers + cache + fallback.

    Returns: (items, cached_flag, tried_selectors)
    """
    tried: List[str] = []
    version = "1"  # bump when logic changes materially
    cache_key = daycache.make_key(site, query, max_pages, max_follow, version)
    cached = daycache.get(cache_key)
    if cached is not None:
        return cached, True, tried

    out: List[Dict[str, Any]] = []
    scope = (site or "all").lower()
    async with PWSession() as sess:
        page = await sess.new_page()
        # Coptic
        if scope in ("all", "coptic", "coptic-treasures", "coptic_treasures"):
            try:
                part = await scraper_coptic.scrape(page, query, max_pages, tried)
                out.extend(part)
            except Exception as e:
                tried.append("error:coptic")
                logging.getLogger("uvicorn.error").warning("LIB: coptic error %s", e)
        # ChristianLib
        if scope in ("all", "christianlib", "christian_lib"):
            try:
                part = await scraper_christianlib.scrape(page, query, max_pages, tried, max_follow=max_follow)
                out.extend(part)
            except Exception as e:
                tried.append("error:christianlib")
                logging.getLogger("uvicorn.error").warning("LIB: christianlib error %s", e)
        # Secondary hop fallback if still empty for christianlib scope with a query
        if not out and scope in ("all", "christianlib", "christian_lib") and query:
            try:
                sec_page = await sess.new_page()
                sec = await _secondary_hop_fallback(sec_page, query, max_follow, tried)
                await sec_page.close()
                if sec:
                    out.extend(sec)
            except Exception as e:
                tried.append("error:secondary")
                logging.getLogger("uvicorn.error").warning("LIB: secondary hop error %s", e)

    out = _dedup(out)
    # sanitize
    for it in out:
        for k in ("title", "author", "source", "details_url", "download_url", "cover_image"):
            if it.get(k):
                it[k] = str(it[k]).strip()
    if out:
        daycache.set(cache_key, out)
    return out, False, tried


log = logging.getLogger("uvicorn.error")
app = FastAPI(title=APP_TITLE)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):  # type: ignore[override]
    if RATE_LIMIT_MAX > 0 and request.url.path == "/api/library":
        ip = request.client.host if request.client else "unknown"
        now = _rl_now()
        count, start = _RL_STORE.get(ip, (0, now))
        if now - start > RATE_LIMIT_WINDOW:
            count, start = 0, now
        if count >= RATE_LIMIT_MAX:
            retry_after = max(1, int(start + RATE_LIMIT_WINDOW - now))
            return JSONResponse(
                status_code=429,
                headers={"Retry-After": str(retry_after)},
                content={
                    "error": "rate_limited",
                    "hint": f"Too many requests from {ip}. Limit {RATE_LIMIT_MAX}/{RATE_LIMIT_WINDOW}s",
                    "items": [],
                    "count": 0,
                    "took_ms": 0,
                    "cached": False,
                },
            )
        _RL_STORE[ip] = (count + 1, start)
    return await call_next(request)


@app.get("/api/library")
async def api_library(
    q: Optional[str] = Query(default=None, description="search query"),
    site: Optional[str] = Query(default=None, description="site=coptic|christianlib|all"),
    max_pages: int = Query(default=2, ge=1, le=5, description="max pages per site when q omitted"),
    max_follow: int = Query(default=6, ge=0, le=10, description="max detail pages for deep/secondary hop"),
):
    t0 = time.time()
    log.info("LIB: start q=%s site=%s", q, site)
    try:
        data, cached_flag, tried = await search_books(q, site, max_pages, max_follow)
        took = time.time() - t0
        if data:
            log.info("LIB: ok items=%d took=%.1fs", len(data), took)
            return JSONResponse(
                content=LibraryResponse(
                    items=[Book(**b) for b in data],
                    count=len(data),
                    took_ms=int(took * 1000),
                    cached=cached_flag,
                ).dict()
            )
        log.info("LIB: empty tried=%s took=%.1fs", tried, took)
        return JSONResponse(
            content=LibraryResponse(
                items=[], count=0, took_ms=int(took * 1000), cached=False, hint=f"no matches; tried={tried}"
            ).dict()
        )
    except Exception as e:
        took = time.time() - t0
        log.exception("LIB: fail took=%.2fs err=%s", took, e)
        return JSONResponse(
            status_code=502,
            content={
                "error": "LIB_ERROR",
                "hint": str(e),
                "took_ms": int(took * 1000),
                "items": [],
                "count": 0,
                "cached": False,
            },
        )


@app.get("/health")
async def health():
    return {"ok": True, "service": APP_TITLE}


_REPORTS: List[Dict[str, Any]] = []

@app.post("/api/report-broken")
async def report_broken(payload: Dict[str, Any]):
    """Ephemeral in-memory storage for broken link reports (not persisted)."""
    payload = {
        "ts": time.time(),
        **{k: str(v)[:500] for k, v in payload.items() if isinstance(v, (str, int, float))},
    }
    _REPORTS.append(payload)
    # cap size
    if len(_REPORTS) > 200:
        del _REPORTS[:50]
    return {"ok": True, "stored": True, "count": len(_REPORTS)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)

from __future__ import annotations
"""ChristianLib scraper with deep phase + polite delays.

Secondary hop logic restricted by max_follow.
"""
import random, re
from urllib.parse import urlparse, unquote
from typing import List, Dict, Any, Optional
from playwright.async_api import Page
from robots import is_allowed
from models_types import Book

NAV_DELAY_RANGE_MS = (400, 700)
BASE = "https://www.christianlib.com"
PDF_HINT_WORDS = ("download", "تحميل", "book")

async def wait_rand():
    from asyncio import sleep
    await sleep(random.randint(*NAV_DELAY_RANGE_MS)/1000)


def _href_has_key(h: Optional[str], key: str) -> bool:
    if not h or not key:
        return False
    low = h.lower(); k = key.lower()
    return (k in low) or (k in unquote(low))


def _pdf_name_has(url: Optional[str], key: str) -> bool:
    if not (url and key): return False
    name = urlparse(url).path.rsplit('/',1)[-1].lower()
    return key.lower() in name

async def _harvest_page_pdfs(page: Page, base: str) -> List[str]:
    out: List[str] = []
    try:
        anchors = await page.locator("a[href*='.pdf']").element_handles()
        for a in anchors:
            href = await a.get_attribute('href')
            if href:
                out.append(href if href.startswith('http') else base + href)
    except Exception:
        pass
    try:
        ifrs = await page.locator("iframe[src*='.pdf']").element_handles()
        for f in ifrs:
            src = await f.get_attribute('src')
            if src:
                out.append(src if src.startswith('http') else base + src)
    except Exception:
        pass
    return out

async def scrape(page: Page, q: Optional[str], max_pages: int, tried: List[str], max_follow: int) -> List[Dict[str,Any]]:
    key = (q or '').strip()
    results: List[Dict[str,Any]] = []
    if key:
        search_urls = [f"{BASE}/?s={key}", f"{BASE}/search/{key}"]
    else:
        search_urls = [BASE]
    cards: List[tuple] = []
    tried.append('list_cards')
    for surl in search_urls:
        if not is_allowed(BASE, '/'): break
        try:
            await page.goto(surl)
            await wait_rand()
            anchors = await page.query_selector_all('a')
            for a in anchors:
                title = (await a.inner_text() or '').strip()
                href = await a.get_attribute('href') or ''
                if not title or not href: continue
                if any(seg in href for seg in ['/book', '/books/']):
                    full = href if href.startswith('http') else BASE + href
                    cards.append((title, full, ''))
            if cards:
                break
        except Exception:
            continue
    # Shallow filter
    if key:
        cards = [c for c in cards if key.lower() in c[0].lower()]
    # Shallow results
    for title, details, cover in cards[:max_follow]:
        results.append(Book(title=title, author='', source='christianlib', details_url=details, download_url='', cover_image=cover, lang='ar' if re.search(r'[\u0600-\u06FF]', title) else 'en').dict())
    # Need deep?
    if key and len(results) < 3:
        candidate_urls = [r['details_url'] for r in results if r.get('details_url')]
        # also collect anchors containing key
        anchors = await page.query_selector_all('a')
        for a in anchors:
            href = await a.get_attribute('href')
            if _href_has_key(href, key):
                full = href if href and href.startswith('http') else (BASE + href if href else '')
                if full:
                    candidate_urls.append(full)
        # heuristic more
        for a in anchors:
            href = await a.get_attribute('href') or ''
            if any(p in href for p in ['/book/','/?p=']):
                full = href if href.startswith('http') else BASE + href
                candidate_urls.append(full)
        # dedupe & limit
        seen=set(); cand=[u for u in candidate_urls if u and not (u in seen or seen.add(u))][:max_follow]
        deep_items: List[Dict[str,Any]] = []
        samples = []
        for idx, url in enumerate(cand):
            if not is_allowed(BASE, url.replace(BASE,'')):
                continue
            try:
                await page.goto(url)
                await wait_rand()
                pdfs = await _harvest_page_pdfs(page, BASE)
                # buttons
                if not pdfs:
                    btn = await page.query_selector("a:has-text('تحميل'), a:has-text('Download'), button:has-text('PDF')")
                    if btn:
                        h = await btn.get_attribute('href')
                        if h:
                            pdfs.append(h if h.startswith('http') else BASE + h)
                title_el = await page.query_selector('h1, h2, .entry-title')
                title_text = (await title_el.inner_text() if title_el else '').strip()
                body_html = ''
                content = await page.query_selector('article, .entry-content, .post, .content')
                if content:
                    try: body_html = (await content.inner_text())[:2000]
                    except: body_html = ''
                match=False
                lk=key.lower()
                if lk in title_text.lower(): match=True
                elif lk in body_html.lower(): match=True
                elif any(_pdf_name_has(p, lk) for p in pdfs): match=True
                if len(samples)<2:
                    samples.append((title_text[:70], pdfs[0] if pdfs else None))
                if match:
                    deep_items.append(Book(
                        title=title_text or 'بدون عنوان',
                        author='',
                        source='christianlib',
                        details_url=url,
                        download_url=pdfs[0] if pdfs else '',
                        cover_image='',
                        lang='ar' if re.search(r'[\u0600-\u06FF]', title_text) else 'en'
                    ).dict())
            except Exception:
                continue
            if idx+1 >= max_follow:
                break
        if deep_items:
            results = deep_items
    return results

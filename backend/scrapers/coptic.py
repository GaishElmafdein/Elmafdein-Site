from __future__ import annotations
"""Coptic Treasures scraper (polite, no PDF storage)."""
import random, re
from typing import List, Dict, Any, Optional, Tuple
from playwright.async_api import Page
from robots import is_allowed
from models_types import Book

NAV_DELAY_RANGE_MS = (400, 700)

async def wait_rand(page):
    from asyncio import sleep
    await sleep(random.randint(*NAV_DELAY_RANGE_MS)/1000)

BASE = "https://coptic-treasures.com"
LIST_START = f"{BASE}/sections/books/"

async def _extract_page_cards(page: Page) -> List[Tuple[str,str,str]]:
    selectors = [
        'article',
        'div.book, div.card, div.entry, div.post, div.grid-item',
        'div[class*="book"], div[class*="entry"], div[class*="card"]',
        'li[class*="book"], li[class*="entry"]'
    ]
    for sel in selectors:
        els = await page.query_selector_all(sel)
        if els:
            out = []
            for el in els:
                a = await el.query_selector('a')
                if not a: continue
                title = (await a.inner_text() or '').strip()
                href = await a.get_attribute('href') or ''
                if not title or not href: continue
                details = href if href.startswith('http') else BASE + href
                img = await el.query_selector('img')
                cover = ''
                if img:
                    src = await img.get_attribute('src')
                    if src:
                        cover = src if src.startswith('http') else BASE + src
                out.append((title, details, cover))
            if out:
                return out
    # fallback: anchors
    links = await page.query_selector_all('a')
    out = []
    for a in links:
        t = (await a.inner_text() or '').strip()
        h = await a.get_attribute('href') or ''
        if not t or not h: continue
        if '/book' in h or '/books/' in h:
            out.append((t, h if h.startswith('http') else BASE + h, ''))
    return out

async def _get_pdf(page: Page, details_url: str) -> str:
    try:
        if not is_allowed(BASE, details_url.replace(BASE,'')):
            return ''
        await page.goto(details_url)
        await wait_rand(page)
        for sel in ['a[href$=".pdf"]','a[href*=".pdf?" ]']:
            a = await page.query_selector(sel)
            if a:
                href = await a.get_attribute('href')
                if href:
                    return href if href.startswith('http') else BASE + href
        btn = await page.query_selector("a:has-text('تحميل'), a:has-text('Download'), button:has-text('تحميل')")
        if btn:
            href = await btn.get_attribute('href')
            if href:
                return href if href.startswith('http') else BASE + href
        ifr = await page.query_selector('iframe[src$=".pdf"], iframe[src*="/pdf"]')
        if ifr:
            src = await ifr.get_attribute('src')
            if src:
                return src if src.startswith('http') else BASE + src
    except Exception:
        return ''
    return ''

async def scrape(page: Page, q: Optional[str], max_pages: int, tried: List[str]) -> List[Dict[str,Any]]:
    results: List[Dict[str,Any]] = []
    next_url = LIST_START
    pages = 0
    ql = (q or '').lower()
    while next_url and pages < max_pages:
        if not is_allowed(BASE, '/sections/books/'):
            break
        await page.goto(next_url)
        await wait_rand(page)
        pages += 1
        cards = await _extract_page_cards(page)
        if ql:
            cards = [c for c in cards if ql in c[0].lower()]
        for title, details, cover in cards:
            pdf = await _get_pdf(page, details)
            body_html = await page.content()
            pages_n = None
            size_mb = None
            year = None
            cat = None
            m = re.search(r'(18\d{2}|19\d{2}|20\d{2})', body_html)
            if m:
                try: year = int(m.group(1))
                except: pass
            results.append(Book(
                title=title,
                author='',
                source='coptic',
                details_url=details,
                download_url=pdf,
                cover_image=cover,
                lang='ar' if re.search(r'[\u0600-\u06FF]', title) else 'en',
                year=year,
            ).dict())
        if q:
            break
        nxt = await page.query_selector('a[rel="next"], a:has-text("التالي"), a:has-text("Next")')
        if nxt:
            h = await nxt.get_attribute('href')
            if h:
                next_url = h if h.startswith('http') else BASE + h
            else:
                next_url = None
        else:
            next_url = None
    return results

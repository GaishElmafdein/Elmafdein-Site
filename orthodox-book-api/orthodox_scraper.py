#!/usr/bin/env python3
"""
Orthodox Book Scraper - Python + Playwright Integration
جيش المفديين (Army of the Redeemed) - Sacred Book Collection System

This script scrapes Orthodox Christian books from:
1. https://coptic-treasures.com/sections/books/
2. https://www.christianlib.com/

Features:
- Dynamic search with keyword filtering
- Pagination handling for complete data collection
- FastAPI integration for Next.js frontend
- CLI interface for manual execution
- Automatic PDF downloads
- Anti-detection measures
- UTF-8 Arabic/English support
"""

import asyncio
import json
import re
import argparse
import os
import sys
import time
import random
from urllib.parse import urljoin, urlparse, parse_qs
from pathlib import Path
from typing import List, Dict, Optional, Any
import logging

from playwright.async_api import async_playwright, Page, Browser
from fake_useragent import UserAgent
import requests

# Configure logging with proper encoding for Windows
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('orthodox_scraper.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class OrthodoxBookScraper:
    """Sacred Orthodox Book Collection System"""
    
    def __init__(self, headless: bool = True, delay_range: tuple = (1, 3)):
        self.headless = headless
        self.delay_range = delay_range
        self.ua = UserAgent()
        self.downloads_dir = Path("downloads")
        self.downloads_dir.mkdir(exist_ok=True)
        
        # Sacred site configurations
        self.sites = {
            "coptic-treasures.com": {
                "base_url": "https://coptic-treasures.com",
                "books_url": "https://coptic-treasures.com/sections/books/",
                "search_url": "https://coptic-treasures.com/sections/books/?search=",
                "selectors": {
                    "book_cards": ".book-item, .item, .book, article, .post",
                    "title": "h3, h2, .title, .book-title, a[href*='book']",
                    "author": ".author, .by, .writer, p:contains('Author')",
                    "link": "a[href*='book'], a[href*='download']",
                    "cover": "img",
                    "next_page": ".next, .pagination a:last-child, [rel='next']"
                }
            },
            "christianlib.com": {
                "base_url": "https://www.christianlib.com",
                "books_url": "https://www.christianlib.com/",
                "search_url": "https://www.christianlib.com/search?q=",
                "selectors": {
                    "book_cards": ".book-item, .item, .book, article, .post, .entry",
                    "title": "h3, h2, .title, .book-title, a[href*='book']",
                    "author": ".author, .by, .writer, .meta",
                    "link": "a[href*='book'], a[href*='download'], a",
                    "cover": "img",
                    "next_page": ".next, .pagination a:last-child, [rel='next']"
                }
            }
        }
    
    async def get_random_user_agent(self) -> str:
        """Generate random user agent for anti-detection"""
        try:
            return self.ua.random
        except:
            return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    
    async def sacred_delay(self):
        """Sacred pause between requests to avoid detection"""
        delay = random.uniform(*self.delay_range)
        logger.info(f"🙏 Sacred pause for {delay:.2f} seconds...")
        await asyncio.sleep(delay)
    
    async def setup_page(self, page: Page) -> None:
        """Configure page with anti-detection measures"""
        user_agent = await self.get_random_user_agent()
        await page.set_extra_http_headers({
            'User-Agent': user_agent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5,ar;q=0.3',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        
        # Set viewport
        await page.set_viewport_size({"width": 1920, "height": 1080})
        
        # Block unnecessary resources for faster scraping
        await page.route("**/*.{png,jpg,jpeg,gif,svg,css,woff,woff2}", lambda route: route.abort())
    
    async def extract_book_data(self, page: Page, site_config: Dict, site_name: str) -> List[Dict]:
        """Extract book data from a page using site-specific selectors"""
        books = []
        
        try:
            # Wait for content to load
            await page.wait_for_load_state('domcontentloaded')
            await asyncio.sleep(2)
            
            # Try multiple selectors for book cards
            book_elements = []
            for selector in site_config["selectors"]["book_cards"].split(", "):
                try:
                    elements = await page.query_selector_all(selector.strip())
                    if elements:
                        book_elements = elements
                        logger.info(f"✅ Found {len(elements)} books using selector: {selector}")
                        break
                except Exception as e:
                    logger.debug(f"Selector {selector} failed: {e}")
                    continue
            
            if not book_elements:
                # Fallback: extract all links that might be books
                book_elements = await page.query_selector_all("a[href*='book'], a[href*='download'], article, .item")
                logger.info(f"📚 Fallback: Found {len(book_elements)} potential book elements")
            
            for element in book_elements:
                try:
                    book_data = await self.extract_single_book(element, site_config, site_name, page)
                    if book_data and book_data.get("title"):
                        books.append(book_data)
                        logger.info(f"📖 Extracted: {book_data['title'][:50]}...")
                except Exception as e:
                    logger.debug(f"Error extracting book: {e}")
                    continue
            
            logger.info(f"🏛️ Extracted {len(books)} books from {site_name}")
            
        except Exception as e:
            logger.error(f"❌ Error extracting books from {site_name}: {e}")
        
        return books
    
    async def extract_single_book(self, element, site_config: Dict, site_name: str, page: Page) -> Optional[Dict]:
        """Extract data from a single book element"""
        try:
            book = {
                "title": "",
                "author": "",
                "source": site_name,
                "details_url": "",
                "download_url": "",
                "cover_image": ""
            }
            
            # Extract title
            title_selectors = site_config["selectors"]["title"].split(", ")
            for selector in title_selectors:
                try:
                    title_elem = await element.query_selector(selector.strip())
                    if title_elem:
                        title = await title_elem.inner_text()
                        if title and title.strip():
                            book["title"] = title.strip()
                            break
                except:
                    continue
            
            # If no title in child elements, try element text
            if not book["title"]:
                try:
                    text = await element.inner_text()
                    if text and len(text.strip()) > 3:
                        book["title"] = text.strip()[:100]  # Limit title length
                except:
                    pass
            
            # Extract author
            author_selectors = site_config["selectors"]["author"].split(", ")
            for selector in author_selectors:
                try:
                    author_elem = await element.query_selector(selector.strip())
                    if author_elem:
                        author = await author_elem.inner_text()
                        if author and author.strip():
                            book["author"] = author.strip()
                            break
                except:
                    continue
            
            # Extract link
            link_selectors = site_config["selectors"]["link"].split(", ")
            for selector in link_selectors:
                try:
                    link_elem = await element.query_selector(selector.strip())
                    if link_elem:
                        href = await link_elem.get_attribute("href")
                        if href:
                            full_url = urljoin(site_config["base_url"], href)
                            book["details_url"] = full_url
                            
                            # Check if it's a direct PDF link
                            if href.lower().endswith('.pdf'):
                                book["download_url"] = full_url
                            break
                except:
                    continue
            
            # If element itself is a link
            if not book["details_url"]:
                try:
                    href = await element.get_attribute("href")
                    if href:
                        book["details_url"] = urljoin(site_config["base_url"], href)
                        if href.lower().endswith('.pdf'):
                            book["download_url"] = book["details_url"]
                except:
                    pass
            
            # Extract cover image
            try:
                img_elem = await element.query_selector("img")
                if img_elem:
                    src = await img_elem.get_attribute("src")
                    if src:
                        book["cover_image"] = urljoin(site_config["base_url"], src)
            except:
                pass
            
            # Clean and validate data
            if book["title"]:
                book["title"] = self.clean_text(book["title"])
                book["author"] = self.clean_text(book["author"]) if book["author"] else "Unknown Author"
                
                # Set default author if empty
                if not book["author"] or book["author"] == "Unknown Author":
                    if "coptic" in site_name.lower():
                        book["author"] = "Coptic Orthodox Church"
                    else:
                        book["author"] = "Christian Library"
                
                return book
            
        except Exception as e:
            logger.debug(f"Error extracting single book: {e}")
        
        return None
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text for UTF-8 Arabic/English"""
        if not text:
            return ""
        
        # Remove extra whitespace and newlines
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Remove common prefixes/suffixes
        text = re.sub(r'^(book|كتاب|by|بواسطة|author|مؤلف):\s*', '', text, flags=re.IGNORECASE)
        text = re.sub(r'\s*-\s*(download|تحميل|pdf)$', '', text, flags=re.IGNORECASE)
        
        return text.strip()
    
    async def search_site(self, browser: Browser, site_name: str, keyword: str = "") -> List[Dict]:
        """Search a specific site for books"""
        site_config = self.sites[site_name]
        books = []
        
        try:
            page = await browser.new_page()
            await self.setup_page(page)
            
            # Determine URL based on search keyword
            if keyword:
                search_url = f"{site_config['search_url']}{keyword}"
                logger.info(f"🔍 Searching {site_name} for: '{keyword}'")
            else:
                search_url = site_config["books_url"]
                logger.info(f"📚 Scraping all books from {site_name}")
            
            page_num = 1
            max_pages = 10  # Prevent infinite loops
            
            while page_num <= max_pages:
                try:
                    logger.info(f"📄 Scraping page {page_num} from {site_name}")
                    
                    # Navigate to page
                    await page.goto(search_url, wait_until='domcontentloaded', timeout=30000)
                    await self.sacred_delay()
                    
                    # Extract books from current page
                    page_books = await self.extract_book_data(page, site_config, site_name)
                    
                    if not page_books:
                        logger.info(f"⚠️ No books found on page {page_num}, stopping pagination")
                        break
                    
                    books.extend(page_books)
                    
                    # Look for next page link
                    next_selectors = site_config["selectors"]["next_page"].split(", ")
                    next_url = None
                    
                    for selector in next_selectors:
                        try:
                            next_elem = await page.query_selector(selector.strip())
                            if next_elem:
                                href = await next_elem.get_attribute("href")
                                if href and href != search_url:
                                    next_url = urljoin(site_config["base_url"], href)
                                    break
                        except:
                            continue
                    
                    if not next_url:
                        logger.info(f"✅ No more pages found for {site_name}")
                        break
                    
                    search_url = next_url
                    page_num += 1
                    
                except Exception as e:
                    logger.error(f"❌ Error on page {page_num} of {site_name}: {e}")
                    break
            
            await page.close()
            logger.info(f"🏛️ Completed scraping {site_name}: {len(books)} books found")
            
        except Exception as e:
            logger.error(f"❌ Fatal error scraping {site_name}: {e}")
        
        return books
    
    async def search_books(self, keyword: str = "", sites: List[str] = None) -> List[Dict]:
        """Search for books across all configured sites"""
        if sites is None:
            sites = list(self.sites.keys())
        
        all_books = []
        
        logger.info(f"🕊️ Starting Orthodox book search...")
        logger.info(f"📖 Keyword: '{keyword}' | Sites: {', '.join(sites)}")
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=self.headless,
                args=[
                    '--no-sandbox',
                    '--disable-blink-features=AutomationControlled',
                    '--disable-extensions',
                    '--disable-dev-shm-usage'
                ]
            )
            
            try:
                # Search each site
                tasks = []
                for site_name in sites:
                    if site_name in self.sites:
                        task = self.search_site(browser, site_name, keyword)
                        tasks.append(task)
                
                # Execute searches concurrently
                results = await asyncio.gather(*tasks, return_exceptions=True)
                
                for i, result in enumerate(results):
                    if isinstance(result, Exception):
                        logger.error(f"❌ Site {sites[i]} failed: {result}")
                    else:
                        all_books.extend(result)
                
            finally:
                await browser.close()
        
        # Remove duplicates based on title and source
        unique_books = []
        seen = set()
        
        for book in all_books:
            key = (book.get("title", "").lower(), book.get("source", ""))
            if key not in seen and book.get("title"):
                seen.add(key)
                unique_books.append(book)
        
        logger.info(f"✝️ Sacred mission complete! Found {len(unique_books)} unique Orthodox books")
        return unique_books
    
    async def download_pdf(self, book: Dict) -> bool:
        """Download PDF file for a book"""
        try:
            download_url = book.get("download_url")
            if not download_url:
                logger.warning(f"⚠️ No download URL for: {book.get('title', 'Unknown')}")
                return False
            
            # Create safe filename
            title = book.get("title", "unknown")
            safe_title = re.sub(r'[^\w\s-]', '', title)[:50]
            filename = f"{safe_title}.pdf"
            filepath = self.downloads_dir / filename
            
            logger.info(f"⬇️ Downloading: {title}")
            
            headers = {
                'User-Agent': await self.get_random_user_agent(),
                'Accept': 'application/pdf,*/*',
                'Referer': book.get("details_url", "")
            }
            
            response = requests.get(download_url, headers=headers, stream=True, timeout=30)
            response.raise_for_status()
            
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            logger.info(f"✅ Downloaded: {filepath}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Download failed for {book.get('title', 'Unknown')}: {e}")
            return False
    
    def save_results(self, books: List[Dict], filename: str = "orthodox_books.json"):
        """Save search results to JSON file"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(books, f, ensure_ascii=False, indent=2)
            logger.info(f"💾 Results saved to {filename}")
        except Exception as e:
            logger.error(f"❌ Failed to save results: {e}")

async def main():
    """CLI interface for the Orthodox Book Scraper"""
    parser = argparse.ArgumentParser(
        description="🕊️ Orthodox Book Scraper - جيش المفديين Sacred Collection System"
    )
    
    parser.add_argument(
        '--keyword', '-k',
        type=str,
        default="",
        help="Search keyword (leave empty to scrape all books)"
    )
    
    parser.add_argument(
        '--site', '-s',
        choices=['coptic-treasures.com', 'christianlib.com'],
        help="Limit search to specific site"
    )
    
    parser.add_argument(
        '--download', '-d',
        action='store_true',
        help="Download all found PDFs"
    )
    
    parser.add_argument(
        '--headless',
        action='store_true',
        default=True,
        help="Run browser in headless mode (default: True)"
    )
    
    parser.add_argument(
        '--visible',
        action='store_true',
        help="Run browser in visible mode for debugging"
    )
    
    parser.add_argument(
        '--output', '-o',
        type=str,
        default="orthodox_books.json",
        help="Output JSON filename"
    )
    
    args = parser.parse_args()
    
    # Determine headless mode
    headless = args.headless and not args.visible
    
    # Determine sites to search
    sites = [args.site] if args.site else None
    
    # Initialize scraper
    scraper = OrthodoxBookScraper(headless=headless)
    
    try:
        # Search for books
        books = await scraper.search_books(keyword=args.keyword, sites=sites)
        
        if not books:
            print("❌ No books found matching your criteria")
            return
        
        # Save results
        scraper.save_results(books, args.output)
        
        # Display summary
        print(f"\n✝️ Sacred Search Complete!")
        print(f"📚 Found {len(books)} Orthodox books")
        print(f"💾 Results saved to: {args.output}")
        
        # Show first few results
        print(f"\n📖 Sample Results:")
        for i, book in enumerate(books[:5]):
            print(f"{i+1}. {book['title']} - {book['author']} ({book['source']})")
        
        if len(books) > 5:
            print(f"... and {len(books) - 5} more books")
        
        # Download PDFs if requested
        if args.download:
            print(f"\n⬇️ Starting PDF downloads...")
            downloaded = 0
            for book in books:
                if await scraper.download_pdf(book):
                    downloaded += 1
            print(f"✅ Downloaded {downloaded}/{len(books)} PDFs")
    
    except KeyboardInterrupt:
        print("\n⛔ Search interrupted by user")
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())

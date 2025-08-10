"""
Base scraper functionality for Orthodox book sites.
Shared helpers for HTML fetching, parsing, retries, and user agent rotation.
"""

import asyncio
import random
import re
import logging
from typing import Optional, Dict, Any, List
from urllib.parse import urljoin, urlparse

from playwright.async_api import async_playwright, Browser, Page, TimeoutError as PlaywrightTimeoutError
import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

# User agents for rotation
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1.2 Safari/605.1.15"
]

def parse_number(text: str) -> Optional[float]:
    """
    Extract numbers from text like 'MB 8.5', '580 صفحة', '5.2 MB', etc.
    
    Args:
        text: Text containing a number
        
    Returns:
        Parsed number or None if not found
    """
    if not text:
        return None
    
    # Remove common Arabic and English words, keep numbers and decimals
    cleaned = re.sub(r'[^\d.\u0660-\u0669]', ' ', str(text))
    
    # Convert Arabic-Indic digits to ASCII
    arabic_to_ascii = str.maketrans('٠١٢٣٤٥٦٧٨٩', '0123456789')
    cleaned = cleaned.translate(arabic_to_ascii)
    
    # Find all numbers
    numbers = re.findall(r'\d+\.?\d*', cleaned)
    
    if numbers:
        try:
            return float(numbers[0])
        except ValueError:
            pass
    
    return None

def detect_language(text: str) -> str:
    """
    Detect if text is Arabic, English, or unknown.
    
    Args:
        text: Text to analyze
        
    Returns:
        "ar", "en", or "unknown"
    """
    if not text:
        return "unknown"
    
    # Count Arabic characters
    arabic_chars = len(re.findall(r'[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]', text))
    # Count Latin characters
    latin_chars = len(re.findall(r'[A-Za-z]', text))
    
    total_chars = arabic_chars + latin_chars
    if total_chars == 0:
        return "unknown"
    
    arabic_ratio = arabic_chars / total_chars
    
    if arabic_ratio > 0.3:
        return "ar"
    elif latin_chars > arabic_chars:
        return "en"
    else:
        return "unknown"

def normalize_url(url: str, base_url: str) -> str:
    """
    Normalize and resolve relative URLs.
    
    Args:
        url: URL to normalize
        base_url: Base URL for relative resolution
        
    Returns:
        Absolute normalized URL
    """
    if not url:
        return ""
    
    # Remove whitespace and quotes
    url = url.strip().strip('\'"')
    
    # Resolve relative URLs
    if url.startswith(('http://', 'https://')):
        return url
    else:
        return urljoin(base_url, url)

class BaseScraper:
    """
    Base scraper class with common functionality for Orthodox book sites.
    """
    
    def __init__(self, site_name: str, base_url: str):
        self.site_name = site_name
        self.base_url = base_url
        self.browser: Optional[Browser] = None
        self.playwright = None
        
    async def initialize(self):
        """Initialize Playwright browser"""
        try:
            self.playwright = await async_playwright().start()
            self.browser = await self.playwright.chromium.launch(
                headless=True,
                args=[
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-blink-features=AutomationControlled'
                ]
            )
            logger.info(f"🌐 Initialized {self.site_name} scraper browser")
        except Exception as e:
            logger.error(f"❌ Failed to initialize {self.site_name} browser: {e}")
            raise
    
    async def cleanup(self):
        """Cleanup browser resources"""
        try:
            if self.browser:
                await self.browser.close()
            if self.playwright:
                await self.playwright.stop()
            logger.info(f"🧹 Cleaned up {self.site_name} scraper")
        except Exception as e:
            logger.error(f"❌ Error cleaning up {self.site_name}: {e}")
    
    async def fetch_html(self, url: str, retries: int = 3) -> Optional[str]:
        """
        Fetch HTML content with retries and error handling.
        
        Args:
            url: URL to fetch
            retries: Number of retry attempts
            
        Returns:
            HTML content or None if failed
        """
        for attempt in range(retries):
            try:
                if not self.browser:
                    raise Exception("Browser not initialized")
                
                # Create new page with random user agent
                page = await self.browser.new_page()
                user_agent = random.choice(USER_AGENTS)
                await page.set_user_agent(user_agent)
                
                # Add random delay to avoid detection
                delay = random.randint(250, 800)
                await asyncio.sleep(delay / 1000)
                
                # Navigate to page with timeout
                logger.debug(f"🔄 Fetching {url} (attempt {attempt + 1}/{retries})")
                await page.goto(url, wait_until="domcontentloaded", timeout=15000)
                
                # Wait for content to load
                await page.wait_for_timeout(1000)
                
                # Get page content
                content = await page.content()
                await page.close()
                
                logger.debug(f"✅ Successfully fetched {url}")
                return content
                
            except PlaywrightTimeoutError:
                logger.warning(f"⏰ Timeout fetching {url} (attempt {attempt + 1}/{retries})")
                if page:
                    await page.close()
            except Exception as e:
                logger.warning(f"❌ Error fetching {url} (attempt {attempt + 1}/{retries}): {e}")
                if page:
                    await page.close()
            
            # Exponential backoff
            if attempt < retries - 1:
                wait_time = (2 ** attempt) + random.uniform(0, 1)
                await asyncio.sleep(wait_time)
        
        logger.error(f"🚫 Failed to fetch {url} after {retries} attempts")
        return None
    
    def parse_html(self, html: str) -> BeautifulSoup:
        """
        Parse HTML content with BeautifulSoup.
        
        Args:
            html: HTML content to parse
            
        Returns:
            BeautifulSoup object
        """
        return BeautifulSoup(html, 'html.parser')
    
    def extract_text(self, element, default: str = "") -> str:
        """
        Safely extract text from a BeautifulSoup element.
        
        Args:
            element: BeautifulSoup element
            default: Default value if extraction fails
            
        Returns:
            Cleaned text content
        """
        if not element:
            return default
        
        try:
            text = element.get_text(strip=True)
            return text if text else default
        except Exception:
            return default
    
    def extract_attribute(self, element, attr: str, default: str = "") -> str:
        """
        Safely extract attribute from a BeautifulSoup element.
        
        Args:
            element: BeautifulSoup element
            attr: Attribute name
            default: Default value if extraction fails
            
        Returns:
            Attribute value
        """
        if not element:
            return default
        
        try:
            value = element.get(attr)
            return value if value else default
        except Exception:
            return default
    
    def find_pdf_links(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """
        Find all PDF download links in a page.
        
        Args:
            soup: BeautifulSoup object
            base_url: Base URL for relative links
            
        Returns:
            List of PDF URLs
        """
        pdf_links = []
        
        # Look for links containing 'pdf' in href or text
        for link in soup.find_all('a', href=True):
            href = link.get('href', '')
            text = link.get_text().lower()
            
            if '.pdf' in href.lower() or 'pdf' in text or 'تحميل' in text or 'download' in text.lower():
                pdf_url = normalize_url(href, base_url)
                if pdf_url and pdf_url not in pdf_links:
                    pdf_links.append(pdf_url)
        
        return pdf_links
    
    def find_images(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """
        Find all relevant images (potential book covers).
        
        Args:
            soup: BeautifulSoup object
            base_url: Base URL for relative links
            
        Returns:
            List of image URLs
        """
        images = []
        
        # Look for img tags
        for img in soup.find_all('img'):
            src = img.get('src') or img.get('data-src')
            if src:
                img_url = normalize_url(src, base_url)
                if img_url and img_url not in images:
                    # Filter out common non-book images
                    if not any(skip in img_url.lower() for skip in ['logo', 'icon', 'button', 'arrow']):
                        images.append(img_url)
        
        return images
    
    async def search_books(self, query: str, download: bool = False) -> List[Any]:
        """
        Search for books with a specific query.
        Must be implemented by subclasses.
        
        Args:
            query: Search query
            download: Whether to download PDF files
            
        Returns:
            List of Book objects
        """
        raise NotImplementedError("Subclasses must implement search_books")
    
    async def fetch_all_books(self, download: bool = False) -> List[Any]:
        """
        Fetch all available books (paginated).
        Must be implemented by subclasses.
        
        Args:
            download: Whether to download PDF files
            
        Returns:
            List of Book objects
        """
        raise NotImplementedError("Subclasses must implement fetch_all_books")

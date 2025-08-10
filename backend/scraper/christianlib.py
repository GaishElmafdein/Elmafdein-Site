"""
ChristianLib scraper for Orthodox books.
Handles https://www.christianlib.com/
"""

import logging
import re
from typing import List, Optional
from urllib.parse import urljoin, urlparse

from ..models import Book
from .base import BaseScraper, detect_language, parse_number, normalize_url

logger = logging.getLogger(__name__)

class ChristianLibScraper(BaseScraper):
    """
    Scraper for ChristianLib Orthodox books website.
    """
    
    def __init__(self):
        super().__init__(
            site_name="ChristianLib",
            base_url="https://www.christianlib.com"
        )
    
    async def search_books(self, query: str, download: bool = False) -> List[Book]:
        """
        Search for books on ChristianLib with a specific query.
        
        Args:
            query: Search query
            download: Whether to download PDF files
            
        Returns:
            List of Book objects matching the query
        """
        logger.info(f"🔍 Searching ChristianLib for: '{query}'")
        
        try:
            # Try using the site's search functionality first
            search_url = f"https://www.christianlib.com/search/?q={query}"
            
            html = await self.fetch_html(search_url)
            if html:
                soup = self.parse_html(html)
                books = await self._parse_search_results(soup, download=download)
                if books:
                    logger.info(f"✅ Found {len(books)} books via search on ChristianLib")
                    return books
            
            # Fallback: get all books and filter
            logger.info("🔄 Search failed, falling back to filtering all books")
            all_books = await self.fetch_all_books(download=download)
            
            # Filter books by query (case-insensitive, supports Arabic and English)
            query_lower = query.lower()
            filtered_books = []
            
            for book in all_books:
                # Search in title and author
                if (query_lower in book.title.lower() or 
                    (book.author and query_lower in book.author.lower())):
                    filtered_books.append(book)
            
            logger.info(f"✅ Found {len(filtered_books)} books matching '{query}' on ChristianLib")
            return filtered_books
            
        except Exception as e:
            logger.error(f"❌ Error searching ChristianLib: {e}")
            return []
    
    async def fetch_all_books(self, download: bool = False) -> List[Book]:
        """
        Fetch all books from ChristianLib.
        
        Args:
            download: Whether to download PDF files
            
        Returns:
            List of all Book objects
        """
        logger.info("📚 Fetching all books from ChristianLib")
        
        books = []
        
        try:
            # Common book section URLs to try
            book_urls = [
                "https://www.christianlib.com/books/",
                "https://www.christianlib.com/library/",
                "https://www.christianlib.com/ebooks/",
                "https://www.christianlib.com/pdf/",
                "https://www.christianlib.com/categories/books/",
                "https://www.christianlib.com/"
            ]
            
            for base_url in book_urls:
                try:
                    page_books = await self._fetch_books_from_url(base_url, download=download)
                    if page_books:
                        books.extend(page_books)
                        logger.info(f"✅ Found {len(page_books)} books from {base_url}")
                        break  # Stop after finding the first working URL
                except Exception as e:
                    logger.debug(f"⚠️ Could not fetch from {base_url}: {e}")
                    continue
            
            # Remove duplicates based on title and author
            unique_books = []
            seen = set()
            
            for book in books:
                key = (book.title.lower(), (book.author or "").lower())
                if key not in seen:
                    seen.add(key)
                    unique_books.append(book)
            
            logger.info(f"✅ Total unique books fetched from ChristianLib: {len(unique_books)}")
            return unique_books
            
        except Exception as e:
            logger.error(f"❌ Error fetching books from ChristianLib: {e}")
            return []
    
    async def _fetch_books_from_url(self, url: str, download: bool = False) -> List[Book]:
        """
        Fetch books from a specific URL with pagination.
        
        Args:
            url: Base URL to start fetching from
            download: Whether to download PDF files
            
        Returns:
            List of Book objects
        """
        books = []
        page_num = 1
        
        while True:
            # Construct page URL
            if page_num == 1:
                page_url = url
            else:
                # Try different pagination patterns
                page_url = f"{url}page/{page_num}/" if url.endswith('/') else f"{url}/page/{page_num}/"
            
            logger.debug(f"📄 Fetching ChristianLib page {page_num} from {page_url}")
            
            # Fetch page HTML
            html = await self.fetch_html(page_url)
            if not html:
                logger.debug(f"⚠️ Could not fetch page {page_num}")
                break
            
            # Parse HTML
            soup = self.parse_html(html)
            
            # Find book entries - try multiple selectors
            book_entries = (
                soup.find_all('article') or
                soup.find_all('div', class_=re.compile(r'book|item|entry|post|product')) or
                soup.find_all('li', class_=re.compile(r'book|item|entry')) or
                soup.find_all('div', class_=re.compile(r'card|box|container'))
            )
            
            if not book_entries:
                # Fallback: look for links that might lead to books
                book_entries = soup.find_all('a', href=re.compile(r'book|pdf|download|library'))
                if book_entries:
                    # Convert links to pseudo-entries
                    book_entries = [soup.new_tag('div').append(link) or soup.new_tag('div') for link in book_entries]
            
            page_books = []
            for entry in book_entries:
                try:
                    book = await self._parse_book_entry(entry, download=download)
                    if book:
                        page_books.append(book)
                except Exception as e:
                    logger.debug(f"⚠️ Error parsing book entry: {e}")
                    continue
            
            if not page_books:
                logger.debug(f"📄 No books found on page {page_num}")
                break
            
            books.extend(page_books)
            logger.debug(f"✅ Found {len(page_books)} books on page {page_num}")
            
            # Check for next page
            next_link = (
                soup.find('a', string=re.compile(r'next|التالي|→|>|more')) or
                soup.find('a', class_=re.compile(r'next|forward|more')) or
                soup.find('link', rel='next')
            )
            
            if not next_link:
                logger.debug("📄 No next page found, stopping pagination")
                break
            
            page_num += 1
            
            # Safety limit
            if page_num > 20:
                logger.warning("🚫 Reached page limit (20), stopping")
                break
        
        return books
    
    async def _parse_search_results(self, soup, download: bool = False) -> List[Book]:
        """
        Parse search results from ChristianLib search page.
        
        Args:
            soup: BeautifulSoup object of search results page
            download: Whether to download PDF files
            
        Returns:
            List of Book objects
        """
        books = []
        
        # Find search result entries
        result_entries = (
            soup.find_all('div', class_=re.compile(r'result|search')) or
            soup.find_all('li', class_=re.compile(r'result|search')) or
            soup.find_all('article') or
            soup.find_all('div', class_=re.compile(r'book|item|entry'))
        )
        
        for entry in result_entries:
            try:
                book = await self._parse_book_entry(entry, download=download)
                if book:
                    books.append(book)
            except Exception as e:
                logger.debug(f"⚠️ Error parsing search result: {e}")
                continue
        
        return books
    
    async def _parse_book_entry(self, entry, download: bool = False) -> Optional[Book]:
        """
        Parse a single book entry from the HTML.
        
        Args:
            entry: BeautifulSoup element containing book info
            download: Whether to download PDF files
            
        Returns:
            Book object or None if parsing fails
        """
        try:
            # Extract title - try multiple selectors
            title_element = (
                entry.find('h1') or entry.find('h2') or entry.find('h3') or
                entry.find('h4') or entry.find('h5') or entry.find('h6') or
                entry.find('a') or entry.find(class_=re.compile(r'title|name|heading')) or
                entry.find('strong') or entry.find('b')
            )
            
            title = self.extract_text(title_element)
            if not title:
                # Try getting text from the entry itself if no specific title found
                title = self.extract_text(entry)
                if not title or len(title) > 200:  # Too long, probably not a title
                    return None
            
            # Clean title
            title = re.sub(r'\s+', ' ', title).strip()
            title = re.sub(r'(تحميل|download|pdf|كتاب|book)[\s:]*', '', title, flags=re.IGNORECASE).strip()
            
            if not title or len(title) < 3:
                return None
            
            # Extract author - look for author-related elements
            author_element = (
                entry.find(class_=re.compile(r'author|writer|مؤلف|كاتب')) or
                entry.find('span', string=re.compile(r'by |بقلم|تأليف|للكاتب')) or
                entry.find('div', string=re.compile(r'author|مؤلف|كاتب'))
            )
            
            author = self.extract_text(author_element) if author_element else None
            if author:
                # Clean author text
                author = re.sub(r'(by |بقلم|تأليف|للكاتب|author:?)', '', author, flags=re.IGNORECASE).strip()
                author = re.sub(r'\s+', ' ', author).strip()
                if not author or len(author) < 2:
                    author = None
            
            # Extract details URL
            link_element = entry.find('a', href=True)
            details_url = ""
            if link_element:
                href = link_element.get('href')
                details_url = normalize_url(href, self.base_url)
            
            # Extract cover image
            img_element = entry.find('img')
            cover_image = None
            if img_element:
                img_src = img_element.get('src') or img_element.get('data-src')
                if img_src:
                    cover_image = normalize_url(img_src, self.base_url)
            
            # Extract download URL
            download_url = None
            
            # Look for direct PDF links in the entry
            pdf_links = self.find_pdf_links(self.parse_html(str(entry)), self.base_url)
            if pdf_links:
                download_url = pdf_links[0]
            
            # If no direct PDF link and we have a details URL, fetch the details page
            if not download_url and details_url:
                try:
                    details_html = await self.fetch_html(details_url)
                    if details_html:
                        details_soup = self.parse_html(details_html)
                        pdf_links = self.find_pdf_links(details_soup, self.base_url)
                        if pdf_links:
                            download_url = pdf_links[0]
                except Exception as e:
                    logger.debug(f"Could not fetch details for {title}: {e}")
            
            # Detect language
            lang = detect_language(title)
            
            # Extract pages and size if available
            pages = None
            size_mb = None
            
            # Look for size/pages info in entry text
            entry_text = self.extract_text(entry)
            
            # Parse pages (look for patterns like "580 صفحة" or "120 pages")
            pages_match = re.search(r'(\d+)\s*(?:صفحة|pages?|ص|pg)', entry_text, re.IGNORECASE)
            if pages_match:
                pages = int(pages_match.group(1))
            
            # Parse size (look for patterns like "8.5 MB" or "5.2 ميجا")
            size_match = re.search(r'(\d+\.?\d*)\s*(?:MB|mb|ميجا|mega)', entry_text, re.IGNORECASE)
            if size_match:
                size_mb = float(size_match.group(1))
            
            # Create Book object
            book = Book(
                title=title,
                author=author,
                source="christianlib.com",
                details_url=details_url,
                download_url=download_url,
                cover_image=cover_image,
                lang=lang,
                pages=pages,
                size_mb=size_mb
            )
            
            logger.debug(f"📖 Parsed book: {title} ({lang})")
            return book
            
        except Exception as e:
            logger.warning(f"⚠️ Error parsing book entry: {e}")
            return None

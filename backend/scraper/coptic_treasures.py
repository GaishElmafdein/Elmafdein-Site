"""
Coptic Treasures scraper for Orthodox books.
Handles https://coptic-treasures.com/sections/books/
"""

import logging
import re
from typing import List, Optional
from urllib.parse import urljoin

from ..models import Book
from .base import BaseScraper, detect_language, parse_number, normalize_url

logger = logging.getLogger(__name__)

class CopticTreasuresScraper(BaseScraper):
    """
    Scraper for Coptic Treasures Orthodox books website.
    """
    
    def __init__(self):
        super().__init__(
            site_name="Coptic Treasures",
            base_url="https://coptic-treasures.com"
        )
    
    async def search_books(self, query: str, download: bool = False) -> List[Book]:
        """
        Search for books on Coptic Treasures with a specific query.
        
        Args:
            query: Search query
            download: Whether to download PDF files
            
        Returns:
            List of Book objects matching the query
        """
        logger.info(f"🔍 Searching Coptic Treasures for: '{query}'")
        
        try:
            # First get all books, then filter by query
            all_books = await self.fetch_all_books(download=download)
            
            # Filter books by query (case-insensitive, supports Arabic and English)
            query_lower = query.lower()
            filtered_books = []
            
            for book in all_books:
                # Search in title and author
                if (query_lower in book.title.lower() or 
                    (book.author and query_lower in book.author.lower())):
                    filtered_books.append(book)
            
            logger.info(f"✅ Found {len(filtered_books)} books matching '{query}' on Coptic Treasures")
            return filtered_books
            
        except Exception as e:
            logger.error(f"❌ Error searching Coptic Treasures: {e}")
            return []
    
    async def fetch_all_books(self, download: bool = False) -> List[Book]:
        """
        Fetch all books from Coptic Treasures books section.
        
        Args:
            download: Whether to download PDF files
            
        Returns:
            List of all Book objects
        """
        logger.info("📚 Fetching all books from Coptic Treasures")
        
        books = []
        page_num = 1
        
        try:
            while True:
                # Construct page URL
                if page_num == 1:
                    page_url = "https://coptic-treasures.com/sections/books/"
                else:
                    page_url = f"https://coptic-treasures.com/sections/books/page/{page_num}/"
                
                logger.debug(f"📄 Fetching Coptic Treasures page {page_num}")
                
                # Fetch page HTML
                html = await self.fetch_html(page_url)
                if not html:
                    logger.warning(f"⚠️ Could not fetch page {page_num}")
                    break
                
                # Parse HTML
                soup = self.parse_html(html)
                
                # Find book entries - try multiple selectors
                book_entries = (
                    soup.find_all('article') or
                    soup.find_all('div', class_=re.compile(r'book|item|entry|post')) or
                    soup.find_all('div', class_=re.compile(r'card|product'))
                )
                
                if not book_entries:
                    logger.debug(f"🔍 No book entries found on page {page_num}, trying alternative selectors")
                    # Fallback: look for any div with links that might be books
                    book_entries = soup.find_all('div', recursive=True)
                    book_entries = [entry for entry in book_entries if entry.find('a')]
                
                page_books = []
                for entry in book_entries:
                    try:
                        book = await self._parse_book_entry(entry, download=download)
                        if book:
                            page_books.append(book)
                    except Exception as e:
                        logger.warning(f"⚠️ Error parsing book entry: {e}")
                        continue
                
                if not page_books:
                    logger.info(f"📄 No more books found on page {page_num}")
                    break
                
                books.extend(page_books)
                logger.info(f"✅ Found {len(page_books)} books on page {page_num}")
                
                # Check for next page
                next_link = (
                    soup.find('a', string=re.compile(r'next|التالي|→|>')) or
                    soup.find('a', class_=re.compile(r'next|forward')) or
                    soup.find('link', rel='next')
                )
                
                if not next_link:
                    logger.info("📄 No next page found, stopping pagination")
                    break
                
                page_num += 1
                
                # Safety limit
                if page_num > 50:
                    logger.warning("🚫 Reached page limit (50), stopping")
                    break
            
            logger.info(f"✅ Total books fetched from Coptic Treasures: {len(books)}")
            return books
            
        except Exception as e:
            logger.error(f"❌ Error fetching books from Coptic Treasures: {e}")
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
                entry.find('a') or entry.find(class_=re.compile(r'title|name'))
            )
            
            title = self.extract_text(title_element)
            if not title:
                return None
            
            # Clean title
            title = re.sub(r'\s+', ' ', title).strip()
            
            # Extract author - look for author-related elements
            author_element = (
                entry.find(class_=re.compile(r'author|writer|مؤلف')) or
                entry.find('span', string=re.compile(r'by |بقلم|تأليف')) or
                entry.find('div', string=re.compile(r'author|مؤلف'))
            )
            
            author = self.extract_text(author_element) if author_element else None
            if author:
                # Clean author text
                author = re.sub(r'(by |بقلم|تأليف|author:?)', '', author, flags=re.IGNORECASE).strip()
                author = re.sub(r'\s+', ' ', author).strip()
                if not author:
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
            
            # Extract download URL by fetching details page if needed
            download_url = None
            if details_url:
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
            pages_match = re.search(r'(\d+)\s*(?:صفحة|pages?|ص)', entry_text, re.IGNORECASE)
            if pages_match:
                pages = int(pages_match.group(1))
            
            # Parse size (look for patterns like "8.5 MB" or "MB 5.2")
            size_match = re.search(r'(\d+\.?\d*)\s*(?:MB|mb|ميجا)', entry_text, re.IGNORECASE)
            if size_match:
                size_mb = float(size_match.group(1))
            
            # Create Book object
            book = Book(
                title=title,
                author=author,
                source="coptic-treasures.com",
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

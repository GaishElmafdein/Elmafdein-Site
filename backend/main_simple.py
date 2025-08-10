"""
Simple Orthodox Books API - Production Ready (Mock Version)
FastAPI backend for testing the API structure with mock data.
"""

import asyncio
import time
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any, Literal

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from models import Book, LibraryResponse, HealthResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Mock data for testing
MOCK_BOOKS = [
    Book(
        title="الكتاب المقدس - الترجمة العربية المشتركة",
        author="الكنيسة الأرثوذكسية",
        source="coptic-treasures.com",
        details_url="https://coptic-treasures.com/books/arabic-bible",
        download_url="https://coptic-treasures.com/downloads/arabic-bible.pdf",
        cover_image="https://coptic-treasures.com/images/arabic-bible.jpg",
        lang="ar",
        pages=1200,
        size_mb=25.2
    ),
    Book(
        title="The Didache - Teaching of the Twelve Apostles",
        author="Apostolic Fathers",
        source="christianlib.com",
        details_url="https://www.christianlib.com/books/didache",
        download_url="https://www.christianlib.com/downloads/didache.pdf",
        cover_image="https://www.christianlib.com/images/didache.jpg",
        lang="en",
        pages=45,
        size_mb=2.1
    ),
    Book(
        title="القداس الإلهي للقديس يوحنا ذهبي الفم",
        author="القديس يوحنا الذهبي الفم",
        source="coptic-treasures.com",
        details_url="https://coptic-treasures.com/books/divine-liturgy",
        download_url="https://coptic-treasures.com/downloads/divine-liturgy.pdf",
        cover_image="https://coptic-treasures.com/images/divine-liturgy.jpg",
        lang="ar",
        pages=85,
        size_mb=4.3
    ),
    Book(
        title="The Life of Saint Anthony",
        author="Saint Athanasius",
        source="christianlib.com",
        details_url="https://www.christianlib.com/books/life-of-anthony",
        download_url="https://www.christianlib.com/downloads/life-of-anthony.pdf",
        cover_image="https://www.christianlib.com/images/life-of-anthony.jpg",
        lang="en",
        pages=120,
        size_mb=5.8
    ),
    Book(
        title="كتاب الأجبية - الصلوات اليومية",
        author="الكنيسة القبطية الأرثوذكسية",
        source="coptic-treasures.com",
        details_url="https://coptic-treasures.com/books/agpia",
        download_url="https://coptic-treasures.com/downloads/agpia.pdf",
        cover_image="https://coptic-treasures.com/images/agpia.jpg",
        lang="ar",
        pages=350,
        size_mb=12.5
    ),
    Book(
        title="The Orthodox Faith - Volume 1: Doctrine",
        author="Fr. Thomas Hopko",
        source="christianlib.com",
        details_url="https://www.christianlib.com/books/orthodox-faith-v1",
        download_url="https://www.christianlib.com/downloads/orthodox-faith-v1.pdf",
        cover_image="https://www.christianlib.com/images/orthodox-faith-v1.jpg",
        lang="en",
        pages=200,
        size_mb=8.2
    ),
    Book(
        title="سفر يشوع بن سيراخ",
        author="يشوع بن سيراخ",
        source="coptic-treasures.com",
        details_url="https://coptic-treasures.com/books/sirach",
        download_url="https://coptic-treasures.com/downloads/sirach.pdf",
        cover_image="https://coptic-treasures.com/images/sirach.jpg",
        lang="ar",
        pages=180,
        size_mb=7.1
    ),
    Book(
        title="The Sayings of the Desert Fathers",
        author="Various Authors",
        source="christianlib.com",
        details_url="https://www.christianlib.com/books/desert-fathers",
        download_url="https://www.christianlib.com/downloads/desert-fathers.pdf",
        cover_image="https://www.christianlib.com/images/desert-fathers.jpg",
        lang="en",
        pages=280,
        size_mb=9.5
    ),
    Book(
        title="تفسير إنجيل متى - القديس يوحنا الذهبي الفم",
        author="القديس يوحنا الذهبي الفم",
        source="coptic-treasures.com",
        details_url="https://coptic-treasures.com/books/matthew-commentary",
        download_url="https://coptic-treasures.com/downloads/matthew-commentary.pdf",
        cover_image="https://coptic-treasures.com/images/matthew-commentary.jpg",
        lang="ar",
        pages=450,
        size_mb=18.7
    ),
    Book(
        title="The Philokalia - Volume 1",
        author="St. Nikodimos and St. Makarios",
        source="christianlib.com",
        details_url="https://www.christianlib.com/books/philokalia-v1",
        download_url="https://www.christianlib.com/downloads/philokalia-v1.pdf",
        cover_image="https://www.christianlib.com/images/philokalia-v1.jpg",
        lang="en",
        pages=380,
        size_mb=15.3
    ),
    Book(
        title="كتاب الدسقولية - تعاليم الرسل",
        author="الرسل الاثنا عشر",
        source="coptic-treasures.com",
        details_url="https://coptic-treasures.com/books/apostolic-constitutions",
        download_url="https://coptic-treasures.com/downloads/apostolic-constitutions.pdf",
        cover_image="https://coptic-treasures.com/images/apostolic-constitutions.jpg",
        lang="ar",
        pages=320,
        size_mb=13.8
    ),
    Book(
        title="On the Incarnation",
        author="Saint Athanasius",
        source="christianlib.com",
        details_url="https://www.christianlib.com/books/on-incarnation",
        download_url="https://www.christianlib.com/downloads/on-incarnation.pdf",
        cover_image="https://www.christianlib.com/images/on-incarnation.jpg",
        lang="en",
        pages=95,
        size_mb=4.2
    ),
    Book(
        title="السنكسار القبطي - شهر توت",
        author="الكنيسة القبطية الأرثوذكسية",
        source="coptic-treasures.com",
        details_url="https://coptic-treasures.com/books/synaxarium-tout",
        download_url="https://coptic-treasures.com/downloads/synaxarium-tout.pdf",
        cover_image="https://coptic-treasures.com/images/synaxarium-tout.jpg",
        lang="ar",
        pages=150,
        size_mb=6.9
    ),
    Book(
        title="The Ladder of Divine Ascent",
        author="Saint John Climacus",
        source="christianlib.com",
        details_url="https://www.christianlib.com/books/ladder-divine-ascent",
        download_url="https://www.christianlib.com/downloads/ladder-divine-ascent.pdf",
        cover_image="https://www.christianlib.com/images/ladder-divine-ascent.jpg",
        lang="en",
        pages=240,
        size_mb=10.1
    ),
    Book(
        title="مختارات من أقوال الآباء",
        author="آباء الكنيسة",
        source="coptic-treasures.com",
        details_url="https://coptic-treasures.com/books/fathers-sayings",
        download_url="https://coptic-treasures.com/downloads/fathers-sayings.pdf",
        cover_image="https://coptic-treasures.com/images/fathers-sayings.jpg",
        lang="ar",
        pages=220,
        size_mb=8.8
    ),
    Book(
        title="The Mystical Theology",
        author="Pseudo-Dionysius",
        source="christianlib.com",
        details_url="https://www.christianlib.com/books/mystical-theology",
        download_url="https://www.christianlib.com/downloads/mystical-theology.pdf",
        cover_image="https://www.christianlib.com/images/mystical-theology.jpg",
        lang="en",
        pages=65,
        size_mb=3.1
    ),
    Book(
        title="كتاب الخولاجي المقدس",
        author="الكنيسة القبطية الأرثوذكسية",
        source="coptic-treasures.com",
        details_url="https://coptic-treasures.com/books/kholagy",
        download_url="https://coptic-treasures.com/downloads/kholagy.pdf",
        cover_image="https://coptic-treasures.com/images/kholagy.jpg",
        lang="ar",
        pages=580,
        size_mb=24.3
    ),
    Book(
        title="The Orthodox Church",
        author="Timothy Ware (Kallistos Ware)",
        source="christianlib.com",
        details_url="https://www.christianlib.com/books/orthodox-church-ware",
        download_url="https://www.christianlib.com/downloads/orthodox-church-ware.pdf",
        cover_image="https://www.christianlib.com/images/orthodox-church-ware.jpg",
        lang="en",
        pages=350,
        size_mb=14.6
    ),
    Book(
        title="حياة القديس الأنبا أنطونيوس",
        author="القديس أثناسيوس الرسولي",
        source="coptic-treasures.com",
        details_url="https://coptic-treasures.com/books/st-anthony-arabic",
        download_url="https://coptic-treasures.com/downloads/st-anthony-arabic.pdf",
        cover_image="https://coptic-treasures.com/images/st-anthony-arabic.jpg",
        lang="ar",
        pages=135,
        size_mb=6.2
    ),
    Book(
        title="The Divine Liturgy of St. John Chrysostom",
        author="Saint John Chrysostom",
        source="christianlib.com",
        details_url="https://www.christianlib.com/books/liturgy-chrysostom",
        download_url="https://www.christianlib.com/downloads/liturgy-chrysostom.pdf",
        cover_image="https://www.christianlib.com/images/liturgy-chrysostom.jpg",
        lang="en",
        pages=75,
        size_mb=3.8
    )
]

# Simple cache
_cache = {}
_cache_timestamps = {}

app = FastAPI(
    title="Orthodox Books Search API",
    description="Production-ready API for searching and fetching Orthodox Christian books",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

def search_books(
    q: Optional[str] = None,
    site: Literal["coptic", "christian", "all"] = "all",
    force: bool = False
) -> List[Book]:
    """
    Search and filter mock books.
    """
    start_time = time.time()
    
    # Check cache first
    cache_key = f"{site}:{q or 'all'}"
    if not force and cache_key in _cache:
        cache_age = time.time() - _cache_timestamps[cache_key]
        if cache_age < 3600:  # 1 hour cache
            logger.info(f"📦 Cache hit for key: {cache_key}")
            return _cache[cache_key]
    
    # Filter by site
    filtered_books = []
    for book in MOCK_BOOKS:
        if site == "coptic" and book.source != "coptic-treasures.com":
            continue
        if site == "christian" and book.source != "christianlib.com":
            continue
        filtered_books.append(book)
    
    # Filter by query
    if q:
        query_books = []
        q_lower = q.lower()
        for book in filtered_books:
            if (q_lower in book.title.lower() or 
                (book.author and q_lower in book.author.lower())):
                query_books.append(book)
        filtered_books = query_books
    
    # Cache results
    _cache[cache_key] = filtered_books
    _cache_timestamps[cache_key] = time.time()
    
    elapsed_ms = int((time.time() - start_time) * 1000)
    logger.info(f"✅ Mock search completed - Found {len(filtered_books)} books in {elapsed_ms}ms")
    
    return filtered_books

@app.get("/healthz", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="ok",
        timestamp=datetime.utcnow().isoformat()
    )

@app.get("/api/library", response_model=LibraryResponse)
async def get_library(
    q: Optional[str] = Query(None, description="Search query (optional)"),
    site: Literal["coptic", "christian", "all"] = Query("all", description="Source site filter"),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    per_page: int = Query(24, ge=1, le=100, description="Items per page"),
    download: bool = Query(False, description="Download PDF files"),
    force: bool = Query(False, description="Bypass cache")
):
    """
    Get Orthodox books with search, filtering, and pagination.
    """
    start_time = time.time()
    
    try:
        # Get all books matching criteria
        all_books = search_books(q=q, site=site, force=force)
        
        # Calculate pagination
        total_count = len(all_books)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        
        # Get page slice
        page_books = all_books[start_idx:end_idx]
        
        elapsed_ms = int((time.time() - start_time) * 1000)
        
        # Check if result was cached
        cache_key = f"{site}:{q or 'all'}"
        cached = cache_key in _cache and not force
        
        response = LibraryResponse(
            items=page_books,
            count=total_count,
            took_ms=elapsed_ms,
            cached=cached
        )
        
        logger.info(f"📚 Library API response - Page {page}, "
                   f"{len(page_books)} items, {elapsed_ms}ms, cached: {cached}")
        
        return response
        
    except Exception as e:
        logger.error(f"❌ Library API error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={"error": "internal", "message": "An error occurred while fetching books"}
        )

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"❌ Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "internal", "message": "An unexpected error occurred"}
    )

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Orthodox Books Search API")
    parser.add_argument("--q", help="Search query")
    parser.add_argument("--site", choices=["coptic", "christian", "all"], default="all", help="Site to search")
    parser.add_argument("--download", action="store_true", help="Download PDF files")
    parser.add_argument("--port", type=int, default=8000, help="Server port")
    parser.add_argument("--host", default="127.0.0.1", help="Server host")
    
    args = parser.parse_args()
    
    if args.q is not None:
        # CLI mode
        books = search_books(q=args.q, site=args.site)
        result = {
            "items": [book.dict() for book in books],
            "count": len(books),
            "query": args.q,
            "site": args.site
        }
        import json
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        # Server mode
        uvicorn.run(
            "main_simple:app",
            host=args.host,
            port=args.port,
            reload=True,
            log_level="info"
        )

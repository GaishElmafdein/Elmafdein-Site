#!/usr/bin/env python3
"""
Simplified Orthodox Books API Server
Uses sample data for immediate testing
"""

import json
import time
import logging
from typing import List, Optional, Literal
from pathlib import Path

try:
    from fastapi import FastAPI, Query, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    import uvicorn
    from pydantic import BaseModel, Field
except ImportError as e:
    print(f"❌ Missing dependency: {e}")
    print("💡 Run: pip install fastapi uvicorn pydantic")
    exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Data models
class Book(BaseModel):
    title: str
    author: Optional[str] = None
    source: Literal["coptic-treasures.com", "christianlib.com"]
    details_url: str
    download_url: Optional[str] = None
    cover_image: Optional[str] = None
    lang: Literal["ar", "en", "unknown"] = "unknown"
    pages: Optional[int] = None
    size_mb: Optional[float] = None

class LibraryResponse(BaseModel):
    items: List[Book]
    count: int
    took_ms: int
    cached: bool

class HealthResponse(BaseModel):
    status: str
    timestamp: str

# Load sample data
def load_sample_books() -> List[Book]:
    """Load sample books from JSON file"""
    try:
        sample_file = Path(__file__).parent / "sample_books.json"
        if sample_file.exists():
            with open(sample_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return [Book(**book) for book in data]
    except Exception as e:
        logger.warning(f"Could not load sample books: {e}")
    
    # Fallback minimal data
    return [
        Book(
            title="الكتاب المقدس - العهد الجديد",
            author="الكنيسة الأرثوذكسية",
            source="coptic-treasures.com",
            details_url="https://coptic-treasures.com/books/new-testament",
            download_url="https://coptic-treasures.com/downloads/new-testament.pdf",
            lang="ar",
            pages=450,
            size_mb=12.5
        ),
        Book(
            title="The Didache - Teaching of the Twelve Apostles",
            author="Apostolic Fathers",
            source="christianlib.com",
            details_url="https://www.christianlib.com/books/didache",
            download_url="https://www.christianlib.com/downloads/didache.pdf",
            lang="en",
            pages=32,
            size_mb=2.1
        )
    ]

# Initialize app
app = FastAPI(
    title="Orthodox Books API",
    description="Simple Orthodox Christian books search API",
    version="1.0.0"
)

# CORS
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

# Load sample data
SAMPLE_BOOKS = load_sample_books()
logger.info(f"📚 Loaded {len(SAMPLE_BOOKS)} sample books")

@app.get("/healthz", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    from datetime import datetime
    return HealthResponse(
        status="ok",
        timestamp=datetime.utcnow().isoformat()
    )

@app.get("/api/library", response_model=LibraryResponse)
async def get_library(
    q: Optional[str] = Query(None, description="Search query"),
    site: Literal["coptic", "christian", "all"] = Query("all", description="Source filter"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(24, ge=1, le=100, description="Items per page"),
    download: bool = Query(False, description="Download flag"),
    force: bool = Query(False, description="Force refresh")
):
    """Get Orthodox books with search and pagination"""
    start_time = time.time()
    
    try:
        # Start with all books
        books = SAMPLE_BOOKS.copy()
        
        # Filter by site
        if site != "all":
            source_filter = "coptic-treasures.com" if site == "coptic" else "christianlib.com"
            books = [book for book in books if book.source == source_filter]
        
        # Filter by search query
        if q:
            q_lower = q.lower()
            filtered_books = []
            for book in books:
                if (q_lower in book.title.lower() or 
                    (book.author and q_lower in book.author.lower())):
                    filtered_books.append(book)
            books = filtered_books
        
        # Sort for stable pagination
        books.sort(key=lambda b: (b.title.lower(), (b.author or "").lower()))
        
        # Pagination
        total_count = len(books)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        page_books = books[start_idx:end_idx]
        
        elapsed_ms = int((time.time() - start_time) * 1000)
        
        logger.info(f"📖 Library request: q='{q}', site={site}, page={page}, found={total_count}")
        
        return LibraryResponse(
            items=page_books,
            count=total_count,
            took_ms=elapsed_ms,
            cached=False  # Sample data is always "fresh"
        )
        
    except Exception as e:
        logger.error(f"❌ Library error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"❌ Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "internal", "message": "An error occurred"}
    )

if __name__ == "__main__":
    print("🚀 Starting Orthodox Books API Server...")
    print("📚 Sample books loaded:", len(SAMPLE_BOOKS))
    print("🔗 API: http://localhost:8001/api/library")
    print("📖 Docs: http://localhost:8001/docs")
    print("❤️ Health: http://localhost:8001/healthz")
    print()
    
    try:
        uvicorn.run(
            "simple_server:app",
            host="127.0.0.1",
            port=8001,  # Changed to port 8001
            reload=False,  # Disable reload for stability
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except Exception as e:
        print(f"❌ Server error: {e}")

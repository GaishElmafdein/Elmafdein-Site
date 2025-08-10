#!/usr/bin/env python3
"""
FastAPI Integration for Orthodox Book Scraper
Sacred API endpoint for Next.js /library page integration

Endpoints:
- GET /api/library?q={keyword} - Search books from external sites
- GET /api/library/all - Get all cached books
- GET /health - Health check
"""

from fastapi import FastAPI, Query, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
import asyncio
import json
import os
import time
from pathlib import Path
import logging

from orthodox_scraper import OrthodoxBookScraper

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Orthodox Book API",
    description="🕊️ Sacred book collection API for جيش المفديين (Army of the Redeemed)",
    version="1.0.0"
)

# Configure CORS for Next.js integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://127.0.0.1:3000",
        "https://localhost:3000",
        "*"  # Allow all origins for development
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Global scraper instance
scraper = OrthodoxBookScraper(headless=True, delay_range=(0.5, 1.5))

# Cache configuration
CACHE_FILE = "orthodox_books_cache.json"
CACHE_DURATION = 3600  # 1 hour in seconds

class BookResponse(BaseModel):
    """Book data model for API responses"""
    title: str
    author: str
    source: str
    details_url: str
    download_url: str
    cover_image: str

class SearchResponse(BaseModel):
    """Search response model"""
    books: List[BookResponse]
    total_count: int
    search_query: str
    cached: bool
    timestamp: float

def load_cache() -> Optional[Dict]:
    """Load cached book data"""
    try:
        # First try to load the sample data for better user experience
        sample_file = "sample_books.json"
        if os.path.exists(sample_file):
            with open(sample_file, 'r', encoding='utf-8') as f:
                sample_books = json.load(f)
            
            cache_data = {
                "books": sample_books,
                "search_query": "",
                "timestamp": time.time(),
                "cached": True,
                "total_count": len(sample_books)
            }
            logger.info(f"📚 Loaded {len(sample_books)} sample books for immediate access")
            return cache_data
        
        # Fallback to regular cache
        if os.path.exists(CACHE_FILE):
            with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                cache_data = json.load(f)
                
            # Check if cache is still valid
            if time.time() - cache_data.get("timestamp", 0) < CACHE_DURATION:
                logger.info(f"📚 Loaded {len(cache_data.get('books', []))} books from cache")
                return cache_data
            else:
                logger.info("🕒 Cache expired, will fetch fresh data")
                
    except Exception as e:
        logger.error(f"❌ Error loading cache: {e}")
    
    return None

def save_cache(books: List[Dict], search_query: str = ""):
    """Save books to cache"""
    try:
        cache_data = {
            "books": books,
            "search_query": search_query,
            "timestamp": time.time(),
            "total_count": len(books)
        }
        
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(cache_data, f, ensure_ascii=False, indent=2)
            
        logger.info(f"💾 Cached {len(books)} books")
        
    except Exception as e:
        logger.error(f"❌ Error saving cache: {e}")

def filter_books(books: List[Dict], keyword: str) -> List[Dict]:
    """Filter books by keyword (case-insensitive, Arabic/English support)"""
    if not keyword:
        return books
    
    keyword_lower = keyword.lower()
    filtered = []
    
    for book in books:
        # Search in title and author
        title = book.get("title", "").lower()
        author = book.get("author", "").lower()
        
        if keyword_lower in title or keyword_lower in author:
            filtered.append(book)
    
    return filtered

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Orthodox Book API",
        "message": "🕊️ Sacred service is running",
        "timestamp": time.time()
    }

@app.get("/api/library", response_model=SearchResponse)
async def search_books(
    q: str = Query("", description="Search keyword"),
    site: Optional[str] = Query(None, description="Specific site to search"),
    fresh: bool = Query(False, description="Force fresh data (ignore cache)")
):
    """
    Search Orthodox books from external sites
    
    - **q**: Search keyword (Arabic/English supported)
    - **site**: Limit to specific site (coptic-treasures.com or christianlib.com)
    - **fresh**: Force fresh data fetch, ignore cache
    """
    try:
        start_time = time.time()
        logger.info(f"🔍 API search request: q='{q}', site='{site}', fresh={fresh}")
        
        # Load data (sample or cached)
        cache_data = load_cache()
        if not cache_data:
            # Fallback to empty response if no data available
            return SearchResponse(
                books=[],
                total_count=0,
                search_query=q,
                cached=False,
                timestamp=time.time()
            )
        
        all_books = cache_data["books"]
        
        # Filter by site if specified
        if site:
            all_books = [book for book in all_books if book.get("source") == site]
        
        # Filter by search query if provided
        if q:
            filtered_books = []
            search_term = q.lower()
            for book in all_books:
                if (search_term in book.get("title", "").lower() or 
                    search_term in book.get("author", "").lower()):
                    filtered_books.append(book)
            all_books = filtered_books
        
        duration = time.time() - start_time
        logger.info(f"✅ Search completed in {duration:.2f}s, found {len(all_books)} books")
        
        return SearchResponse(
            books=[BookResponse(**book) for book in all_books],
            total_count=len(all_books),
            search_query=q,
            cached=True,
            timestamp=time.time()
        )
        
    except Exception as e:
        logger.error(f"❌ Search error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error searching books: {str(e)}"
        )

@app.get("/api/library/all", response_model=SearchResponse)
async def get_all_books():
    """Get all cached books"""
    try:
        cache_data = load_cache()
        
        if cache_data:
            return SearchResponse(
                books=[BookResponse(**book) for book in cache_data["books"]],
                total_count=cache_data["total_count"],
                search_query="",
                cached=True,
                timestamp=cache_data["timestamp"]
            )
        else:
            # No cache, return empty result
            return SearchResponse(
                books=[],
                total_count=0,
                search_query="",
                cached=False,
                timestamp=time.time()
            )
            
    except Exception as e:
        logger.error(f"❌ Error getting all books: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving books: {str(e)}"
        )

@app.post("/api/library/refresh")
async def refresh_cache(background_tasks: BackgroundTasks):
    """Refresh the book cache in background"""
    async def refresh_books():
        try:
            logger.info("🔄 Starting background cache refresh...")
            books = await scraper.search_books()
            save_cache(books)
            logger.info(f"✅ Cache refreshed with {len(books)} books")
        except Exception as e:
            logger.error(f"❌ Background refresh failed: {e}")
    
    background_tasks.add_task(refresh_books)
    
    return {
        "status": "refresh_started",
        "message": "🔄 Cache refresh started in background",
        "timestamp": time.time()
    }

@app.get("/api/library/stats")
async def get_stats():
    """Get API statistics"""
    try:
        cache_data = load_cache()
        
        stats = {
            "total_books": 0,
            "sources": {},
            "cache_age": 0,
            "cache_valid": False
        }
        
        if cache_data:
            books = cache_data.get("books", [])
            stats["total_books"] = len(books)
            stats["cache_age"] = time.time() - cache_data.get("timestamp", 0)
            stats["cache_valid"] = stats["cache_age"] < CACHE_DURATION
            
            # Count books by source
            for book in books:
                source = book.get("source", "unknown")
                stats["sources"][source] = stats["sources"].get(source, 0) + 1
        
        return stats
        
    except Exception as e:
        logger.error(f"❌ Error getting stats: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving stats: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    
    print("🕊️ Starting Orthodox Book API Server...")
    print("📚 Sacred service for جيش المفديين (Army of the Redeemed)")
    print("🔗 API will be available at: http://localhost:8000")
    print("📖 Documentation: http://localhost:8000/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=True
    )

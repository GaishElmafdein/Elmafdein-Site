# Orthodox Book API - Python + Playwright + FastAPI Integration

🕊️ **Sacred book collection system for جيش المفديين (Army of the Redeemed)**

This project provides a comprehensive Python-based web scraping and API system that integrates with your Next.js Orthodox digital cathedral to fetch book data dynamically from external Orthodox Christian websites.

## 🏛️ Features

### Core Functionality
- **Multi-site scraping**: Coptic Treasures and Christian Library
- **Smart search**: Keyword-based search with Arabic/English support
- **Pagination handling**: Automatic traversal of all pages
- **Anti-detection**: Random user agents, delays, proper headers
- **Data normalization**: UTF-8 encoding for Arabic content

### API Integration
- **FastAPI endpoints** for Next.js integration
- **Real-time search** from frontend
- **Caching system** for performance
- **CORS support** for cross-origin requests
- **Background refresh** capabilities

### CLI Interface
- **Manual execution** with command-line arguments
- **PDF downloads** with `--download` flag
- **Site filtering** with `--site` parameter
- **Debug mode** with visible browser option

## 🚀 Quick Start

### 1. Installation

```bash
# Clone or navigate to the orthodox-book-api directory
cd orthodox-book-api

# Run the setup script
python setup.py
```

The setup script will:
- Install all Python dependencies
- Download Playwright browsers (Firefox, Chromium, WebKit)
- Create necessary directories
- Test the installation

### 2. Manual CLI Usage

```bash
# Search for specific books
python orthodox_scraper.py --keyword "liturgy"

# Search specific site only
python orthodox_scraper.py --keyword "coptic" --site "coptic-treasures.com"

# Download all found PDFs
python orthodox_scraper.py --keyword "prayer" --download

# Scrape all books (no keyword)
python orthodox_scraper.py

# Debug mode (visible browser)
python orthodox_scraper.py --keyword "orthodox" --visible
```

### 3. API Server

```bash
# Start the FastAPI server
python api_server.py

# Server will run on: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

### 4. Next.js Integration

```bash
# Integrate with existing Next.js project
python integrate_nextjs.py

# Start Next.js development server
cd ../gaish-elmafdein-nextjs
npm run dev

# Visit the enhanced library page
# http://localhost:3000/library
```

## 📚 API Endpoints

### Search Books
```http
GET /api/library?q={keyword}&site={site}
```

**Parameters:**
- `q` (optional): Search keyword (Arabic/English)
- `site` (optional): Specific site filter
- `fresh` (optional): Force fresh data (ignore cache)

**Response:**
```json
{
  "books": [
    {
      "title": "الكتاب المقدس",
      "author": "الكنيسة الأرثوذكسية",
      "source": "coptic-treasures.com",
      "details_url": "https://...",
      "download_url": "https://....pdf",
      "cover_image": "https://..."
    }
  ],
  "total_count": 25,
  "search_query": "liturgy",
  "cached": false,
  "timestamp": 1707789123.45
}
```

### Get All Books
```http
GET /api/library/all
```

### Refresh Cache
```http
POST /api/library/refresh
```

### API Statistics
```http
GET /api/library/stats
```

## 🔧 Configuration

### Environment Variables

Create `.env` file:
```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=true

# Cache Settings
CACHE_DURATION=3600
CACHE_FILE=orthodox_books_cache.json

# Scraper Settings
SCRAPER_HEADLESS=true
SCRAPER_DELAY_MIN=0.5
SCRAPER_DELAY_MAX=1.5
```

### Next.js Configuration

The integration script creates:
- `src/lib/orthodox-book-service.ts` - API client service
- Updated `src/app/library/page.tsx` - Enhanced library page
- `.env.local` - Environment configuration

## 🛡️ Anti-Detection Features

### Browser Configuration
- Random user agents from real browsers
- Proper HTTP headers (Accept, Accept-Language, etc.)
- Viewport randomization
- Resource blocking for faster scraping

### Request Management
- Configurable delays between requests (0.5-1.5s default)
- Respect robots.txt guidelines
- Graceful error handling and retries
- Session persistence across pages

### Content Processing
- UTF-8 encoding for Arabic text
- Smart text cleaning and normalization
- Duplicate detection and removal
- Robust selector fallbacks

## 📁 Project Structure

```
orthodox-book-api/
├── requirements.txt          # Python dependencies
├── orthodox_scraper.py       # Main scraper with CLI
├── api_server.py            # FastAPI server
├── integrate_nextjs.py      # Next.js integration script
├── setup.py                 # Installation script
├── README.md               # This file
├── downloads/              # PDF downloads directory
├── logs/                   # Application logs
├── cache/                  # Cache directory
└── orthodox_books_cache.json # Book data cache
```

## 🔍 Supported Websites

### Coptic Treasures (coptic-treasures.com)
- **Content**: Coptic Orthodox liturgical texts, theological works
- **Languages**: Arabic, English
- **Format**: PDF downloads, book details pages
- **Pagination**: Automatic traversal

### Christian Library (christianlib.com)
- **Content**: General Christian theological resources
- **Languages**: Multiple (English primary)
- **Format**: Various digital formats
- **Search**: Keyword-based search system

## 🎯 Next.js Integration Details

### Enhanced Library Page Features
- **Dynamic search** from external sources
- **Combined results** (static + external books)
- **Source filtering** (Local, Coptic Treasures, Christian Library)
- **Real-time statistics** showing book counts
- **Cache status** indicators
- **Background refresh** capability

### API Service Integration
```typescript
import { OrthodoxBookService } from '@/lib/orthodox-book-service'

// Search books
const results = await OrthodoxBookService.searchBooks('liturgy')

// Get all cached books
const allBooks = await OrthodoxBookService.getAllBooks()

// Refresh cache
await OrthodoxBookService.refreshCache()
```

## 🔧 Troubleshooting

### Common Issues

**Installation Problems:**
```bash
# If pip install fails, try:
pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir

# If Playwright browsers fail:
playwright install --force
```

**Scraping Issues:**
```bash
# Test with visible browser for debugging:
python orthodox_scraper.py --keyword "test" --visible

# Check logs:
tail -f orthodox_scraper.log
```

**API Connection Issues:**
```bash
# Test API server health:
curl http://localhost:8000/health

# Check CORS configuration in api_server.py
```

### Performance Optimization

**Faster Scraping:**
- Increase delay range: `delay_range=(0.2, 0.8)`
- Use headless mode (default)
- Filter by specific sites

**Better Caching:**
- Adjust `CACHE_DURATION` in environment
- Use background refresh endpoints
- Monitor cache hit rates

## 📊 Monitoring and Logging

### Application Logs
- All scraping activities logged to `orthodox_scraper.log`
- API requests logged via FastAPI
- Error tracking and debugging information

### Performance Metrics
- Search response times
- Cache hit/miss ratios
- Book extraction success rates
- API endpoint usage statistics

## 🚀 Production Deployment

### API Server Deployment
```bash
# Production server with Gunicorn
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker api_server:app --bind 0.0.0.0:8000

# Or with Docker
# Dockerfile provided for containerized deployment
```

### Next.js Production
```bash
# Update API URL for production
echo "NEXT_PUBLIC_API_URL=https://your-api-domain.com" >> .env.production

# Build and deploy
npm run build
npm start
```

## 🤝 Contributing

This project is part of the **جيش المفديين (Army of the Redeemed)** Orthodox digital cathedral. Contributions should maintain the sacred aesthetic and theological accuracy.

### Development Guidelines
- Follow Orthodox Christian principles
- Maintain bilingual support (Arabic/English)
- Preserve sacred design patterns
- Test thoroughly with real websites

## 📜 License

This project is dedicated to the glory of God and the service of the Orthodox Church. Use responsibly and in accordance with the terms of service of the scraped websites.

---

**✝️ Built with sacred dedication for the Orthodox community ✝️**

*"كونوا مستعدين في كل حين لمجاوبة كل من يسألكم عن سبب الرجاء الذي فيكم بوداعة وخوف" - ١ بطرس ٣:١٥*

# Orthodox Book Scraper Installation & Usage Guide

## 🚀 Quick Installation

```bash
# Navigate to the scraper directory
cd c:/Users/minav/Gaish-Elmafdein/orthodox-book-scraper

# Install dependencies
npm install

# Install Playwright browsers
npm run install-browsers
```

## 💡 Example Commands

### 1. Basic Search
```bash
# Search for Orthodox theology books
node scraper.js --keyword "theology"
```

### 2. Site-Specific Scraping
```bash
# Scrape only Coptic Treasures
node scraper.js --site coptic-treasures --keyword "liturgy"

# Scrape only Christian Library
node scraper.js --site christianlib --keyword "prayer"
```

### 3. Download PDFs
```bash
# Search and download prayer books
node scraper.js --keyword "prayer" --download
```

### 4. Debug Mode
```bash
# Visual browser for debugging
node scraper.js --keyword "orthodox" --headful --delay 3000
```

### 5. Complete Catalog
```bash
# Scrape everything (may take a while)
node scraper.js --output complete-books.json
```

## 📊 Expected Output

```json
{
  "scraped_at": "2025-08-07T15:30:00.000Z",
  "total_books": 45,
  "search_keyword": "liturgy",
  "target_site": null,
  "books": [
    {
      "title": "The Divine Liturgy of St. John Chrysostom",
      "author": "Orthodox Church",
      "source": "coptic-treasures.com",
      "details_url": "https://coptic-treasures.com/books/divine-liturgy",
      "download_url": "https://coptic-treasures.com/downloads/liturgy.pdf",
      "cover_image": "https://coptic-treasures.com/images/liturgy-cover.jpg"
    }
  ]
}
```

## 🧪 Test the Scraper

```bash
# Run test suite
node test.js
```

## 🔧 Configuration Options

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--keyword` | none | Search term |
| `--site` | both | `coptic-treasures` or `christianlib` |
| `--download` | false | Download PDFs |
| `--headful` | false | Visual browser mode |
| `--delay` | 2000 | Delay between requests (ms) |
| `--output` | books.json | Output filename |

## 📁 File Structure After Running

```
orthodox-book-scraper/
├── books.json           # Main results
├── downloads/           # PDF files (if --download used)
│   ├── Divine_Liturgy.pdf
│   ├── Orthodox_Prayer.pdf
│   └── ...
├── test-liturgy.json    # Test results
└── test-coptic.json     # Test results
```

## 🛠️ Troubleshooting

### If browsers fail to install:
```bash
npx playwright install chromium
```

### If scraping fails:
```bash
# Increase delay
node scraper.js --keyword "test" --delay 5000 --headful
```

### If download fails:
- Check internet connection
- Verify PDF URLs are accessible
- Ensure downloads/ folder has write permissions

## 🎯 Ready to Use!

The scraper is production-ready with:
- ✅ Fault tolerance
- ✅ Anti-detection measures  
- ✅ Cross-platform support
- ✅ Unicode handling
- ✅ Automatic pagination
- ✅ PDF downloads
- ✅ Error recovery

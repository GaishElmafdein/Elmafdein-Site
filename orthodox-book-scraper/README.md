# Orthodox Book Scraper 📚✝️

A robust, fault-tolerant web scraper for Orthodox Christian books from multiple websites.

## 🎯 Features

- **Multi-site scraping**: Supports `coptic-treasures.com` and `christianlib.com`
- **Smart search**: Keyword-based or complete catalog scraping
- **Pagination handling**: Automatically follows "next page" links
- **PDF downloads**: Optional automatic PDF downloading
- **Fault tolerance**: Handles errors gracefully with retries
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Headless/Headful**: Debug mode available
- **Unicode support**: Proper Arabic/English text handling

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd orthodox-book-scraper
npm install
npm run install-browsers
```

### 2. Basic Usage

```bash
# Scrape all books from both sites
node scraper.js

# Search for specific keyword
node scraper.js --keyword "liturgy"

# Scrape only one site
node scraper.js --site coptic-treasures

# Download PDFs automatically
node scraper.js --keyword "prayer" --download

# Debug mode (headful browser)
node scraper.js --keyword "orthodox" --headful
```

## 📖 CLI Options

| Option | Description | Example |
|--------|-------------|---------|
| `-k, --keyword <word>` | Search keyword | `--keyword "orthodox"` |
| `-s, --site <site>` | Target site only | `--site coptic-treasures` |
| `-d, --download` | Download PDFs | `--download` |
| `-h, --headful` | Visual browser mode | `--headful` |
| `-o, --output <file>` | Output JSON file | `--output books.json` |
| `--delay <ms>` | Request delay | `--delay 3000` |

## 🏗️ Architecture

### Core Features

- **Playwright-based**: Reliable browser automation
- **Random User Agents**: Avoid detection
- **Smart Selectors**: Adapts to HTML structure changes
- **Error Recovery**: Skip broken pages, continue scraping
- **Unicode Normalization**: Proper Arabic text handling

### Output Format

```json
{
  "scraped_at": "2025-08-07T15:30:00.000Z",
  "total_books": 150,
  "search_keyword": "liturgy",
  "target_site": null,
  "books": [
    {
      "title": "The Divine Liturgy",
      "author": "St. John Chrysostom",
      "source": "coptic-treasures.com",
      "details_url": "https://coptic-treasures.com/book/123",
      "download_url": "https://coptic-treasures.com/download/liturgy.pdf",
      "cover_image": "https://coptic-treasures.com/images/liturgy-cover.jpg"
    }
  ]
}
```

## 🔧 Technical Details

### Supported Sites

1. **Coptic Treasures** (`coptic-treasures.com`)
   - Books section scraping
   - PDF download links
   - Author extraction
   - Cover image detection

2. **Christian Library** (`christianlib.com`)
   - Search functionality
   - Catalog browsing
   - Metadata extraction
   - Direct download links

### Scraping Strategy

1. **Page Analysis**: Detect book containers automatically
2. **Pagination**: Follow next-page links until exhausted
3. **Detail Extraction**: Visit individual book pages for complete data
4. **Download Detection**: Find direct PDF links
5. **Deduplication**: Remove duplicate books across sites

### Error Handling

- Network timeouts and retries
- Graceful handling of missing elements
- Skip broken pages and continue
- Rate limiting to avoid blocking
- User-agent rotation

## 💡 Usage Examples

### Search for Orthodox Theology Books
```bash
node scraper.js --keyword "theology" --site coptic-treasures
```

### Download All Liturgical Books
```bash
node scraper.js --keyword "liturgy" --download --delay 5000
```

### Debug Mode for Site Analysis
```bash
node scraper.js --keyword "prayer" --headful --delay 1000
```

### Complete Catalog Scraping
```bash
node scraper.js --output complete-catalog.json
```

## 📁 Project Structure

```
orthodox-book-scraper/
├── package.json          # Dependencies and scripts
├── scraper.js            # Main scraper implementation
├── books.json            # Output file (generated)
├── downloads/            # PDF downloads (if --download used)
├── README.md            # This file
└── node_modules/        # Dependencies
```

## 🛡️ Reliability Features

### Anti-Detection
- Random user agents
- Variable delays between requests
- Proper HTTP headers
- Realistic browsing patterns

### Fault Tolerance
- Retry failed requests
- Skip corrupted pages
- Handle dynamic content loading
- Graceful shutdown on interruption

### Performance
- Concurrent page processing
- Smart pagination detection
- Memory-efficient streaming
- Configurable delays

## 🔍 Debugging

### Enable Visual Mode
```bash
node scraper.js --headful --delay 3000
```

### Increase Verbosity
The scraper outputs detailed logs including:
- Page navigation status
- Book extraction counts
- Error messages with context
- Download progress

### Test Single Site
```bash
node scraper.js --site coptic-treasures --keyword "test" --headful
```

## 📊 Output Analysis

After scraping, the tool provides:

- **Total books found**
- **Books with download URLs**
- **Books with author information**
- **Books with cover images**
- **Breakdown by source website**

## 🚨 Rate Limiting

The scraper includes built-in rate limiting:
- Default 2-second delay between requests
- Configurable via `--delay` parameter
- Longer delays between different sites
- Respectful of website resources

## 💾 Data Persistence

- **JSON Output**: Structured data in `books.json`
- **PDF Downloads**: Organized in `downloads/` folder
- **Metadata**: Timestamp and search parameters included
- **Unicode Safe**: Proper handling of Arabic/English text

## 🔄 Extending the Scraper

The `OrthodoxBookScraper` class can be extended for additional sites:

```javascript
import { OrthodoxBookScraper } from './scraper.js';

class CustomScraper extends OrthodoxBookScraper {
  async scrapeCustomSite(keyword) {
    // Add your custom site scraping logic
  }
}
```

## 📋 Requirements

- **Node.js** 16+ 
- **npm** or **yarn**
- **Internet connection**
- **~500MB** for Playwright browsers

## 🐛 Troubleshooting

### Browser Installation Issues
```bash
npm run install-browsers
```

### Permission Errors
- Ensure write permissions for output directory
- Check downloads folder permissions

### Network Issues
- Increase delay: `--delay 5000`
- Check firewall settings
- Verify site accessibility

## 🤝 Contributing

1. Fork the repository
2. Add support for new Orthodox book sites
3. Improve error handling
4. Submit pull request

## 📜 License

MIT License - Feel free to use for Orthodox educational purposes.

---

**Built with Orthodox devotion for the preservation and accessibility of Christian literature** ✝️

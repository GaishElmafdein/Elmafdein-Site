#!/usr/bin/env node

import { chromium } from 'playwright';
import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import UserAgent from 'user-agents';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CLI Configuration
const program = new Command();
program
  .name('orthodox-book-scraper')
  .description('Robust scraper for Orthodox Christian books')
  .version('1.0.0')
  .option('-k, --keyword <keyword>', 'Search keyword (optional)')
  .option('-s, --site <site>', 'Limit to specific site: coptic-treasures or christianlib')
  .option('-d, --download', 'Download all found PDFs')
  .option('-h, --headful', 'Run in headful mode for debugging')
  .option('-o, --output <file>', 'Output JSON file', 'books.json')
  .option('--delay <ms>', 'Delay between requests (ms)', '2000')
  .parse();

const options = program.opts();

/**
 * Orthodox Book Scraper Class
 * Handles scraping from multiple Orthodox Christian book websites
 */
class OrthodoxBookScraper {
  constructor(options = {}) {
    this.options = {
      headless: !options.headful,
      delay: parseInt(options.delay) || 2000,
      downloadPdfs: options.download || false,
      outputFile: options.output || 'books.json',
      keyword: options.keyword || null,
      targetSite: options.site || null,
      ...options
    };
    
    this.browser = null;
    this.results = [];
    this.downloadDir = path.join(__dirname, 'downloads');
    this.userAgent = new UserAgent();
  }

  /**
   * Initialize browser and setup
   */
  async initialize() {
    console.log('🚀 Initializing Orthodox Book Scraper...');
    
    // Create downloads directory if needed
    if (this.options.downloadPdfs) {
      await fs.mkdir(this.downloadDir, { recursive: true });
      console.log(`📁 Downloads folder: ${this.downloadDir}`);
    }

    // Launch browser
    this.browser = await chromium.launch({
      headless: this.options.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    console.log(`🌐 Browser launched (headless: ${this.options.headless})`);
  }

  /**
   * Create new page with random user agent and proper setup
   */
  async createPage() {
    const context = await this.browser.newContext({
      userAgent: this.userAgent.toString(),
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US'
    });

    const page = await context.newPage();
    
    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });

    return page;
  }

  /**
   * Add delay between requests to avoid blocking
   */
  async delay(ms = null) {
    const delayTime = ms || this.options.delay;
    console.log(`⏳ Waiting ${delayTime}ms...`);
    await new Promise(resolve => setTimeout(resolve, delayTime));
  }

  /**
   * Normalize text encoding for Arabic/English content
   */
  normalizeText(text) {
    if (!text) return '';
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
      .normalize('NFC'); // Normalize Unicode
  }

  /**
   * Extract books from Coptic Treasures
   */
  async scrapeCopticTreasures(keyword = null) {
    console.log('📚 Scraping Coptic Treasures...');
    const baseUrl = 'https://coptic-treasures.com';
    const booksUrl = `${baseUrl}/sections/books/`;
    
    const page = await this.createPage();
    const books = [];

    try {
      await page.goto(booksUrl, { waitUntil: 'networkidle' });
      console.log('✅ Loaded Coptic Treasures books page');

      // Handle search if keyword provided
      if (keyword) {
        console.log(`🔍 Searching for: "${keyword}"`);
        
        // Look for search functionality
        const searchSelector = 'input[type="search"], input[name*="search"], input[placeholder*="search"]';
        const searchInput = await page.$(searchSelector);
        
        if (searchInput) {
          await searchInput.fill(keyword);
          await page.keyboard.press('Enter');
          await page.waitForLoadState('networkidle');
          await this.delay(1000);
        } else {
          console.log('⚠️ No search box found, scraping all books and filtering...');
        }
      }

      let currentPage = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        console.log(`📄 Processing page ${currentPage}...`);

        // Extract book links and basic info
        const pageBooks = await page.evaluate((keyword, baseUrl) => {
          const books = [];
          
          // Common selectors for book containers
          const bookSelectors = [
            '.book-item',
            '.book-card', 
            '.book',
            'article',
            '.post',
            '.entry',
            'a[href*="/book"]',
            'a[href*="/download"]'
          ];

          let bookElements = [];
          
          for (const selector of bookSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              bookElements = Array.from(elements);
              break;
            }
          }

          // If no specific book containers, look for links with book-like patterns
          if (bookElements.length === 0) {
            const allLinks = document.querySelectorAll('a[href]');
            bookElements = Array.from(allLinks).filter(link => {
              const href = link.href.toLowerCase();
              const text = link.textContent.toLowerCase();
              return (
                href.includes('book') || 
                href.includes('download') || 
                href.includes('.pdf') ||
                text.includes('تحميل') ||
                text.includes('download')
              );
            });
          }

          bookElements.forEach((element, index) => {
            try {
              const link = element.tagName === 'A' ? element : element.querySelector('a');
              if (!link) return;

              const title = (
                element.querySelector('h1, h2, h3, h4, .title, .book-title')?.textContent ||
                link.textContent ||
                link.getAttribute('title') ||
                `Book ${index + 1}`
              ).trim();

              const author = (
                element.querySelector('.author, .book-author, .by')?.textContent ||
                ''
              ).trim();

              const href = link.href;
              const detailsUrl = href.startsWith('http') ? href : baseUrl + href;

              // Look for direct PDF links
              const downloadLink = element.querySelector('a[href*=".pdf"], a[download]');
              const downloadUrl = downloadLink ? 
                (downloadLink.href.startsWith('http') ? downloadLink.href : baseUrl + downloadLink.href) : 
                null;

              // Look for cover image
              const imgElement = element.querySelector('img');
              const coverImage = imgElement ? 
                (imgElement.src.startsWith('http') ? imgElement.src : baseUrl + imgElement.src) : 
                null;

              // Filter by keyword if provided
              if (keyword) {
                const searchText = (title + ' ' + author).toLowerCase();
                if (!searchText.includes(keyword.toLowerCase())) {
                  return;
                }
              }

              books.push({
                title,
                author,
                source: 'coptic-treasures.com',
                details_url: detailsUrl,
                download_url: downloadUrl,
                cover_image: coverImage
              });
            } catch (error) {
              console.warn('Error processing book element:', error);
            }
          });

          return books;
        }, keyword, baseUrl);

        books.push(...pageBooks);
        console.log(`✅ Found ${pageBooks.length} books on page ${currentPage}`);

        // Check for next page
        const nextPageLink = await page.$('a[rel="next"], .next, .pagination a:last-child, a:has-text("Next")');
        
        if (nextPageLink) {
          const nextUrl = await nextPageLink.getAttribute('href');
          if (nextUrl && !nextUrl.includes('#')) {
            await nextPageLink.click();
            await page.waitForLoadState('networkidle');
            await this.delay();
            currentPage++;
          } else {
            hasNextPage = false;
          }
        } else {
          hasNextPage = false;
        }

        // Safety check to prevent infinite loops
        if (currentPage > 50) {
          console.log('⚠️ Reached maximum page limit (50)');
          hasNextPage = false;
        }
      }

      // Process each book for additional details
      for (const book of books) {
        try {
          if (book.details_url && (!book.download_url || !book.author)) {
            console.log(`🔍 Getting details for: ${book.title}`);
            
            const detailPage = await this.createPage();
            await detailPage.goto(book.details_url, { waitUntil: 'networkidle' });
            
            const details = await detailPage.evaluate(() => {
              const downloadLink = document.querySelector('a[href*=".pdf"], a[download], a:has-text("تحميل"), a:has-text("Download")');
              const authorElement = document.querySelector('.author, .book-author, .by, h2, h3');
              
              return {
                download_url: downloadLink ? downloadLink.href : null,
                author: authorElement ? authorElement.textContent.trim() : null
              };
            });

            if (details.download_url && !book.download_url) {
              book.download_url = details.download_url.startsWith('http') ? 
                details.download_url : 
                baseUrl + details.download_url;
            }
            
            if (details.author && !book.author) {
              book.author = details.author;
            }

            await detailPage.close();
            await this.delay(500);
          }
        } catch (error) {
          console.warn(`⚠️ Error getting details for ${book.title}:`, error.message);
        }
      }

    } catch (error) {
      console.error('❌ Error scraping Coptic Treasures:', error);
    } finally {
      await page.close();
    }

    console.log(`✅ Coptic Treasures: Found ${books.length} books`);
    return books.map(book => ({
      ...book,
      title: this.normalizeText(book.title),
      author: this.normalizeText(book.author)
    }));
  }

  /**
   * Extract books from Christian Library
   */
  async scrapeChristianLib(keyword = null) {
    console.log('📚 Scraping Christian Library...');
    const baseUrl = 'https://www.christianlib.com';
    
    const page = await this.createPage();
    const books = [];

    try {
      await page.goto(baseUrl, { waitUntil: 'networkidle' });
      console.log('✅ Loaded Christian Library homepage');

      // Look for books section or search
      if (keyword) {
        console.log(`🔍 Searching for: "${keyword}"`);
        
        const searchSelector = 'input[type="search"], input[name*="search"], input[placeholder*="search"], input[name="q"]';
        const searchInput = await page.$(searchSelector);
        
        if (searchInput) {
          await searchInput.fill(keyword);
          await page.keyboard.press('Enter');
          await page.waitForLoadState('networkidle');
          await this.delay(1000);
        }
      } else {
        // Navigate to books section
        const booksLink = await page.$('a[href*="book"], a:has-text("Books"), a:has-text("كتب")');
        if (booksLink) {
          await booksLink.click();
          await page.waitForLoadState('networkidle');
          await this.delay(1000);
        }
      }

      let currentPage = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        console.log(`📄 Processing page ${currentPage}...`);

        const pageBooks = await page.evaluate((keyword, baseUrl) => {
          const books = [];
          
          // Look for book containers
          const bookSelectors = [
            '.book',
            '.book-item',
            '.book-card',
            '.post',
            '.entry',
            'article',
            '.content-item'
          ];

          let bookElements = [];
          
          for (const selector of bookSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              bookElements = Array.from(elements);
              break;
            }
          }

          // Fallback: look for links with book patterns
          if (bookElements.length === 0) {
            const allLinks = document.querySelectorAll('a[href]');
            bookElements = Array.from(allLinks).filter(link => {
              const href = link.href.toLowerCase();
              const text = link.textContent.toLowerCase();
              return (
                href.includes('book') || 
                href.includes('library') ||
                href.includes('.pdf') ||
                text.includes('كتاب') ||
                text.includes('تحميل')
              );
            });
          }

          bookElements.forEach((element, index) => {
            try {
              const link = element.tagName === 'A' ? element : element.querySelector('a');
              if (!link) return;

              const title = (
                element.querySelector('h1, h2, h3, h4, .title, .book-title, .post-title')?.textContent ||
                link.textContent ||
                link.getAttribute('title') ||
                `Book ${index + 1}`
              ).trim();

              const author = (
                element.querySelector('.author, .book-author, .by, .meta')?.textContent ||
                ''
              ).trim();

              const href = link.href;
              const detailsUrl = href.startsWith('http') ? href : baseUrl + href;

              const downloadLink = element.querySelector('a[href*=".pdf"], a[download]');
              const downloadUrl = downloadLink ? 
                (downloadLink.href.startsWith('http') ? downloadLink.href : baseUrl + downloadLink.href) : 
                null;

              const imgElement = element.querySelector('img');
              const coverImage = imgElement ? 
                (imgElement.src.startsWith('http') ? imgElement.src : baseUrl + imgElement.src) : 
                null;

              // Filter by keyword
              if (keyword) {
                const searchText = (title + ' ' + author).toLowerCase();
                if (!searchText.includes(keyword.toLowerCase())) {
                  return;
                }
              }

              books.push({
                title,
                author,
                source: 'christianlib.com',
                details_url: detailsUrl,
                download_url: downloadUrl,
                cover_image: coverImage
              });
            } catch (error) {
              console.warn('Error processing book element:', error);
            }
          });

          return books;
        }, keyword, baseUrl);

        books.push(...pageBooks);
        console.log(`✅ Found ${pageBooks.length} books on page ${currentPage}`);

        // Check for pagination
        const nextPageLink = await page.$('a[rel="next"], .next, .pagination a:last-child, a:has-text("Next"), a:has-text("التالي")');
        
        if (nextPageLink) {
          const nextUrl = await nextPageLink.getAttribute('href');
          if (nextUrl && !nextUrl.includes('#')) {
            await nextPageLink.click();
            await page.waitForLoadState('networkidle');
            await this.delay();
            currentPage++;
          } else {
            hasNextPage = false;
          }
        } else {
          hasNextPage = false;
        }

        if (currentPage > 50) {
          console.log('⚠️ Reached maximum page limit (50)');
          hasNextPage = false;
        }
      }

      // Get additional details for each book
      for (const book of books) {
        try {
          if (book.details_url && (!book.download_url || !book.author)) {
            console.log(`🔍 Getting details for: ${book.title}`);
            
            const detailPage = await this.createPage();
            await detailPage.goto(book.details_url, { waitUntil: 'networkidle' });
            
            const details = await detailPage.evaluate(() => {
              const downloadLink = document.querySelector('a[href*=".pdf"], a[download], a:has-text("تحميل"), a:has-text("Download"), a:has-text("PDF")');
              const authorElement = document.querySelector('.author, .book-author, .by, .meta, h2, h3');
              
              return {
                download_url: downloadLink ? downloadLink.href : null,
                author: authorElement ? authorElement.textContent.trim() : null
              };
            });

            if (details.download_url && !book.download_url) {
              book.download_url = details.download_url.startsWith('http') ? 
                details.download_url : 
                baseUrl + details.download_url;
            }
            
            if (details.author && !book.author) {
              book.author = details.author;
            }

            await detailPage.close();
            await this.delay(500);
          }
        } catch (error) {
          console.warn(`⚠️ Error getting details for ${book.title}:`, error.message);
        }
      }

    } catch (error) {
      console.error('❌ Error scraping Christian Library:', error);
    } finally {
      await page.close();
    }

    console.log(`✅ Christian Library: Found ${books.length} books`);
    return books.map(book => ({
      ...book,
      title: this.normalizeText(book.title),
      author: this.normalizeText(book.author)
    }));
  }

  /**
   * Download PDF files
   */
  async downloadPdfs(books) {
    if (!this.options.downloadPdfs) return;

    console.log(`📥 Starting PDF downloads for ${books.length} books...`);
    const page = await this.createPage();

    for (const [index, book] of books.entries()) {
      if (!book.download_url) {
        console.log(`⏭️ Skipping ${book.title} (no download URL)`);
        continue;
      }

      try {
        console.log(`📥 Downloading ${index + 1}/${books.length}: ${book.title}`);
        
        const filename = `${book.title.replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, '')}.pdf`
          .replace(/\s+/g, '_')
          .substring(0, 100);
        
        const filePath = path.join(this.downloadDir, filename);

        const download = await page.download(book.download_url);
        await download.saveAs(filePath);
        
        console.log(`✅ Downloaded: ${filename}`);
        await this.delay(1000);

      } catch (error) {
        console.warn(`❌ Failed to download ${book.title}:`, error.message);
      }
    }

    await page.close();
    console.log('📥 Download process completed');
  }

  /**
   * Main scraping orchestrator
   */
  async scrape() {
    await this.initialize();

    try {
      const sites = [];
      
      // Determine which sites to scrape
      if (!this.options.targetSite || this.options.targetSite === 'coptic-treasures') {
        sites.push('coptic-treasures');
      }
      if (!this.options.targetSite || this.options.targetSite === 'christianlib') {
        sites.push('christianlib');
      }

      // Scrape each site
      for (const site of sites) {
        try {
          let books = [];
          
          if (site === 'coptic-treasures') {
            books = await this.scrapeCopticTreasures(this.options.keyword);
          } else if (site === 'christianlib') {
            books = await this.scrapeChristianLib(this.options.keyword);
          }

          this.results.push(...books);
          await this.delay(2000); // Longer delay between sites
          
        } catch (error) {
          console.error(`❌ Error scraping ${site}:`, error);
        }
      }

      // Remove duplicates based on title and author
      const uniqueBooks = this.results.filter((book, index, self) => {
        return index === self.findIndex(b => 
          b.title.toLowerCase() === book.title.toLowerCase() && 
          b.author.toLowerCase() === book.author.toLowerCase()
        );
      });

      this.results = uniqueBooks;

      // Save results
      await this.saveResults();

      // Download PDFs if requested
      if (this.options.downloadPdfs) {
        await this.downloadPdfs(this.results);
      }

      // Output summary
      console.log('\n📊 SCRAPING SUMMARY:');
      console.log(`📚 Total books found: ${this.results.length}`);
      console.log(`🔗 Books with download URLs: ${this.results.filter(b => b.download_url).length}`);
      console.log(`👨‍💼 Books with authors: ${this.results.filter(b => b.author).length}`);
      console.log(`🖼️ Books with cover images: ${this.results.filter(b => b.cover_image).length}`);

      // Output by source
      const bySite = this.results.reduce((acc, book) => {
        acc[book.source] = (acc[book.source] || 0) + 1;
        return acc;
      }, {});

      Object.entries(bySite).forEach(([site, count]) => {
        console.log(`🌐 ${site}: ${count} books`);
      });

      console.log(`\n💾 Results saved to: ${this.options.outputFile}`);

      // Output JSON to stdout for piping
      console.log('\n📄 JSON OUTPUT:');
      console.log(JSON.stringify(this.results, null, 2));

    } catch (error) {
      console.error('❌ Fatal error during scraping:', error);
    } finally {
      await this.cleanup();
    }

    return this.results;
  }

  /**
   * Save results to JSON file
   */
  async saveResults() {
    const output = {
      scraped_at: new Date().toISOString(),
      total_books: this.results.length,
      search_keyword: this.options.keyword,
      target_site: this.options.targetSite,
      books: this.results
    };

    await fs.writeFile(
      this.options.outputFile, 
      JSON.stringify(output, null, 2), 
      'utf8'
    );
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔄 Browser closed');
    }
  }
}

// Main execution
async function main() {
  const scraper = new OrthodoxBookScraper(options);
  
  try {
    await scraper.scrape();
  } catch (error) {
    console.error('💥 Scraper failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { OrthodoxBookScraper };

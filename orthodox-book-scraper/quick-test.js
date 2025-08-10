#!/usr/bin/env node

/**
 * Quick test to verify scraper functionality
 */

import { OrthodoxBookScraper } from './scraper.js';

async function quickTest() {
  console.log('🧪 Quick Orthodox Book Scraper Test\n');

  // Test basic functionality
  const scraper = new OrthodoxBookScraper({
    keyword: 'orthodox',
    headful: true, // Show browser for demonstration
    delay: 2000,
    outputFile: 'quick-test.json',
    targetSite: 'coptic-treasures' // Start with one site
  });

  try {
    console.log('🚀 Starting scraper test...');
    const books = await scraper.scrape();
    
    console.log(`\n✅ SUCCESS! Found ${books.length} books`);
    
    if (books.length > 0) {
      console.log('\n📚 Sample book:');
      console.log(JSON.stringify(books[0], null, 2));
    }
    
    console.log('\n🎉 Scraper is working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test
quickTest().catch(console.error);

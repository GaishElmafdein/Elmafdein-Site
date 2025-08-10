#!/usr/bin/env node

/**
 * Test script for Orthodox Book Scraper
 * Demonstrates various usage scenarios
 */

import { OrthodoxBookScraper } from './scraper.js';

async function runTests() {
  console.log('🧪 Running Orthodox Book Scraper Tests...\n');

  // Test 1: Search for liturgy books (limited)
  console.log('📚 Test 1: Search for "liturgy" books');
  console.log('='.repeat(50));
  
  const scraper1 = new OrthodoxBookScraper({
    keyword: 'liturgy',
    headful: false,
    delay: 1000,
    outputFile: 'test-liturgy.json'
  });

  try {
    const books1 = await scraper1.scrape();
    console.log(`✅ Found ${books1.length} liturgy books\n`);
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
  }

  // Wait between tests
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Test 2: Scrape single site
  console.log('🌐 Test 2: Coptic Treasures only');
  console.log('='.repeat(50));
  
  const scraper2 = new OrthodoxBookScraper({
    targetSite: 'coptic-treasures',
    keyword: 'prayer',
    headful: false,
    delay: 1000,
    outputFile: 'test-coptic.json'
  });

  try {
    const books2 = await scraper2.scrape();
    console.log(`✅ Found ${books2.length} prayer books from Coptic Treasures\n`);
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
  }

  console.log('🎉 Testing completed!');
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

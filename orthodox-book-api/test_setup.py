#!/usr/bin/env python3
"""
Quick Test Script for Orthodox Book API
Tests both CLI scraper and API functionality
"""

import asyncio
import sys
import json
from pathlib import Path

# Add current directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

async def test_cli_scraper():
    """Test the CLI scraper functionality"""
    print("🧪 Testing CLI Scraper...")
    
    try:
        from orthodox_scraper import OrthodoxBookScraper
        
        # Initialize scraper
        scraper = OrthodoxBookScraper(headless=True, delay_range=(0.5, 1))
        
        # Test search
        print("🔍 Testing search functionality...")
        books = await scraper.search_books(keyword="orthodox", sites=["coptic-treasures.com"])
        
        print(f"✅ Found {len(books)} books")
        
        if books:
            print("📖 Sample book:")
            sample = books[0]
            for key, value in sample.items():
                print(f"  {key}: {value}")
        
        return len(books) > 0
        
    except Exception as e:
        print(f"❌ CLI test failed: {e}")
        return False

def test_api_imports():
    """Test API server imports"""
    print("\n🧪 Testing API Imports...")
    
    try:
        # Test essential imports
        import fastapi
        import uvicorn
        from pydantic import BaseModel
        
        print("✅ FastAPI imports successful")
        return True
        
    except ImportError as e:
        print(f"❌ Import test failed: {e}")
        return False

def test_file_structure():
    """Test project file structure"""
    print("\n🧪 Testing File Structure...")
    
    required_files = [
        "requirements.txt",
        "orthodox_scraper.py",
        "api_server.py",
        "integrate_nextjs.py",
        "README.md"
    ]
    
    missing_files = []
    for file in required_files:
        if not Path(file).exists():
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ Missing files: {', '.join(missing_files)}")
        return False
    else:
        print("✅ All required files present")
        return True

async def main():
    """Run all tests"""
    print("🕊️ Orthodox Book API - Quick Test Suite")
    print("=" * 50)
    
    tests = [
        ("File Structure", lambda: test_file_structure()),
        ("API Imports", lambda: test_api_imports()),
        ("CLI Scraper", lambda: asyncio.run(test_cli_scraper()) if asyncio.iscoroutinefunction(test_cli_scraper) else test_cli_scraper())
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            if asyncio.iscoroutinefunction(test_func):
                result = await test_func()
            else:
                result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "="*50)
    print("📊 Test Results Summary")
    print("="*50)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("\n🎉 All tests passed! Ready to use Orthodox Book API")
        print("\n🚀 Next steps:")
        print("1. python api_server.py  # Start API server")
        print("2. python orthodox_scraper.py --keyword 'liturgy'  # Test CLI")
        print("3. python integrate_nextjs.py  # Integrate with Next.js")
    else:
        print("\n⚠️ Some tests failed. Check the output above.")
        print("Try running: python setup.py")
    
    return passed == len(results)

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)

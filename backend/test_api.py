#!/usr/bin/env python3
"""
Test script for Orthodox Books API
Tests all endpoints and functionality
"""

import asyncio
import json
import time
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from main import app
from models import Book

async def test_health():
    """Test health endpoint"""
    print("🔍 Testing health endpoint...")
    
    from fastapi.testclient import TestClient
    client = TestClient(app)
    
    response = client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    print("✅ Health check passed")

async def test_library_all():
    """Test library endpoint without query"""
    print("🔍 Testing library endpoint (all books)...")
    
    from fastapi.testclient import TestClient
    client = TestClient(app)
    
    response = client.get("/api/library")
    assert response.status_code == 200
    data = response.json()
    
    print(f"✅ Found {data['count']} books")
    print(f"⏱️ Response time: {data['took_ms']}ms")
    print(f"📦 Cached: {data['cached']}")
    
    if data['items']:
        print(f"📖 Sample book: {data['items'][0]['title']}")

async def test_library_search():
    """Test library endpoint with search"""
    print("🔍 Testing library search...")
    
    from fastapi.testclient import TestClient
    client = TestClient(app)
    
    # Test English search
    response = client.get("/api/library?q=didache")
    assert response.status_code == 200
    data = response.json()
    
    print(f"✅ English search 'didache': {data['count']} books")
    
    # Test Arabic search
    response = client.get("/api/library?q=كتاب")
    assert response.status_code == 200
    data = response.json()
    
    print(f"✅ Arabic search 'كتاب': {data['count']} books")

async def test_library_pagination():
    """Test library pagination"""
    print("🔍 Testing library pagination...")
    
    from fastapi.testclient import TestClient
    client = TestClient(app)
    
    # Get first page
    response = client.get("/api/library?page=1&per_page=5")
    assert response.status_code == 200
    data = response.json()
    
    print(f"✅ Page 1: {len(data['items'])} books (total: {data['count']})")

async def test_cors():
    """Test CORS headers"""
    print("🔍 Testing CORS...")
    
    from fastapi.testclient import TestClient
    client = TestClient(app)
    
    response = client.options("/api/library", headers={
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "GET"
    })
    
    print(f"✅ CORS preflight status: {response.status_code}")

async def main():
    """Run all tests"""
    print("🚀 Starting Orthodox Books API Tests\n")
    
    try:
        await test_health()
        print()
        
        await test_library_all()
        print()
        
        await test_library_search()
        print()
        
        await test_library_pagination()
        print()
        
        await test_cors()
        print()
        
        print("🎉 All tests passed!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())

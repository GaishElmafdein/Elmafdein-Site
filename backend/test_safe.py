#!/usr/bin/env python3
"""
Test script for Orthodox Books API - Safe testing without stopping server
"""

import requests
import json
import time

def test_api():
    """Test the API safely"""
    base_url = "http://localhost:8001"
    
    try:
        print("🔍 Testing Orthodox Books API...")
        
        # Test health
        print("\n1. Health Check:")
        response = requests.get(f"{base_url}/healthz", timeout=5)
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Status: {response.json()['status']}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return
        
        # Test library endpoint
        print("\n2. Library Endpoint:")
        response = requests.get(f"{base_url}/api/library", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Library API working")
            print(f"   Total books: {data['count']}")
            print(f"   Response time: {data['took_ms']}ms")
            print(f"   Cached: {data['cached']}")
            
            # Show first 3 books
            print(f"\n   First 3 books:")
            for i, book in enumerate(data['items'][:3]):
                print(f"   {i+1}. {book['title'][:50]}...")
                print(f"      Author: {book['author'] or 'Unknown'}")
                print(f"      Source: {book['source']}")
                print(f"      Language: {book['lang']}")
                if book['pages']:
                    print(f"      Pages: {book['pages']}")
                if book['size_mb']:
                    print(f"      Size: {book['size_mb']}MB")
                print()
        else:
            print(f"❌ Library API failed: {response.status_code}")
            return
        
        # Test search
        print("\n3. Search Test:")
        response = requests.get(f"{base_url}/api/library?q=didache", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Search working")
            print(f"   Search for 'didache': {data['count']} results")
            if data['items']:
                print(f"   Found: {data['items'][0]['title']}")
        
        # Test Arabic search
        response = requests.get(f"{base_url}/api/library?q=كتاب", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Arabic search working")
            print(f"   Search for 'كتاب': {data['count']} results")
        
        print("\n🎉 All tests passed! API is working correctly.")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure it's running on http://localhost:8001")
    except requests.exceptions.Timeout:
        print("❌ Request timed out")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_api()

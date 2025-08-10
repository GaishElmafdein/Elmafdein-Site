#!/usr/bin/env python3
"""
Simple server startup script for Orthodox Books API
"""

import uvicorn
import sys
import os

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🚀 Starting Orthodox Books API Server...")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔍 Library Endpoint: http://localhost:8000/api/library")
    print("❤️ Health Check: http://localhost:8000/healthz")
    print()
    
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info",
        access_log=True
    )

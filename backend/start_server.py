#!/usr/bin/env python3
"""
Startup script for Orthodox Books API
"""

import uvicorn
import sys
import os
from pathlib import Path

# Add current directory to path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

def main():
    """Main startup function"""
    print("🚀 Starting Orthodox Books API...")
    print("📁 Working directory:", current_dir)
    
    try:
        # Import and check dependencies
        from simple_server import app, SAMPLE_BOOKS
        print(f"📚 Loaded {len(SAMPLE_BOOKS)} sample books")
        
        # Start server
        print("🌐 Starting server on http://localhost:8001")
        print("📖 API Documentation: http://localhost:8001/docs")
        print("🔍 Library Endpoint: http://localhost:8001/api/library")
        print("❤️ Health Check: http://localhost:8001/healthz")
        print("🛑 Press Ctrl+C to stop")
        print()
        
        uvicorn.run(
            app,
            host="127.0.0.1",
            port=8001,
            reload=False,
            log_level="info",
            access_log=False
        )
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Make sure FastAPI and Uvicorn are installed:")
        print("   pip install fastapi uvicorn pydantic")
    except Exception as e:
        print(f"❌ Server error: {e}")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Installation and Setup Script for Orthodox Book API
Sacred Python + Playwright + FastAPI Integration
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a shell command with error handling"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} - Success!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - Failed!")
        print(f"Error: {e.stderr}")
        return False

def install_python_dependencies():
    """Install Python packages"""
    print("\n📦 Installing Python Dependencies...")
    
    # Check if pip is available
    if not run_command("pip --version", "Checking pip"):
        print("❌ pip not found. Please install Python and pip first.")
        return False
    
    # Install requirements
    if not run_command("pip install -r requirements.txt", "Installing Python packages"):
        return False
    
    return True

def install_playwright_browsers():
    """Install Playwright browsers"""
    print("\n🌐 Installing Playwright Browsers...")
    
    if not run_command("playwright install", "Installing browsers"):
        return False
    
    return True

def create_directories():
    """Create necessary directories"""
    print("\n📁 Creating directories...")
    
    directories = [
        "downloads",
        "logs",
        "cache"
    ]
    
    for dir_name in directories:
        Path(dir_name).mkdir(exist_ok=True)
        print(f"✅ Created directory: {dir_name}")
    
    return True

def test_installation():
    """Test the installation"""
    print("\n🧪 Testing installation...")
    
    # Test Python imports
    try:
        import playwright
        import fastapi
        import uvicorn
        print("✅ All Python packages imported successfully")
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    
    # Test Playwright
    if not run_command("playwright --help", "Testing Playwright CLI"):
        return False
    
    return True

def main():
    """Main installation process"""
    print("🕊️ Orthodox Book API - Installation Script")
    print("=" * 60)
    print("جيش المفديين (Army of the Redeemed) - Sacred Setup")
    print("=" * 60)
    
    # Check Python version
    python_version = sys.version_info
    if python_version.major < 3 or python_version.minor < 8:
        print("❌ Python 3.8+ required. Current version:", sys.version)
        return False
    
    print(f"✅ Python {python_version.major}.{python_version.minor}.{python_version.micro} detected")
    
    # Installation steps
    steps = [
        ("Creating directories", create_directories),
        ("Installing Python dependencies", install_python_dependencies),
        ("Installing Playwright browsers", install_playwright_browsers),
        ("Testing installation", test_installation)
    ]
    
    for step_name, step_func in steps:
        print(f"\n{'='*20} {step_name} {'='*20}")
        if not step_func():
            print(f"\n❌ Installation failed at: {step_name}")
            return False
    
    print("\n" + "="*60)
    print("✝️ INSTALLATION COMPLETE!")
    print("="*60)
    
    print("\n🚀 Ready to launch!")
    print("\n📋 Next Steps:")
    print("1. Start API server: python api_server.py")
    print("2. Test CLI scraper: python orthodox_scraper.py --keyword 'liturgy'")
    print("3. Integrate with Next.js: python integrate_nextjs.py")
    print("4. Start Next.js: cd ../gaish-elmafdein-nextjs && npm run dev")
    
    print("\n🔗 Useful URLs:")
    print("• API Server: http://localhost:8000")
    print("• API Docs: http://localhost:8000/docs")
    print("• Next.js App: http://localhost:3000")
    print("• Library Page: http://localhost:3000/library")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

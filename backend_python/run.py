#!/usr/bin/env python3
"""
============================================================================
FILE: backend_python/run.py
============================================================================
PURPOSE:
  Startup script for the FastAPI backend server.
  Handles environment setup and server initialization.

USAGE:
  python run.py
============================================================================
"""

import uvicorn
import os
from pathlib import Path

def main():
    """Start the FastAPI server"""
    # Set environment variables
    os.environ['PYTHONPATH'] = str(Path(__file__).parent)
    
    print("🚀 Starting EagleAI FastAPI Backend Server...")
    print("📍 Server will run on: http://localhost:3001")
    print("🔗 Health check: http://localhost:3001/health")
    print("📚 API docs: http://localhost:3001/docs")
    print("📖 ReDoc: http://localhost:3001/redoc")
    print("=" * 50)
    
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=3001,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

if __name__ == "__main__":
    main()
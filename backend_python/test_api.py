#!/usr/bin/env python3
"""
============================================================================
FILE: backend_python/test_api.py
============================================================================
PURPOSE:
  Test script to verify the FastAPI backend API endpoints.
  Tests all major functionality including file uploads.

USAGE:
  python test_api.py
============================================================================
"""

import requests
import json
import os
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:3001"
TEST_STUDENT_ID = "507f1f77bcf86cd799439011"  # Mock ObjectId

def test_health():
    """Test health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data['status']} (API: {data['api']})")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_api_docs():
    """Test API documentation endpoint"""
    print("🔍 Testing API documentation...")
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print("✅ API documentation accessible")
            return True
        else:
            print(f"❌ API docs failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API docs error: {e}")
        return False

def test_create_student():
    """Test student creation"""
    print("🔍 Testing student creation...")
    try:
        student_data = {
            "name": "Test Student",
            "email": f"test{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com",
            "university": "Test University",
            "major": "Computer Science",
            "graduationYear": 2024
        }
        
        response = requests.post(f"{BASE_URL}/api/students", json=student_data)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Student created: {data['student']['name']}")
            return data['student']['id']
        else:
            print(f"❌ Student creation failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Student creation error: {e}")
        return None

def test_resume_upload(student_id):
    """Test resume upload"""
    print("🔍 Testing resume upload...")
    try:
        # Create a dummy PDF file for testing
        test_file_path = "test_resume.pdf"
        with open(test_file_path, "wb") as f:
            f.write(b"%PDF-1.4\n%Test PDF content\n")
        
        with open(test_file_path, "rb") as f:
            files = {"resume": f}
            response = requests.post(f"{BASE_URL}/api/students/{student_id}/resume", files=files)
        
        # Clean up test file
        if os.path.exists(test_file_path):
            os.remove(test_file_path)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Resume uploaded: {data['resume']['fileName']}")
            return True
        else:
            print(f"❌ Resume upload failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Resume upload error: {e}")
        return False

def test_resume_analysis(student_id):
    """Test resume analysis"""
    print("🔍 Testing resume analysis...")
    try:
        response = requests.post(f"{BASE_URL}/api/students/{student_id}/resume/analyze")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Resume analyzed: Score {data['analysis']['overallScore']}")
            return True
        else:
            print(f"❌ Resume analysis failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Resume analysis error: {e}")
        return False

def test_resume_download(student_id):
    """Test resume download"""
    print("🔍 Testing resume download...")
    try:
        response = requests.get(f"{BASE_URL}/api/students/{student_id}/resume/download")
        if response.status_code == 200:
            print(f"✅ Resume downloaded: {len(response.content)} bytes")
            return True
        else:
            print(f"❌ Resume download failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Resume download error: {e}")
        return False

def test_get_resume(student_id):
    """Test get resume info"""
    print("🔍 Testing get resume info...")
    try:
        response = requests.get(f"{BASE_URL}/api/students/{student_id}/resume")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Resume info retrieved: {data['fileName']}")
            return True
        else:
            print(f"❌ Get resume failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Get resume error: {e}")
        return False

def test_root_endpoint():
    """Test root endpoint"""
    print("🔍 Testing root endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Root endpoint: {data['message']}")
            return True
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting EagleAI FastAPI Backend Tests")
    print("=" * 50)
    
    # Test basic endpoints
    basic_tests = [
        test_health,
        test_api_docs,
        test_root_endpoint
    ]
    
    passed = 0
    total = len(basic_tests)
    
    for test in basic_tests:
        if test():
            passed += 1
    
    if passed < total:
        print("❌ Basic tests failed. Is the server running?")
        print("   Start the server with: python run.py")
        return
    
    # Test student creation
    student_id = test_create_student()
    if not student_id:
        print("❌ Student creation failed. Cannot continue with resume tests.")
        return
    
    # Test resume operations
    resume_tests = [
        lambda: test_resume_upload(student_id),
        lambda: test_get_resume(student_id),
        lambda: test_resume_analysis(student_id),
        lambda: test_resume_download(student_id)
    ]
    
    for test in resume_tests:
        if test():
            passed += 1
        total += 1
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! FastAPI backend is working correctly.")
        print("📚 Visit http://localhost:3001/docs for interactive API documentation")
    else:
        print("⚠️  Some tests failed. Check the errors above.")

if __name__ == "__main__":
    main()
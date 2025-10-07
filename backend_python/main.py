"""
============================================================================
FILE: backend_python/main.py
============================================================================
PURPOSE:
  FastAPI backend server for EagleAI job matching and resume storage system.
  Provides REST API endpoints with automatic documentation and type safety.

FEATURES:
  - FastAPI framework with automatic OpenAPI docs
  - File upload for resumes with validation
  - MongoDB integration with Motor (async)
  - CORS support for React frontend
  - Type hints and automatic validation
  - Resume analysis and job matching
============================================================================
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pymongo import MongoClient
from bson import ObjectId
from typing import Optional, List
import os
import shutil
from datetime import datetime
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="EagleAI Backend API",
    description="Backend API for EagleAI job matching and resume storage system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
UPLOAD_DIR = Path("uploads/resumes")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# MongoDB connection
try:
    client = MongoClient("mongodb://localhost:27017/")
    db = client["eagleai-jobs"]
    students_collection = db["students"]
    jobs_collection = db["jobs"]
    logger.info("Connected to MongoDB")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    db = None

# Pydantic models for request/response validation
from pydantic import BaseModel, EmailStr
from typing import Dict, Any

class StudentCreate(BaseModel):
    name: str
    email: EmailStr
    university: Optional[str] = ""
    major: Optional[str] = ""
    graduationYear: Optional[int] = None
    skills: List[str] = []
    interests: List[str] = []
    careerGoals: List[str] = []
    jobPreferences: Dict[str, Any] = {}

class ResumeInfo(BaseModel):
    id: str
    fileName: str
    fileUrl: str
    uploadedAt: str
    fileSize: int
    analysis: Optional[Dict[str, Any]] = None

class ResumeUploadResponse(BaseModel):
    message: str
    resume: ResumeInfo

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "database": "connected" if db else "disconnected",
        "api": "FastAPI",
        "version": "1.0.0"
    }

# Resume Storage Endpoints

@app.get("/api/students/{student_id}/resume", response_model=ResumeInfo)
async def get_student_resume(student_id: str):
    """Get student's stored resume"""
    try:
        student = students_collection.find_one({"_id": ObjectId(student_id)})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        if "resumeFile" not in student:
            raise HTTPException(status_code=404, detail="No resume found")
        
        resume_data = student["resumeFile"]
        return ResumeInfo(
            id=str(student["_id"]),
            fileName=resume_data["originalName"],
            fileUrl=f"/api/students/{student_id}/resume/download",
            uploadedAt=resume_data["uploadedAt"],
            fileSize=resume_data["fileSize"],
            analysis=student.get("resumeAnalysis")
        )
    
    except Exception as e:
        logger.error(f"Error fetching resume: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch resume")

@app.post("/api/students/{student_id}/resume", response_model=ResumeUploadResponse)
async def upload_student_resume(
    student_id: str,
    resume: UploadFile = File(..., description="Resume PDF file")
):
    """Upload/Replace student resume"""
    try:
        # Validate file type
        if not resume.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Check file size
        content = await resume.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large. Maximum size is 5MB")
        
        # Get student
        student = students_collection.find_one({"_id": ObjectId(student_id)})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Generate secure filename
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"resume-{student_id}-{timestamp}-{resume.filename}"
        file_path = UPLOAD_DIR / filename
        
        # Delete old resume file if it exists
        if "resumeFile" in student and "filePath" in student["resumeFile"]:
            old_file_path = Path(student["resumeFile"]["filePath"])
            if old_file_path.exists():
                try:
                    old_file_path.unlink()
                except Exception as e:
                    logger.warning(f"Could not delete old resume file: {e}")
        
        # Save new file
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        # Update student document
        resume_data = {
            "originalName": resume.filename,
            "fileName": filename,
            "filePath": str(file_path),
            "fileSize": len(content),
            "uploadedAt": datetime.now().isoformat()
        }
        
        students_collection.update_one(
            {"_id": ObjectId(student_id)},
            {"$set": {"resumeFile": resume_data}}
        )
        
        return ResumeUploadResponse(
            message="Resume uploaded successfully",
            resume=ResumeInfo(
                id=str(student["_id"]),
                fileName=resume_data["originalName"],
                fileUrl=f"/api/students/{student_id}/resume/download",
                uploadedAt=resume_data["uploadedAt"],
                fileSize=resume_data["fileSize"]
            )
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading resume: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload resume")

@app.get("/api/students/{student_id}/resume/download")
async def download_student_resume(student_id: str):
    """Download student resume file"""
    try:
        student = students_collection.find_one({"_id": ObjectId(student_id)})
        if not student or "resumeFile" not in student:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        file_path = Path(student["resumeFile"]["filePath"])
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Resume file not found on disk")
        
        return FileResponse(
            path=str(file_path),
            filename=student["resumeFile"]["originalName"],
            media_type="application/pdf"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading resume: {e}")
        raise HTTPException(status_code=500, detail="Failed to download resume")

@app.post("/api/students/{student_id}/resume/analyze")
async def analyze_student_resume(student_id: str):
    """Analyze stored resume"""
    try:
        student = students_collection.find_one({"_id": ObjectId(student_id)})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        if "resumeFile" not in student:
            raise HTTPException(status_code=400, detail="No resume file found. Please upload a resume first.")
        
        # Mock analysis - in real implementation, you'd extract text from PDF and use AI
        analysis = {
            "overallScore": 8.5,
            "categoryScores": {
                "bulletPoints": 8,
                "header": 9,
                "education": 8,
                "experience": 9,
                "secondarySections": 7,
                "formatting": 8,
                "language": 8,
                "contentQuality": 9,
                "targeting": 8,
                "universalStandards": 8
            },
            "strengths": [
                "Strong technical skills section",
                "Quantified achievements in experience",
                "Clear and concise formatting"
            ],
            "priorityImprovements": [
                "Add more specific metrics to bullet points",
                "Include relevant keywords for target roles"
            ],
            "overallAssessment": "Strong resume with good technical content and clear structure.",
            "lastAnalyzed": datetime.now().isoformat()
        }
        
        # Update student with analysis
        students_collection.update_one(
            {"_id": ObjectId(student_id)},
            {"$set": {"resumeAnalysis": analysis}}
        )
        
        return {
            "message": "Resume analyzed successfully",
            "analysis": analysis
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing resume: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze resume")

@app.delete("/api/students/{student_id}/resume")
async def delete_student_resume(student_id: str):
    """Delete student resume"""
    try:
        student = students_collection.find_one({"_id": ObjectId(student_id)})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        if "resumeFile" not in student:
            raise HTTPException(status_code=404, detail="No resume found")
        
        # Delete file from disk
        file_path = Path(student["resumeFile"]["filePath"])
        if file_path.exists():
            try:
                file_path.unlink()
            except Exception as e:
                logger.warning(f"Could not delete resume file: {e}")
        
        # Clear resume data from student
        students_collection.update_one(
            {"_id": ObjectId(student_id)},
            {"$unset": {"resumeFile": "", "resumeText": "", "resumeAnalysis": ""}}
        )
        
        return {"message": "Resume deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting resume: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete resume")

# Student management endpoints

@app.get("/api/students")
async def get_students():
    """Get list of students"""
    try:
        students = list(students_collection.find({}, {"resumeFile": 0, "resumeText": 0, "resumeAnalysis": 0}))
        for student in students:
            student["_id"] = str(student["_id"])
        return {"students": students}
    except Exception as e:
        logger.error(f"Error fetching students: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch students")

@app.get("/api/students/{student_id}")
async def get_student(student_id: str):
    """Get specific student"""
    try:
        student = students_collection.find_one({"_id": ObjectId(student_id)})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        student["_id"] = str(student["_id"])
        return student
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching student: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch student")

@app.post("/api/students")
async def create_student(student: StudentCreate):
    """Create new student"""
    try:
        # Check if student already exists
        existing_student = students_collection.find_one({"email": student.email})
        if existing_student:
            raise HTTPException(status_code=409, detail="Student with this email already exists")
        
        # Create student document
        student_data = student.dict()
        student_data.update({
            "isActive": True,
            "createdAt": datetime.now().isoformat(),
            "lastLogin": datetime.now().isoformat()
        })
        
        result = students_collection.insert_one(student_data)
        
        return {
            "message": "Student created successfully",
            "student": {
                "id": str(result.inserted_id),
                "name": student_data["name"],
                "email": student_data["email"],
                "university": student_data["university"],
                "major": student_data["major"]
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating student: {e}")
        raise HTTPException(status_code=500, detail="Failed to create student")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "EagleAI Backend API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001, reload=True)

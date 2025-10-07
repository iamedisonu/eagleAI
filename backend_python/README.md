# EagleAI Python Backend

A Flask-based backend server for the EagleAI job matching and resume storage system.

## Features

- 🚀 **Fast Flask API** - Lightweight and fast Python web framework
- 📁 **File Upload** - Resume PDF upload and storage
- 🗄️ **MongoDB Integration** - Student and job data storage
- 🔄 **CORS Support** - Cross-origin requests for React frontend
- 📊 **Resume Analysis** - AI-powered resume scoring and feedback
- 🎯 **Job Matching** - Intelligent job-resume matching algorithms

## Quick Start

### 1. Install Python Dependencies

```bash
cd backend_python
pip install -r requirements.txt
```

### 2. Start MongoDB

Make sure MongoDB is running on `localhost:27017`

### 3. Run the Server

```bash
python run.py
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Resume Management
- `GET /api/students/{id}/resume` - Get stored resume
- `POST /api/students/{id}/resume` - Upload resume
- `GET /api/students/{id}/resume/download` - Download resume
- `POST /api/students/{id}/resume/analyze` - Analyze resume
- `DELETE /api/students/{id}/resume` - Delete resume

### Student Management
- `GET /api/students` - List all students
- `GET /api/students/{id}` - Get specific student
- `POST /api/students` - Create new student

## Configuration

The server uses these default settings:
- **Port**: 3001
- **Upload Folder**: `uploads/resumes`
- **Max File Size**: 5MB
- **Allowed Extensions**: PDF only
- **MongoDB**: `mongodb://localhost:27017/eagleai-jobs`

## File Structure

```
backend_python/
├── app.py              # Main Flask application
├── run.py              # Startup script
├── requirements.txt    # Python dependencies
├── README.md          # This file
└── uploads/           # Resume file storage (created automatically)
    └── resumes/
```

## Development

### Adding New Endpoints

1. Add route function to `app.py`
2. Use `@app.route()` decorator
3. Handle errors with try/catch
4. Return JSON responses

### Database Operations

```python
# Get student
student = students_collection.find_one({'_id': ObjectId(student_id)})

# Update student
students_collection.update_one(
    {'_id': ObjectId(student_id)},
    {'$set': {'field': 'value'}}
)

# Insert new document
result = students_collection.insert_one(data)
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `app.py`

2. **File Upload Errors**
   - Check file size (max 5MB)
   - Ensure file is PDF format
   - Verify upload folder permissions

3. **CORS Issues**
   - Frontend and backend on different ports
   - Check Flask-CORS configuration

### Logs

The server logs all requests and errors. Check console output for debugging information.

## Production Deployment

For production deployment:

1. Set `FLASK_ENV=production`
2. Use a production WSGI server (gunicorn)
3. Configure proper MongoDB authentication
4. Set up file storage (AWS S3, etc.)
5. Add proper error handling and logging

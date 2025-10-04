/*
============================================================================
FILE: src/components/resume/ResumeUpload.jsx
============================================================================
PURPOSE:
  File upload interface for PDF resume files with drag-and-drop functionality,
  validation, and user guidance.

FEATURES:
  - Drag and drop file upload
  - PDF file validation (type and size)
  - Visual upload feedback
  - File size and format guidance
  - OC brand styling

PROPS:
  - onFileUpload: Function to handle successful file upload
============================================================================
*/

import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const ResumeUpload = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setError('');
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }
    
    // Validate file size (1MB limit)
    if (file.size > 1024 * 1024) {
      setError('File size must be less than 1MB.');
      return;
    }
    
    setUploadedFileName(file.name);
    onFileUpload(file);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-brand-white rounded-lg md:rounded-xl p-6 shadow-lg">
      <div className="text-center">
        <h3 className="text-xl font-bold text-brand-maroon mb-2">
          Upload Your Resume
        </h3>
        <p className="text-gray-600 mb-6">
          Upload a PDF version of your resume to get AI-powered feedback
        </p>

        {/* Upload area */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
            dragActive
              ? 'border-brand-maroon bg-brand-maroon/5'
              : 'border-gray-300 hover:border-brand-maroon hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="hidden"
          />
          
          <div className="flex flex-col items-center">
            <div className="bg-brand-maroon/10 p-4 rounded-full mb-4">
              <Upload className="text-brand-maroon" size={32} />
            </div>
            
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              {uploadedFileName ? 'File Ready for Analysis' : 'Drag & Drop your PDF here'}
            </h4>
            
            {uploadedFileName ? (
              <div className="flex items-center gap-2 text-accent-teal mb-4">
                <CheckCircle size={20} />
                <span className="font-medium">{uploadedFileName}</span>
              </div>
            ) : (
              <p className="text-gray-600 mb-4">
                or click to browse files
              </p>
            )}
            
            <button
              onClick={openFileDialog}
              className="bg-brand-maroon text-brand-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-crimson transition-colors duration-200"
            >
              {uploadedFileName ? 'Choose Different File' : 'Choose File'}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 flex items-center gap-2 text-brand-crimson bg-brand-crimson/10 p-3 rounded-lg">
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* File requirements */}
        <div className="mt-6 text-left">
          <h4 className="font-semibold text-gray-800 mb-3">File Requirements:</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FileText className="text-brand-maroon" size={16} />
              <span>PDF format only</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="text-brand-maroon" size={16} />
              <span>Maximum file size: 1MB</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="text-brand-maroon" size={16} />
              <span>Text-based PDF (not scanned image)</span>
            </div>
          </div>
        </div>

        {/* Privacy notice */}
        <div className="mt-6 bg-accent-teal-soft border border-accent-teal rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-accent-teal mt-0.5" size={16} />
            <div className="text-sm">
              <p className="font-semibold text-accent-teal mb-1">Privacy Notice</p>
              <p className="text-gray-700">
                Your resume is processed securely and is not stored permanently. 
                All analysis is done using AI and should be supplemented with human feedback.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;

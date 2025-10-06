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
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';

const ResumeUpload = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
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
    
    console.log('File selected:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }
    
    setUploadedFileName(file.name);
    setUploadedFile(file);
    console.log('File ready for upload:', file.name);
    console.log('Uploaded file state:', file);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setUploadedFileName('');
    setUploadedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {/* Upload area */}
      <div
                className={`relative border-2 border-dashed rounded-lg p-12 transition-all duration-200 ${
                  dragActive
                    ? 'border-brand-maroon bg-primary-50'
                    : 'border-gray-300 hover:border-brand-maroon hover:bg-primary-50'
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
        
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary-100 p-6 rounded-full mb-6">
                    <Upload className="text-brand-maroon" size={48} />
                  </div>
                  
                  <p className="text-gray-700 mb-2 text-lg">
                    Drag and drop or <span className="text-brand-maroon font-semibold cursor-pointer" onClick={openFileDialog}>browse</span> to upload your file.
                  </p>
                  
                  <p className="text-gray-500 text-sm">
                    PDF (Max Size: 5 MB)
                  </p>
                </div>
      </div>

      {/* File Preview */}
      {uploadedFileName && uploadedFile && (
        <div className="mt-4 bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 p-2 rounded-lg">
              <FileText className="text-brand-maroon" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-brand-maroon font-medium">{uploadedFileName}</p>
              <p className="text-primary-600 text-sm">
                {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-brand-maroon" size={20} />
              <button
                onClick={removeFile}
                className="p-1 rounded-full hover:bg-primary-200 transition-colors duration-200"
                title="Remove file"
              >
                <X className="text-brand-maroon" size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Get Feedback Button */}
      {uploadedFileName && uploadedFile && (
        <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      console.log('Get Feedback clicked, file:', uploadedFile);
                      onFileUpload(uploadedFile);
                    }}
                    className="bg-brand-maroon text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-crimson transition-colors duration-200"
                  >
                    Get Feedback
                  </button>
        </div>
      )}

    </div>
  );
};

export default ResumeUpload;

/*
============================================================================
FILE: src/components/debug/SimpleTest.jsx
============================================================================
PURPOSE:
  Simple test component to verify the resume upload is working.
============================================================================
*/

import { useState } from 'react';
import { FileText, Upload, CheckCircle } from 'lucide-react';

const SimpleTest = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('Ready');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus('File selected: ' + selectedFile.name);
    }
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="text-green-600" size={20} />
        <h3 className="font-semibold text-green-800">Simple Test Component</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test File Upload:
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-maroon file:text-white hover:file:bg-brand-crimson"
          />
        </div>
        
        <div className="text-sm">
          <div className="font-medium text-gray-700">Status: {status}</div>
          {file && (
            <div className="text-gray-600">
              <div>File: {file.name}</div>
              <div>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</div>
              <div>Type: {file.type}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleTest;

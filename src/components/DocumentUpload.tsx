'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';

interface DocumentUploadProps {
  onUploadComplete: () => void;
}

export default function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Unsupported file type. Please upload PDF, DOCX, TXT, or MD files.');
      return;
    }

    // Validate file size (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 50MB.');
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      // Success
      setSelectedFile(null);
      onUploadComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      {!selectedFile && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-gray-600 hover:border-gray-500'
          }`}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">
            Drop your file here or click to browse
          </p>
          <p className="text-gray-400 text-sm">
            Supported formats: PDF, DOCX, TXT, MD (Max 50MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      )}

      {/* Selected File */}
      {selectedFile && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-white font-semibold">{selectedFile.name}</p>
                <p className="text-gray-400 text-sm">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!uploading && (
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </button>
            {!uploading && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}


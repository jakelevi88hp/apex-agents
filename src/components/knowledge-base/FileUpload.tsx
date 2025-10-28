'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
}

export function FileUpload({ onUpload }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setProgress(0);

    for (const file of acceptedFiles) {
      try {
        await onUpload(file);
        setProgress((prev) => prev + (100 / acceptedFiles.length));
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }

    setUploading(false);
    setProgress(0);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/markdown': ['.md'],
    },
    multiple: true,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl">📁</div>
          
          {uploading ? (
            <div className="w-full max-w-xs">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Uploading... {Math.round(progress)}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : isDragActive ? (
            <p className="text-gray-700 font-medium">Drop files here...</p>
          ) : (
            <>
              <p className="text-gray-700 font-medium">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supports: TXT, PDF, DOC, DOCX, MD
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


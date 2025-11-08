'use client';

import { useState, useCallback } from 'react';
import { Upload, X, File, Image, FileText, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploading: boolean;
  error?: string;
}

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export default function FileUpload({
  onFilesUploaded,
  maxFiles = 5,
  maxSizeMB = 10,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const validateFile = (file: globalThis.File): string | null => {
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/markdown',
      'text/x-typescript',
      'text/x-python',
      'text/javascript',
      'application/json',
    ];

    if (!allowedTypes.some(type => file.type.includes(type) || file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.py') || file.name.endsWith('.js') || file.name.endsWith('.jsx') || file.name.endsWith('.md'))) {
      return 'File type not supported';
    }

    return null;
  };

  const uploadFileMutation = trpc.aiAdmin.uploadFile.useMutation();

  const uploadFile = async (file: globalThis.File): Promise<UploadedFile> => {
    const uploadedFile: UploadedFile = {
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      type: file.type,
      uploading: true,
    };

    try {
      // Convert file to base64
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const result = await uploadFileMutation.mutateAsync({
        fileName: file.name,
        fileData,
        contentType: file.type,
      });
      
      uploadedFile.uploading = false;
      uploadedFile.url = result.data.url;
      
      return uploadedFile;
    } catch (error) {
      uploadedFile.uploading = false;
      uploadedFile.error = 'Upload failed';
      return uploadedFile;
    }
  };

  const handleFiles = async (fileList: FileList) => {
    const newFiles = Array.from(fileList);
    
    if (files.length + newFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validatedFiles: UploadedFile[] = [];

    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        validatedFiles.push({
          id: Math.random().toString(36).substring(7),
          name: file.name,
          size: file.size,
          type: file.type,
          uploading: false,
          error,
        });
      } else {
        const uploadedFile = await uploadFile(file);
        validatedFiles.push(uploadedFile);
      }
    }

    const updatedFiles = [...files, ...validatedFiles];
    setFiles(updatedFiles);
    onFilesUploaded(updatedFiles.filter(f => !f.error && !f.uploading));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [files]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    onFilesUploaded(updatedFiles.filter(f => !f.error && !f.uploading));
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleFileInput}
          className="hidden"
          accept="image/*,.pdf,.txt,.md,.ts,.tsx,.js,.jsx,.py,.json"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <Upload className="w-8 h-8 text-gray-400" />
          <div className="text-sm text-gray-300">
            <span className="text-purple-400 hover:text-purple-300">Click to upload</span>
            {' '}or drag and drop
          </div>
          <div className="text-xs text-gray-500">
            Images, PDFs, code files (max {maxSizeMB}MB, up to {maxFiles} files)
          </div>
        </label>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700"
            >
              <div className="text-gray-400">
                {getFileIcon(file.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{file.name}</div>
                <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
              </div>

              {file.uploading && (
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              )}

              {file.error && (
                <div className="text-xs text-red-400">{file.error}</div>
              )}

              <button
                onClick={() => removeFile(file.id)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

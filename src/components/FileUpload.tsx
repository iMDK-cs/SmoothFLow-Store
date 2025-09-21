"use client";

import React, { useState, useRef, useCallback } from 'react';
import { validateFileType, validateFileSize, getFileSizeInMB, getFileTypeErrorMessage, getFileSizeErrorMessage } from '@/lib/fileValidation';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  loading?: boolean;
  error?: string;
}

export default function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  loading = false,
  error
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  }, []);

  const handleFile = (file: File) => {
    setFileError('');

    // Validate file type
    if (!validateFileType(file)) {
      setFileError(getFileTypeErrorMessage());
      return;
    }

    // Validate file size
    if (!validateFileSize(file)) {
      setFileError(getFileSizeErrorMessage());
      return;
    }

    onFileSelect(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFileError('');
    onFileRemove();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50/10'
            : selectedFile
            ? 'border-green-400 bg-green-50/10'
            : 'border-gray-600 bg-gray-800/50'
        } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileInput}
          className="hidden"
          disabled={loading}
        />

        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center text-green-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">{selectedFile.name}</p>
              <p className="text-gray-400 text-sm">
                {getFileSizeInMB(selectedFile)} ميجابايت
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-red-400 hover:text-red-300 text-sm"
              disabled={loading}
            >
              إزالة الملف
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium mb-2">
                اسحب الملف هنا أو اضغط للاختيار
              </p>
              <p className="text-gray-400 text-sm mb-4">
                PDF, JPG, PNG (حد أقصى 10 ميجابايت)
              </p>
              <button
                type="button"
                onClick={openFileDialog}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                disabled={loading}
              >
                {loading ? 'جاري الرفع...' : 'اختيار ملف'}
              </button>
            </div>
          </div>
        )}
      </div>

      {(fileError || error) && (
        <p className="mt-2 text-red-400 text-sm text-center">
          {fileError || error}
        </p>
      )}
    </div>
  );
}
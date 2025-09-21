"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface AdminFileViewerProps {
  orderId: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  uploadedAt?: string;
}

const AdminFileViewer: React.FC<AdminFileViewerProps> = ({
  orderId,
  fileName,
  fileType,
  fileSize,
  uploadedAt
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fileUrl = `/api/admin/files/${orderId}`;
  const isImage = fileType.startsWith('image/');
  const isPDF = fileType === 'application/pdf';

  const handleViewFile = () => {
    setIsLoading(true);
    setError('');
    
    // Open file in new tab
    window.open(fileUrl, '_blank');
    
    // Reset loading state after a delay
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleDownloadFile = () => {
    setIsLoading(true);
    setError('');
    
    // Create download link
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Reset loading state after a delay
    setTimeout(() => setIsLoading(false), 1000);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    if (isPDF) return '📄';
    if (isImage) return '🖼️';
    return '📎';
  };

  const formatFileName = (fileName: string) => {
    // Extract just the filename without the technical prefix
    const cleanName = fileName.replace(/^receipt_[a-zA-Z0-9_]+_/, '');
    
    // If it's a receipt file, show a friendly name
    if (fileName.includes('receipt_')) {
      const date = new Date().toLocaleDateString('en-GB');
      return `إيصال التحويل البنكي - ${date}.pdf`;
    }
    
    return cleanName;
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3 space-x-reverse">
          <span className="text-2xl">{getFileIcon()}</span>
          <div>
            <h4 className="text-white font-medium text-sm">إيصال التحويل البنكي</h4>
            <p className="text-gray-300 text-xs">{formatFileName(fileName)}</p>
            {fileSize && (
              <p className="text-gray-400 text-xs">{formatFileSize(fileSize)}</p>
            )}
            {uploadedAt && (
              <p className="text-gray-400 text-xs">
                رفع في: {new Date(uploadedAt).toLocaleDateString('en-GB')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* File Preview */}
      <div className="mb-4">
        {isImage ? (
          <div className="relative">
            <Image
              src={fileUrl}
              alt="إيصال التحويل"
              width={400}
              height={256}
              className="w-full max-h-64 object-contain rounded border border-gray-600"
              onError={() => setError('فشل في تحميل الصورة')}
              onLoad={() => setIsLoading(false)}
              unoptimized
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 rounded">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        ) : isPDF ? (
          <div className="bg-gray-800 rounded border border-gray-600 p-4 text-center">
            <div className="text-4xl mb-2">📄</div>
            <p className="text-gray-300 text-sm mb-2">ملف PDF</p>
            <p className="text-gray-400 text-xs">{formatFileName(fileName)}</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded border border-gray-600 p-4 text-center">
            <div className="text-4xl mb-2">📎</div>
            <p className="text-gray-300 text-sm mb-2">ملف مرفق</p>
            <p className="text-gray-400 text-xs">{formatFileName(fileName)}</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded p-3 mb-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2 space-x-reverse">
        <button
          onClick={handleViewFile}
          disabled={isLoading}
          className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
        >
          {isLoading ? 'جاري التحميل...' : 'عرض الملف'}
        </button>
        <button
          onClick={handleDownloadFile}
          disabled={isLoading}
          className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
        >
          {isLoading ? 'جاري التحميل...' : 'تحميل الملف'}
        </button>
      </div>
    </div>
  );
};

export default AdminFileViewer;
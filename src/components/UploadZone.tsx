import React, { useState, useRef, useCallback } from 'react';
import { Upload, Plus, Film } from 'lucide-react';
import { useLibrary } from '../contexts/LibraryContext';

const UploadZone: React.FC = () => {
  const { addVideo, uploadProgress } = useLibrary();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    
    await handleFilesUpload(files);
  }, [addVideo]);

  const handleFileInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    await handleFilesUpload(files);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addVideo]);

  const handleFilesUpload = async (files: File[]) => {
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    if (videoFiles.length === 0) {
      alert('Please select video files only.');
      return;
    }
    
    setIsUploading(true);
    
    try {
      for (const file of videoFiles) {
        await addVideo(file);
      }
    } catch (error) {
      console.error('Error uploading videos:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Calculate total upload progress
  const anyUploadsInProgress = Object.keys(uploadProgress).length > 0;
  const averageProgress = anyUploadsInProgress
    ? Object.values(uploadProgress).reduce((sum, progress) => sum + progress, 0) / Object.keys(uploadProgress).length
    : 0;

  return (
    <div 
      className={`
        relative w-full h-48 rounded-lg border-2 border-dashed transition-all duration-300 overflow-hidden
        ${isDragging 
          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
          : 'border-gray-300 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700'}
        ${isUploading ? 'cursor-wait' : 'cursor-pointer'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleButtonClick}
    >
      {/* Progress overlay */}
      {anyUploadsInProgress && (
        <div 
          className="absolute inset-0 bg-purple-600 opacity-20 dark:opacity-30 transition-all"
          style={{ width: `${averageProgress}%` }}
        />
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="video/*"
        multiple
        onChange={handleFileInputChange}
      />
      
      <div className="flex flex-col items-center justify-center h-full p-6 text-center z-10 relative">
        {isUploading ? (
          <>
            <Film className="w-12 h-12 text-purple-500 mb-2 animate-pulse" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
              Processing videos... {Math.round(averageProgress)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Please wait while we process your videos
            </p>
          </>
        ) : (
          <>
            {isDragging ? (
              <>
                <Upload className="w-12 h-12 text-purple-500 mb-2" />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                  Drop videos here
                </p>
              </>
            ) : (
              <>
                <Plus className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-2" />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                  Add videos to your library
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Drag and drop video files or click to browse
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UploadZone;
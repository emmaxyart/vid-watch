import { VideoFile } from '../types';

// Generate a thumbnail from a video file
export const generateThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Create video element to extract thumbnail
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      // Seek to a position to capture thumbnail
      video.currentTime = video.duration * 0.25; // 25% into the video
    };
    
    video.onseeked = () => {
      // Create canvas to draw the thumbnail
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 180;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject('Could not get canvas context');
        return;
      }
      
      // Draw the video frame to the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
      
      // Clean up
      URL.revokeObjectURL(video.src);
      
      resolve(thumbnailUrl);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject('Error generating thumbnail');
    };
    
    // Set video source
    video.src = URL.createObjectURL(file);
  });
};

// Get video duration
export const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject('Error getting video duration');
    };
    
    video.src = URL.createObjectURL(file);
  });
};

// Format file size to human-readable format
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format duration to HH:MM:SS
export const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  
  if (hrs > 0) {
    parts.push(hrs.toString().padStart(2, '0'));
  }
  
  parts.push(mins.toString().padStart(2, '0'));
  parts.push(secs.toString().padStart(2, '0'));
  
  return parts.join(':');
};

// Process and prepare a video file for storage
export const processVideoFile = async (file: File): Promise<VideoFile> => {
  try {
    const [thumbnail, duration] = await Promise.all([
      generateThumbnail(file),
      getVideoDuration(file)
    ]);
    
    return {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      duration,
      thumbnail,
      addedAt: Date.now(),
      favorite: false
    };
  } catch (error) {
    console.error('Error processing video:', error);
    
    // Return basic info if processing fails
    return {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      addedAt: Date.now(),
      favorite: false
    };
  }
};
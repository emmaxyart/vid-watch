import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { VideoFile, SortOption, FilterOption, StorageStats } from '../types';
import { 
  initDatabase, 
  getAllVideos, 
  saveVideo, 
  getVideoMetadata, 
  getVideoData, 
  updateVideoMetadata, 
  deleteVideo,
  getStorageStats
} from '../utils/database';
import { processVideoFile } from '../utils/videoUtils';

interface LibraryContextType {
  videos: VideoFile[];
  loading: boolean;
  error: string | null;
  sortOption: SortOption;
  filterOption: FilterOption;
  searchQuery: string;
  storageStats: StorageStats;
  uploadProgress: { [key: string]: number };
  addVideo: (file: File) => Promise<string>;
  getVideo: (id: string) => Promise<{ metadata: VideoFile; data: Blob }>;
  updateVideo: (video: VideoFile) => Promise<void>;
  removeVideo: (id: string) => Promise<void>;
  setSortOption: (option: SortOption) => void;
  setFilterOption: (option: FilterOption) => void;
  setSearchQuery: (query: string) => void;
  toggleFavorite: (id: string) => Promise<void>;
  updateWatchProgress: (id: string, progress: number) => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('date-added');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [storageStats, setStorageStats] = useState<StorageStats>({
    used: 0,
    total: 0,
    percentage: 0
  });
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // Initialize database and load videos
  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        await loadVideos();
        await updateStorageStats();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error initializing database');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const loadVideos = async () => {
    try {
      const allVideos = await getAllVideos();
      setVideos(allVideos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    }
  };

  const updateStorageStats = async () => {
    try {
      const { used, available } = await getStorageStats();
      const total = used + available;
      const percentage = total > 0 ? (used / total) * 100 : 0;
      
      setStorageStats({
        used,
        total,
        percentage
      });
    } catch (err) {
      console.error('Failed to get storage stats:', err);
    }
  };

  const addVideo = async (file: File): Promise<string> => {
    try {
      const tempId = crypto.randomUUID();
      
      // Start progress tracking
      setUploadProgress(prev => ({ ...prev, [tempId]: 0 }));
      
      // Process video to extract metadata
      const videoMetadata = await processVideoFile(file);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[tempId] || 0;
          if (currentProgress >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, [tempId]: currentProgress + 5 };
        });
      }, 200);
      
      // Save to IndexedDB
      const id = await saveVideo(videoMetadata, file);
      
      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [tempId]: 100 }));
      
      // Refresh videos list
      await loadVideos();
      await updateStorageStats();
      
      // Clean up progress tracker after a delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const { [tempId]: _, ...rest } = prev;
          return rest;
        });
      }, 1000);
      
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add video');
      throw err;
    }
  };

  const getVideo = async (id: string) => {
    try {
      const [metadata, data] = await Promise.all([
        getVideoMetadata(id),
        getVideoData(id)
      ]);
      
      return { metadata, data };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get video');
      throw err;
    }
  };

  const updateVideo = async (video: VideoFile) => {
    try {
      await updateVideoMetadata(video);
      await loadVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update video');
      throw err;
    }
  };

  const removeVideo = async (id: string) => {
    try {
      await deleteVideo(id);
      await loadVideos();
      await updateStorageStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove video');
      throw err;
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      const video = await getVideoMetadata(id);
      video.favorite = !video.favorite;
      await updateVideoMetadata(video);
      await loadVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
      throw err;
    }
  };

  const updateWatchProgress = async (id: string, progress: number) => {
    try {
      const video = await getVideoMetadata(id);
      video.watchProgress = progress;
      video.lastWatched = Date.now();
      await updateVideoMetadata(video);
      await loadVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update watch progress');
      throw err;
    }
  };

  const value = {
    videos,
    loading,
    error,
    sortOption,
    filterOption,
    searchQuery,
    storageStats,
    uploadProgress,
    addVideo,
    getVideo,
    updateVideo,
    removeVideo,
    setSortOption,
    setFilterOption,
    setSearchQuery,
    toggleFavorite,
    updateWatchProgress
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
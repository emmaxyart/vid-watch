import React from 'react';
import { Database, HardDrive } from 'lucide-react';
import { useLibrary } from '../contexts/LibraryContext';
import { formatFileSize } from '../utils/videoUtils';

const StorageUsage: React.FC = () => {
  const { storageStats, videos } = useLibrary();
  
  // Calculate video count stats
  const totalVideos = videos.length;
  const favoriteVideos = videos.filter(v => v.favorite).length;
  const unwatchedVideos = videos.filter(v => !v.lastWatched).length;
  const inProgressVideos = videos.filter(
    v => v.watchProgress !== undefined && v.watchProgress > 0 && v.watchProgress < 0.95
  ).length;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <Database className="w-5 h-5 mr-2 text-purple-500" />
            Storage Usage
          </h3>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {formatFileSize(storageStats.used)} / {formatFileSize(storageStats.total)}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
          <div 
            className={`h-full rounded-full ${
              storageStats.percentage > 90 
                ? 'bg-red-500' 
                : storageStats.percentage > 70 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
            }`}
            style={{ width: `${storageStats.percentage}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {storageStats.percentage.toFixed(1)}% of available storage used
        </p>
        
        {/* Video stats */}
        <div className="flex flex-wrap -mx-2">
          <div className="w-1/2 px-2 mb-4">
            <div className="flex items-center">
              <HardDrive className="w-4 h-4 text-purple-500 mr-2" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Total Videos:
              </span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {totalVideos}
            </p>
          </div>
          
          <div className="w-1/2 px-2 mb-4">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">❤</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Favorites:
              </span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {favoriteVideos}
            </p>
          </div>
          
          <div className="w-1/2 px-2">
            <div className="flex items-center">
              <span className="text-blue-500 mr-2">🆕</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Unwatched:
              </span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {unwatchedVideos}
            </p>
          </div>
          
          <div className="w-1/2 px-2">
            <div className="flex items-center">
              <span className="text-yellow-500 mr-2">⏳</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                In Progress:
              </span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {inProgressVideos}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageUsage;
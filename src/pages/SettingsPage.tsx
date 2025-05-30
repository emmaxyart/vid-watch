import React, { useState } from 'react';
import Header from '../components/Header';
import { Trash2, Database, HardDrive, RefreshCw } from 'lucide-react';
import { useLibrary } from '../contexts/LibraryContext';
import { formatFileSize } from '../utils/videoUtils';

const SettingsPage: React.FC = () => {
  const { videos, storageStats, removeVideo } = useLibrary();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  
  const handleClearLibrary = async () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    
    setDeletingAll(true);
    
    try {
      // Delete all videos one by one
      for (const video of videos) {
        await removeVideo(video.id);
      }
    } catch (error) {
      console.error('Error clearing library:', error);
    } finally {
      setDeletingAll(false);
      setIsConfirmingDelete(false);
    }
  };
  
  const cancelClearLibrary = () => {
    setIsConfirmingDelete(false);
  };
  
  // Check storage permissions
  const requestStorageAccess = async () => {
    try {
      if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persist();
        alert(`Storage persistence ${isPersisted ? 'granted' : 'denied'}`);
      } else {
        alert('Storage persistence not supported in this browser');
      }
    } catch (error) {
      console.error('Error requesting storage persistence:', error);
      alert('Failed to request storage persistence');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Settings
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Storage section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                <Database className="w-5 h-5 mr-2 text-purple-500" />
                Storage
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Used Storage</p>
                  <div className="flex items-center justify-between">
                    <div className="w-full max-w-md">
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
                    </div>
                    <span className="ml-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {storageStats.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {formatFileSize(storageStats.used)} used of {formatFileSize(storageStats.total)} available
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Video Library</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {videos.length} videos ({formatFileSize(videos.reduce((total, video) => total + video.size, 0))})
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={requestStorageAccess}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <HardDrive className="w-4 h-4 mr-2" />
                    Request Persistent Storage
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    This helps prevent the browser from automatically clearing your video library
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Library management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                <RefreshCw className="w-5 h-5 mr-2 text-purple-500" />
                Library Management
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Clear your entire video library to free up space. This action cannot be undone.
                  </p>
                  
                  {isConfirmingDelete ? (
                    <div className="space-y-3">
                      <p className="text-red-500 dark:text-red-400 font-medium">
                        Are you sure? This will delete {videos.length} videos permanently.
                      </p>
                      <div className="flex space-x-3">
                        <button 
                          onClick={handleClearLibrary}
                          disabled={deletingAll}
                          className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${
                            deletingAll ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {deletingAll ? 'Deleting...' : 'Yes, Delete All'}
                        </button>
                        <button 
                          onClick={cancelClearLibrary}
                          disabled={deletingAll}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={handleClearLibrary}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      disabled={videos.length === 0}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Entire Library
                    </button>
                  )}
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">About</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    OfflineVid v1.0.0<br />
                    This app stores all videos locally in your browser's storage.<br />
                    No data is sent to any server. Your videos remain private and accessible offline.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
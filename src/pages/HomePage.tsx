import React from 'react';
import Header from '../components/Header';
import UploadZone from '../components/UploadZone';
import VideoGrid from '../components/VideoGrid';
import StorageUsage from '../components/StorageUsage';
import { useLibrary } from '../contexts/LibraryContext';

const HomePage: React.FC = () => {
  const { loading } = useLibrary();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-3/4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Your Video Library
            </h1>
            
            <UploadZone />
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-t-purple-500 border-purple-200 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="mt-8">
                <VideoGrid />
              </div>
            )}
          </div>
          
          <div className="lg:w-1/4">
            <StorageUsage />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
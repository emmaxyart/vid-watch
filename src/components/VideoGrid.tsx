import React, { useMemo } from 'react';
import { SortOption, FilterOption, VideoFile } from '../types';
import { useLibrary } from '../contexts/LibraryContext';
import VideoCard from './VideoCard';
import { Filter, SortAsc, SortDesc, Search } from 'lucide-react';

interface VideoGridProps {
  className?: string;
}

const VideoGrid: React.FC<VideoGridProps> = ({ className }) => {
  const { 
    videos, 
    sortOption, 
    filterOption, 
    searchQuery,
    setSortOption, 
    setFilterOption 
  } = useLibrary();

  // Filter and sort videos
  const filteredAndSortedVideos = useMemo(() => {
    // First filter
    let result = [...videos];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(video => 
        video.name.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    switch (filterOption) {
      case 'favorites':
        result = result.filter(video => video.favorite);
        break;
      case 'unwatched':
        result = result.filter(video => !video.lastWatched);
        break;
      case 'in-progress':
        result = result.filter(video => 
          video.watchProgress !== undefined && 
          video.watchProgress > 0 && 
          video.watchProgress < 0.95
        );
        break;
      case 'all':
      default:
        // No filtering needed
        break;
    }
    
    // Then sort
    result.sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return b.size - a.size;
        case 'last-watched':
          if (!a.lastWatched) return 1;
          if (!b.lastWatched) return -1;
          return b.lastWatched - a.lastWatched;
        case 'date-added':
        default:
          return b.addedAt - a.addedAt;
      }
    });
    
    return result;
  }, [videos, sortOption, filterOption, searchQuery]);

  // Toggle sort between different options
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value as SortOption);
  };

  // Toggle filter between different options
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterOption(e.target.value as FilterOption);
  };

  return (
    <div className={className}>
      {/* Filter and sort controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
          <Filter className="w-5 h-5" />
          <select
            value={filterOption}
            onChange={handleFilterChange}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Videos</option>
            <option value="favorites">Favorites</option>
            <option value="unwatched">Unwatched</option>
            <option value="in-progress">In Progress</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
          {sortOption.includes('date') || sortOption === 'last-watched' ? (
            <SortDesc className="w-5 h-5" />
          ) : (
            <SortAsc className="w-5 h-5" />
          )}
          <select
            value={sortOption}
            onChange={handleSortChange}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm"
          >
            <option value="date-added">Date Added</option>
            <option value="name">Name</option>
            <option value="size">Size</option>
            <option value="last-watched">Last Watched</option>
          </select>
        </div>
      </div>
      
      {/* No videos message */}
      {filteredAndSortedVideos.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-md">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          
          {searchQuery ? (
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              No videos found matching "{searchQuery}"
            </p>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                No videos in your library{filterOption !== 'all' ? ` (${filterOption})` : ''}
              </p>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Upload videos to start building your offline collection
              </p>
            </>
          )}
        </div>
      )}
      
      {/* Video grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedVideos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;
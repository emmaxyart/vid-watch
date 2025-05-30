import React from 'react';
import { Play, Heart, Clock, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VideoFile } from '../types';
import { formatDuration, formatFileSize } from '../utils/videoUtils';
import { useLibrary } from '../contexts/LibraryContext';

interface VideoCardProps {
  video: VideoFile;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const { toggleFavorite, removeVideo } = useLibrary();

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(video.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this video?')) {
      removeVideo(video.id);
    }
  };

  return (
    <Link 
      to={`/watch/${video.id}`}
      className="group rounded-lg overflow-hidden bg-gray-900 shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-800 overflow-hidden">
        {video.thumbnail ? (
          <img 
            src={video.thumbnail} 
            alt={video.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <Play className="w-16 h-16 text-gray-600" />
          </div>
        )}
        
        {/* Progress bar if video has been watched */}
        {video.watchProgress !== undefined && video.watchProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <div 
              className="h-full bg-purple-500" 
              style={{ width: `${video.watchProgress * 100}%` }}
            />
          </div>
        )}
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
          <div className="w-16 h-16 rounded-full bg-purple-600/80 flex items-center justify-center">
            <Play className="w-8 h-8 text-white" fill="white" />
          </div>
        </div>
        
        {/* Duration badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 px-2 py-1 text-xs font-medium bg-black/70 text-white rounded">
            {formatDuration(video.duration)}
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-white truncate" title={video.name}>
            {video.name}
          </h3>
          
          <button
            onClick={handleFavoriteToggle}
            className={`p-1 rounded-full ${video.favorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
            title={video.favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className="w-5 h-5" fill={video.favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        <div className="mt-2 flex items-center text-sm text-gray-400">
          <p className="mr-4">{formatFileSize(video.size)}</p>
          
          {video.lastWatched && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{new Date(video.lastWatched).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-500"
            title="Delete video"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
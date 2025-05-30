import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, Download, Share } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import { useLibrary } from '../contexts/LibraryContext';
import { formatFileSize, formatDuration } from '../utils/videoUtils';

const WatchPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { getVideo, toggleFavorite } = useLibrary();
  
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadVideo = async () => {
      if (!videoId) {
        setError('No video ID provided');
        setLoading(false);
        return;
      }
      
      try {
        const { metadata, data } = await getVideo(videoId);
        
        // Create a blob URL for the video
        const url = URL.createObjectURL(data);
        
        setVideoUrl(url);
        setMetadata(metadata);
        setLoading(false);
      } catch (err) {
        console.error('Error loading video:', err);
        setError('Failed to load video. It may have been deleted or is corrupt.');
        setLoading(false);
      }
    };
    
    loadVideo();
    
    // Clean up blob URL when component unmounts
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoId, getVideo]);
  
  const handleDownload = () => {
    if (!videoUrl || !metadata) return;
    
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = metadata.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const handleShare = async () => {
    if (!metadata) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: metadata.name,
          text: `Check out this video: ${metadata.name}`,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      alert('Web Share API is not supported in your browser');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-purple-500 border-purple-200/20 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error || !videoUrl || !metadata) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white p-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Video Not Found</h2>
          <p className="mb-6">{error || 'Unable to load the requested video.'}</p>
          <Link 
            to="/" 
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Library
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black">
      {/* Video player */}
      <div className="w-full max-h-screen">
        <VideoPlayer 
          videoId={videoId!} 
          videoUrl={videoUrl} 
          metadata={metadata} 
        />
      </div>
      
      {/* Video details */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <Link 
            to="/" 
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Library
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {metadata.name}
            </h1>
            
            <div className="flex items-center text-gray-400 text-sm space-x-4">
              <span>{formatFileSize(metadata.size)}</span>
              {metadata.duration && <span>{formatDuration(metadata.duration)}</span>}
              {metadata.addedAt && (
                <span>Added {new Date(metadata.addedAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => toggleFavorite(videoId!)}
              className={`p-2 rounded-full ${
                metadata.favorite 
                  ? 'bg-red-500/20 text-red-500' 
                  : 'bg-gray-800 text-gray-400 hover:text-red-500'
              }`}
              title={metadata.favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className="w-5 h-5" fill={metadata.favorite ? 'currentColor' : 'none'} />
            </button>
            
            <button
              onClick={handleDownload}
              className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white"
              title="Download video"
            >
              <Download className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white"
              title="Share video"
            >
              <Share className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
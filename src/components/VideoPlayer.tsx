import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward } from 'lucide-react';
import { VideoFile } from '../types';
import { formatDuration } from '../utils/videoUtils';
import { useLibrary } from '../contexts/LibraryContext';

interface VideoPlayerProps {
  videoId: string;
  videoUrl: string;
  metadata: VideoFile;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, videoUrl, metadata }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const { updateWatchProgress } = useLibrary();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  
  // Control visibility timer
  const controlsTimer = useRef<number | null>(null);

  // Initialize player
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set initial volume
    video.volume = volume;

    // Enable hardware acceleration
    video.style.transform = 'translateZ(0)';

    // Set playback settings
    video.playsInline = true;
    video.disableRemotePlayback = true;

    // Set initial position if there's a saved progress
    if (metadata.watchProgress && metadata.duration) {
      const targetTime = metadata.watchProgress * metadata.duration;
      if (targetTime < metadata.duration - 10) { // Don't resume if almost at the end
        video.currentTime = targetTime;
        setCurrentTime(targetTime);
      }
    }

    // Handle keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          if (video.paused) {
            video.play();
            setIsPlaying(true);
          } else {
            video.pause();
            setIsPlaying(false);
          }
          e.preventDefault();
          break;
        case 'f':
          if (!document.fullscreenElement) {
            playerRef.current?.requestFullscreen().catch(err => {
              console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
          } else {
            document.exitFullscreen();
          }
          e.preventDefault();
          break;
        case 'm':
          video.muted = !video.muted;
          setIsMuted(video.muted);
          e.preventDefault();
          break;
        case 'arrowright':
          video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + 10));
          setCurrentTime(video.currentTime);
          e.preventDefault();
          break;
        case 'arrowleft':
          video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime - 10));
          setCurrentTime(video.currentTime);
          e.preventDefault();
          break;
        case 'arrowup': {
          const newVolume = Math.max(0, Math.min(1, video.volume + 0.1));
          video.volume = newVolume;
          setVolume(newVolume);
          if (newVolume > 0 && video.muted) {
            video.muted = false;
            setIsMuted(false);
          }
          e.preventDefault();
          break;
        }
        case 'arrowdown': {
          const newVolume = Math.max(0, Math.min(1, video.volume - 0.1));
          video.volume = newVolume;
          setVolume(newVolume);
          if (newVolume === 0 && !video.muted) {
            video.muted = true;
            setIsMuted(true);
          }
          e.preventDefault();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, [metadata, volume]);
  
  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      // Save progress every 5 seconds
      if (Math.floor(video.currentTime) % 5 === 0 && video.duration) {
        updateWatchProgress(videoId, video.currentTime / video.duration);
      }
    };
    
    const onDurationChange = () => {
      setDuration(video.duration);
    };
    
    const onEnded = () => {
      setIsPlaying(false);
      // Save completion status
      updateWatchProgress(videoId, 1);
    };
    
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    
    // Add event listeners
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('ended', onEnded);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    
    return () => {
      // Remove event listeners
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
    };
  }, [videoId, updateWatchProgress]);
  
  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Handle controls visibility
  const showControls = () => {
    setIsControlsVisible(true);

    if (controlsTimer.current) {
      clearTimeout(controlsTimer.current);
    }

    if (isPlaying) {
      controlsTimer.current = window.setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
    }
  };
  
  // Player controls
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    
    setIsPlaying(!isPlaying);
    showControls();
  };
  
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !isMuted;
    setIsMuted(!isMuted);
    showControls();
  };
  
  const changeVolume = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = Math.max(0, Math.min(1, volume + delta));
    video.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume > 0 && isMuted) {
      video.muted = false;
      setIsMuted(false);
    } else if (newVolume === 0 && !isMuted) {
      video.muted = true;
      setIsMuted(true);
    }
    
    showControls();
  };
  
  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
    setCurrentTime(video.currentTime);
    showControls();
  };
  
  const seek = (e: React.MouseEvent) => {
    const video = videoRef.current;
    const progress = progressRef.current;
    
    if (!video || !progress) return;
    
    const rect = progress.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
    setCurrentTime(video.currentTime);
    showControls();
  };
  
  const toggleFullscreen = () => {
    const player = playerRef.current;
    if (!player) return;
    
    if (!document.fullscreenElement) {
      player.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
    
    showControls();
  };
  
  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  return (
    <div 
      ref={playerRef}
      className={`relative group ${isFullscreen ? 'bg-black' : ''}`}
      onMouseMove={showControls}
      onClick={togglePlay}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full bg-black"
        style={{
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden'
        }}
        autoPlay={false}
        preload="metadata"
        playsInline
        disableRemotePlayback
      />
      
      {/* Buffering indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-16 h-16 border-4 border-t-purple-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Play/pause large button - shown when paused */}
      {!isPlaying && (
        <button
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-purple-600/80 flex items-center justify-center z-10"
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
        >
          <Play className="w-10 h-10 text-white" fill="white" />
        </button>
      )}
      
      {/* Controls overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 transition-opacity duration-300 ${
          isControlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 p-4">
          <h3 className="text-white text-lg font-medium truncate">{metadata.name}</h3>
        </div>
        
        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress bar */}
          <div 
            ref={progressRef}
            className="w-full h-2 bg-gray-700/70 rounded-full cursor-pointer mb-4 relative overflow-hidden"
            onClick={seek}
          >
            <div 
              className="absolute top-0 left-0 h-full bg-purple-500 rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                className="text-white p-2 hover:text-purple-400 transition-colors"
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              
              <button 
                className="text-white p-2 hover:text-purple-400 transition-colors hidden sm:block"
                onClick={(e) => { e.stopPropagation(); skip(-10); }}
              >
                <SkipBack className="w-6 h-6" />
              </button>
              
              <button 
                className="text-white p-2 hover:text-purple-400 transition-colors hidden sm:block"
                onClick={(e) => { e.stopPropagation(); skip(10); }}
              >
                <SkipForward className="w-6 h-6" />
              </button>
              
              <div className="flex items-center space-x-2">
                <button 
                  className="text-white p-2 hover:text-purple-400 transition-colors"
                  onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                >
                  {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
                
                <div className="w-20 h-2 bg-gray-700/70 rounded-full cursor-pointer hidden sm:block">
                  <div 
                    className="h-full bg-white rounded-full"
                    style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                      if (rect) {
                        const pos = (e.clientX - rect.left) / rect.width;
                        changeVolume(pos - volume);
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="text-white text-sm hidden sm:block">
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </div>
            </div>
            
            <button 
              className="text-white p-2 hover:text-purple-400 transition-colors"
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
            >
              {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
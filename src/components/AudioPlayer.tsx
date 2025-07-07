import { useState, useEffect, useRef } from 'react';
import { PrimaryButton } from './atoms/PrimaryButton';
import { GhostButton } from './atoms/GhostButton';

interface AudioSegment {
  text: string;
  audioUrl: string;
  characterId?: string;
  startIndex: number;
  endIndex: number;
}

interface AudioPlayerProps {
  segments: AudioSegment[];
  characterVoices?: Array<{ _id: string; name: string; openaiVoiceId: string; instructions?: string }>;
  onSegmentChange?: (segmentIndex: number) => void;
  className?: string;
}

export function AudioPlayer({ segments, characterVoices, onSegmentChange, className = '' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      playNextSegment();
    };

    const handleError = () => {
      setError('Failed to load audio segment');
      setIsLoading(false);
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      setError(null);
      setIsLoading(false);
      // If we were playing when this segment loaded, continue playing
      if (isPlaying && audioRef.current) {
        audioRef.current.play().catch(error => {
          console.error('Failed to auto-play next segment:', error);
          setError('Failed to play audio segment');
          setIsPlaying(false);
        });
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.pause();
    };
  }, []);

  // Load current segment
  useEffect(() => {
    if (segments.length > 0 && audioRef.current) {
      const currentSegment = segments[currentSegmentIndex];
      if (currentSegment) {
        setIsLoading(true);
        setError(null);
        audioRef.current.src = currentSegment.audioUrl;
        audioRef.current.load();
        
        // Notify parent component of segment change
        onSegmentChange?.(currentSegmentIndex);
      }
    }
  }, [currentSegmentIndex, segments, onSegmentChange]);

  const playNextSegment = () => {
    if (currentSegmentIndex < segments.length - 1) {
      setIsPlaying(true);
      setCurrentSegmentIndex(prev => prev + 1);
      
    } else {
      // End of all segments
      setIsPlaying(false);
      setCurrentSegmentIndex(0);
      setProgress(0);
      setCurrentTime(0);
    }
  };

  const playPreviousSegment = () => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex(prev => prev - 1);
    }
  };

  const handlePlay = async () => {
    if (!audioRef.current || segments.length === 0) return;

    try {
      setError(null);
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to play audio:', error);
      setError('Failed to play audio. Please try again.');
      setIsPlaying(false);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentSegmentIndex(0);
      setProgress(0);
      setCurrentTime(0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCurrentCharacter = () => {
    const currentSegment = segments[currentSegmentIndex];
    if (!currentSegment || !characterVoices) return null;
    
    return characterVoices.find(cv => cv._id === currentSegment.characterId);
  };

  if (segments.length === 0) {
    return (
      <div className={`neo bg-gray-100 p-6 text-center ${className}`}>
        <p className="text-gray-600 font-medium">No audio segments available</p>
        <p className="text-sm text-gray-500 mt-2">Generate audio first to enable playback</p>
      </div>
    );
  }

  const currentSegment = segments[currentSegmentIndex];
  const currentCharacter = getCurrentCharacter();

  return (
    <div className={`neo bg-white p-6 ${className}`}>
      {/* Current Segment Info */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-black">
            Segment {currentSegmentIndex + 1} of {segments.length}
          </h4>
          {currentCharacter && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 neo bg-primary text-white flex items-center justify-center text-xs font-bold">
                {currentCharacter.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-black">{currentCharacter.name}</span>
            </div>
          )}
        </div>
        
        {currentSegment && (
          <div className="neo bg-gray-50 p-3">
            <p className="text-sm text-gray-700 italic">
              "{currentSegment.text}"
            </p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="neo bg-red-100 p-3 mb-4">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div 
          className="w-full h-2 bg-gray-200 cursor-pointer neo"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-primary transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <GhostButton
          onClick={playPreviousSegment}
          disabled={currentSegmentIndex === 0}
          className="text-sm px-3 py-2"
        >
          ⏮ Previous
        </GhostButton>

        {isLoading ? (
          <div className="neo bg-gray-100 px-6 py-3 text-black font-bold">
            Loading...
          </div>
        ) : isPlaying ? (
          <PrimaryButton onClick={handlePause} className="px-6 py-3">
            ⏸ Pause
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={handlePlay} className="px-6 py-3">
            ▶ Play
          </PrimaryButton>
        )}

        <GhostButton
          onClick={playNextSegment}
          disabled={currentSegmentIndex === segments.length - 1}
          className="text-sm px-3 py-2"
        >
          Next ⏭
        </GhostButton>

        <GhostButton
          onClick={handleStop}
          className="text-sm px-3 py-2"
        >
          ⏹ Stop
        </GhostButton>
      </div>

      {/* Segment Navigation */}
      <div className="border-t-2 border-black pt-4">
        <h5 className="font-bold text-black mb-2">All Segments:</h5>
        <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
          {segments.map((segment, index) => {
            const character = characterVoices?.find(cv => cv._id === segment.characterId);
            return (
              <button
                key={index}
                onClick={() => setCurrentSegmentIndex(index)}
                className={`text-left p-2 rounded transition-colors ${
                  index === currentSegmentIndex
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">{index + 1}.</span>
                  {character && (
                    <span className="text-xs bg-white bg-opacity-20 px-1 rounded">
                      {character.name}
                    </span>
                  )}
                  <span className="text-xs truncate flex-1">
                    "{segment.text.slice(0, 50)}..."
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
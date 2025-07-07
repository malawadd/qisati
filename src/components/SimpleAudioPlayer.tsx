import { useState, useEffect, useRef } from 'react';

interface AudioSegment {
  text: string;
  audioUrl: string;
  characterId?: string;
  startIndex: number;
  endIndex: number;
}

interface SimpleAudioPlayerProps {
  segments: AudioSegment[];
  characterVoices?: Array<{ _id: string; name: string; openaiVoiceId: string;  }>;
  chapterTitle: string;
}

export function SimpleAudioPlayer({ segments, characterVoices, chapterTitle }: SimpleAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      }
    }
  }, [currentSegmentIndex, segments]);

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
      setError('Failed to play audio');
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
    return null;
  }

  const currentCharacter = getCurrentCharacter();

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
      isMinimized ? 'transform translate-y-16' : 'transform translate-y-0'
    }`}>
      {/* Minimized View */}
      {isMinimized && (
        <div className="bg-black text-white p-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={isPlaying ? handlePause : handlePlay}
              className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold hover:bg-primary-hover transition-colors"
            >
              {isLoading ? '⏳' : isPlaying ? '⏸' : '▶'}
            </button>
            <div className="text-sm">
              <div className="font-bold">{chapterTitle}</div>
              <div className="text-gray-300">
                {currentCharacter ? currentCharacter.name : 'Narrator'} • {currentSegmentIndex + 1}/{segments.length}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            className="text-white hover:text-gray-300 transition-colors"
          >
            ⬆
          </button>
        </div>
      )}

      {/* Full Player */}
      <div className="neo bg-white border-t-4 border-black p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-lg">🎧</span>
            <div>
              <div className="font-bold text-black text-sm">{chapterTitle}</div>
              <div className="text-xs text-gray-600">
                Audio Story • {currentSegmentIndex + 1} of {segments.length}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="text-gray-600 hover:text-black transition-colors text-sm"
              title="Minimize"
            >
              ⬇
            </button>
            <button
              onClick={handleStop}
              className="text-gray-600 hover:text-black transition-colors text-sm"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Current Character */}
        {currentCharacter && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 neo bg-primary text-white flex items-center justify-center text-xs font-bold">
              {currentCharacter.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-black">{currentCharacter.name}</span>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 text-red-700 text-xs p-2 rounded mb-3">
            {error}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-3">
          <div 
            className="w-full h-2 bg-gray-200 cursor-pointer rounded"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-primary transition-all duration-100 rounded"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={playPreviousSegment}
            disabled={currentSegmentIndex === 0}
            className="w-8 h-8 neo bg-gray-100 text-black flex items-center justify-center font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⏮
          </button>

          {isLoading ? (
            <div className="w-12 h-12 neo bg-gray-100 text-black flex items-center justify-center font-bold">
              ⏳
            </div>
          ) : isPlaying ? (
            <button
              onClick={handlePause}
              className="w-12 h-12 neo bg-primary text-white flex items-center justify-center font-bold hover:bg-primary-hover transition-colors"
            >
              ⏸
            </button>
          ) : (
            <button
              onClick={handlePlay}
              className="w-12 h-12 neo bg-primary text-white flex items-center justify-center font-bold hover:bg-primary-hover transition-colors"
            >
              ▶
            </button>
          )}

          <button
            onClick={playNextSegment}
            disabled={currentSegmentIndex === segments.length - 1}
            className="w-8 h-8 neo bg-gray-100 text-black flex items-center justify-center font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⏭
          </button>
        </div>
      </div>
    </div>
  );
}
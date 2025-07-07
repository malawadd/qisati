import { useState, useEffect, useRef, useCallback } from 'react';

interface AudioSegment {
  text: string;
  audioUrl: string;
  characterId?: string;
  startIndex: number;
  endIndex: number;
}
interface SimpleAudioPlayerProps {
  segments: AudioSegment[];
  characterVoices?: Array<{ _id: string; name: string; openaiVoiceId: string }>;
  chapterTitle: string;
}

export function SimpleAudioPlayer({
  segments,
  characterVoices,
  chapterTitle,
}: SimpleAudioPlayerProps) {
  /* ──────────── UI state ──────────── */
  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(0);           // index of clip
  const [progress, setProgress] = useState(0);         // %
  const [duration, setDuration] = useState(0);         // seconds
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  /* ──────────── Audio element ──────────── */
  const audioRef = useRef<HTMLAudioElement>(new Audio()).current;

  const abortRef = useRef<AbortController | null>(null);

  /* ---------- helpers ---------- */
  const loadClip = useCallback(
    async (idx: number) => {
      abortRef.current?.abort();           // cancel any previous load/play
      abortRef.current = new AbortController();

      const clip = segments[idx];
      if (!clip) return;

      try {
        audioRef.src = clip.audioUrl;
        await audioRef.play();             // throws if user-gesture missing or load fails
        setIsPlaying(true);
      } catch (e) {
        if (!(abortRef.current?.signal.aborted)) {
          console.error(e);
          setError('Could not play audio');
          setIsPlaying(false);
        }
      }
    },
    [audioRef, segments],
  );

  /* ---------- mount: one-time listeners ---------- */
  useEffect(() => {
    const a = audioRef;

    const onTime = () => {
      if (a.duration) {
        setProgress((a.currentTime / a.duration) * 100);
      }
    };

    const onLoaded = () => setDuration(a.duration || 0);

    const onEnded = () => {
      if (current < segments.length - 1) {
        setCurrent(i => i + 1);            // triggers next load in next effect
      } else {
        setIsPlaying(false);               // playlist finished
      }
    };

    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onLoaded);
    a.addEventListener('ended', onEnded);
    a.addEventListener('error', () => {
      setError('Audio error');
      setIsPlaying(false);
    });

    return () => {
      a.pause();
      a.src = '';
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onLoaded);
      a.removeEventListener('ended', onEnded);
    };
  }, [audioRef, current, segments.length]);

  /* ---------- (re)load clip when index changes ---------- */
  useEffect(() => {
    if (segments.length) void loadClip(current);
  }, [current, segments.length, loadClip]);

  /* ---------- controls ---------- */
  const play = () => isPlaying || loadClip(current);
  const pause = () => {
    audioRef.pause();
    setIsPlaying(false);
  };
  const stop = () => {
    abortRef.current?.abort();
    audioRef.pause();
    audioRef.currentTime = 0;
    setIsPlaying(false);
    setProgress(0);
    setCurrent(0);
  };

  const seek = (pct: number) => {
    if (audioRef.duration) {
      audioRef.currentTime = pct * audioRef.duration;
      setProgress(pct * 100);
    }
  };

  /* ---------- derived ---------- */
  const curChar = characterVoices?.find(v => v._id === segments[current]?.characterId);

  /* ---------- render ---------- */
  if (!segments.length) return null;
  return (
    <>
      {/* ───────── Minimized FAB ───────── */}
      {isMinimized && (
      <div
        /* whole circle opens the panel */
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                   flex items-center justify-center
                   w-16 h-16 rounded-full bg-primary shadow-xl
                   cursor-pointer"
      >
        {/* inner span toggles play/pause without expanding */}
        <span
          onClick={e => {
            e.stopPropagation();           // don’t bubble -> keeps panel closed
            void (isPlaying ? pause() : play());
          }}
          className="flex items-center justify-center
                     w-12 h-12 rounded-full bg-white text-primary text-xl"
        >
          {isPlaying ? '⏸' : '▶'}
        </span>
      </div>
    )}
  
      {/* ───────── Full Player Panel ───────── */}
      {!isMinimized && (
        <div
          className="fixed bottom-0 inset-x-0 z-40 neo bg-white border-t-4 border-black p-4"
        >
          {/* header */}
          <div className="flex justify-between mb-3">
            <div>
              <div className="font-bold">{chapterTitle}</div>
              <div className="text-xs text-gray-600">
                {current + 1}/{segments.length}
              </div>
            </div>
  
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMinimized(true)} title="Minimize">
                ⬇
              </button>
              <button onClick={stop} title="Close">✕</button>
            </div>
          </div>
  
          <div className="mb-3">
<div
  className="h-2 bg-gray-200 rounded cursor-pointer"
  onClick={e => {
    const pct = e.nativeEvent.offsetX / (e.target as HTMLDivElement).offsetWidth;
    seek(pct);
  }}
>
  <div className="h-full bg-primary rounded" style={{ width: `${progress}%` }} />
</div>
<div className="flex justify-between text-xs text-gray-600 mt-1">
  <span>{format(duration * (progress / 100))}</span>
  <span>{format(duration)}</span>
</div>
</div>

{/* controls */}
<div className="flex gap-3 justify-center">
<button
  onClick={() => setCurrent(i => Math.max(0, i - 1))}
  disabled={current === 0}
  className="w-8 h-8 neo bg-gray-100 disabled:opacity-50"
>
  ⏮
</button>
<button
  onClick={isPlaying ? pause : play}
  className="w-12 h-12 neo bg-primary text-white"
>
  {isPlaying ? '⏸' : '▶'}
</button>
<button
  onClick={() => setCurrent(i => Math.min(segments.length - 1, i + 1))}
  disabled={current === segments.length - 1}
  className="w-8 h-8 neo bg-gray-100 disabled:opacity-50"
>
  ⏭
</button>
</div>
     
         
        </div>
      )}
    </>
  );
}

/* util */
const format = (s: number) =>
  `${Math.floor(s / 60)}:${Math.floor(s % 60)
    .toString()
    .padStart(2, '0')}`;


{/* progress */}

import { useState, useEffect, useRef, useCallback } from 'react';
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
  characterVoices?: Array<{
    _id: string;
    name: string;
    openaiVoiceId: string;
    instructions?: string;
  }>;
  onSegmentChange?: (idx: number) => void;
  className?: string;
}

export function AudioPlayer({
  segments,
  characterVoices,
  onSegmentChange,
  className = '',
}: AudioPlayerProps) {
  /* ──────────── state ──────────── */
  const [isPlaying, setIsPlaying] = useState(false);
  const [idx, setIdx] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /* ──────────── refs ──────────── */
  const audio = useRef<HTMLAudioElement>(new Audio()).current;
  const abort = useRef<AbortController | null>(null);

  /* ──────────── helpers ──────────── */
  const loadClip = useCallback(
    async (i: number) => {
      abort.current?.abort();            // cancel any previous play()
      abort.current = new AbortController();

      const clip = segments[i];
      if (!clip) return;

      try {
        audio.src = clip.audioUrl;
        await audio.play();              // throws if user gesture missing
        setIsPlaying(true);
      } catch (e) {
        if (!abort.current.signal.aborted) {
          console.error(e);
          setError('Could not play audio');
          setIsPlaying(false);
        }
      }
    },
    [audio, segments],
  );

  /* ──────────── mount listeners once ──────────── */
  useEffect(() => {
    const onTime = () =>
      setProgressPct(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (idx < segments.length - 1) setIdx(i => i + 1);
      else setIsPlaying(false);
    };
    const onError = () => {
      setError('Audio error');
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.src = '';
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [audio, idx, segments.length]);

  /* ──────────── (re)load when index changes ──────────── */
  useEffect(() => {
    if (segments.length) loadClip(idx);
    onSegmentChange?.(idx);
  }, [idx, segments.length, loadClip, onSegmentChange]);

  /* ──────────── controls ──────────── */
  const play = () => isPlaying || loadClip(idx);
  const pause = () => {
    audio.pause();
    setIsPlaying(false);
  };
  const stop = () => {
    abort.current?.abort();
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setProgressPct(0);
    setIdx(0);
  };

  const seek = (clientX: number, rectWidth: number) => {
    if (audio.duration) {
      const pct = clientX / rectWidth;
      audio.currentTime = pct * audio.duration;
      setProgressPct(pct * 100);
    }
  };

  /* ──────────── derived ──────────── */
  const seg = segments[idx];
  const char = characterVoices?.find(c => c._id === seg?.characterId);
  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${Math.floor(s % 60)
      .toString()
      .padStart(2, '0')}`;

  /* ──────────── render ──────────── */
  if (!segments.length) {
    return (
      <div className={`neo bg-gray-100 p-6 text-center ${className}`}>
        <p className="text-gray-600 font-medium">No audio segments available</p>
        <p className="text-sm text-gray-500 mt-2">Generate audio first to enable playback</p>
      </div>
    );
  }

  return (
    <div className={`neo bg-white p-6 ${className}`}>
      {/* header */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <h4 className="font-bold">
            Segment {idx + 1} / {segments.length}
          </h4>
          {char && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary text-white flex items-center justify-center rounded-full text-xs">
                {char.name[0].toUpperCase()}
              </div>
              <span className="text-sm font-medium">{char.name}</span>
            </div>
          )}
        </div>
        <div className="neo bg-gray-50 p-3 italic text-sm">“{seg.text}”</div>
      </div>

      {error && (
        <div className="neo bg-red-100 p-3 mb-4 text-red-700 text-sm font-medium">{error}</div>
      )}

      {/* progress */}
      <div className="mb-4">
        <div
          className="h-2 bg-gray-200 neo cursor-pointer"
          onClick={e => seek(e.nativeEvent.offsetX, (e.target as HTMLDivElement).offsetWidth)}
        >
          <div className="h-full bg-primary" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>{fmt(duration * (progressPct / 100))}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {/* controls */}
      <div className="flex justify-center gap-3 mb-4">
        <GhostButton onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}>
          ⏮ Previous
        </GhostButton>

        {isPlaying ? (
          <PrimaryButton onClick={pause}>⏸ Pause</PrimaryButton>
        ) : (
          <PrimaryButton onClick={play}>▶ Play</PrimaryButton>
        )}

        <GhostButton
          onClick={() => setIdx(i => Math.min(segments.length - 1, i + 1))}
          disabled={idx === segments.length - 1}
        >
          Next ⏭
        </GhostButton>

        <GhostButton onClick={stop}>⏹ Stop</GhostButton>
      </div>

      {/* list */}
      <div className="border-t-2 border-black pt-4">
        <h5 className="font-bold mb-2">All Segments</h5>
        <div className="grid gap-2 max-h-32 overflow-y-auto">
          {segments.map((s, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`text-left p-2 rounded ${
                i === idx ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold text-xs mr-1">{i + 1}.</span>
              {characterVoices && (
                <span className="text-xs mr-1">{characterVoices.find(c => c._id === s.characterId)?.name}</span>
              )}
              <span className="text-xs truncate">“{s.text.slice(0, 50)}…”</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

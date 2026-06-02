'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioPreviewProps {
  file: File;
  disabled?: boolean;
}

function formatTime(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

// Deterministic bar heights from filename — purely decorative waveform
function getWaveBars(name: string, count = 28): number[] {
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    const seed = (name.charCodeAt(i % name.length) * (i + 1) * 7) % 100;
    bars.push(20 + (seed % 65));
  }
  return bars;
}

export function AudioPreview({ file, disabled }: AudioPreviewProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const waveBars = getWaveBars(file.name);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const activeBar = Math.floor((progress / 100) * waveBars.length);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const togglePlay = () => {
    if (!audioRef.current || disabled) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!audioRef.current || !progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = ratio * duration;
    setCurrentTime(ratio * duration);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    seekTo(e);
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => seekTo(e);
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, duration]);

  if (!url) return null;

  return (
    <div className={`rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-700/50 p-4 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
        className="hidden"
      />

      {/* File info */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-gray-800 dark:text-slate-200 truncate">{file.name}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500">
            {formatSize(file.size)}{duration > 0 ? ` · ${formatTime(duration)}` : ''}
          </p>
        </div>
      </div>

      {/* Waveform + play controls */}
      <div className="flex items-center gap-3">
        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 flex items-center justify-center flex-shrink-0 shadow-sm"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Waveform progress */}
        <div className="flex-1 flex flex-col gap-1.5">
          {/* Decorative waveform bars */}
          <div
            ref={progressRef}
            className="flex items-center gap-px h-8 cursor-pointer select-none"
            onMouseDown={handleMouseDown}
          >
            {waveBars.map((height, i) => {
              const isPast = i < activeBar;
              const isCurrent = i === activeBar;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-colors ${
                    isPast
                      ? 'bg-blue-500 dark:bg-blue-400'
                      : isCurrent
                      ? 'bg-blue-400 dark:bg-blue-300'
                      : 'bg-gray-300 dark:bg-zinc-600'
                  } ${isPlaying && isCurrent ? 'animate-pulse' : ''}`}
                  style={{
                    height: `${height}%`,
                    transition: 'background-color 80ms ease',
                  }}
                />
              );
            })}
          </div>

          {/* Time display */}
          <div className="flex justify-between text-xs text-gray-400 dark:text-slate-500 tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

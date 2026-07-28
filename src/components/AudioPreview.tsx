'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface AudioPreviewProps {
  file: File;
  disabled?: boolean;
}

// แปลงวินาที (number) เป็นข้อความรูปแบบ "นาที:วินาที" เช่น 75 → "1:15"
function formatTime(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// แปลงขนาดไฟล์ (bytes) เป็นข้อความอ่านง่าย — ต่ำกว่า 1MB โชว์เป็น KB ไม่งั้นโชว์เป็น MB
function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

// Deterministic bar heights from filename — purely decorative waveform
// รับ name (ชื่อไฟล์ ใช้เป็น seed) และ count (จำนวนแท่ง) คืนค่าอาเรย์ความสูง % ของแต่ละแท่ง
// ไม่ได้อ่านคลื่นเสียงจริง — สุ่มเทียม (deterministic) จาก char code ของชื่อไฟล์ ให้ค่าเดิมทุกครั้งที่ไฟล์เดียวกัน
function getWaveBars(name: string, count = 28): number[] {
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    // วนอ่าน char code ของชื่อไฟล์ทีละตัว (mod ความยาวชื่อ กันวิ่งเกินขอบเขต) คูณตำแหน่งแท่ง+7 แล้ว mod 100 เป็น "เมล็ดสุ่ม"
    const seed = (name.charCodeAt(i % name.length) * (i + 1) * 7) % 100;
    bars.push(20 + (seed % 65)); // ความสูงอยู่ในช่วง 20-84% กันแท่งเตี้ยจนมองไม่เห็น
  }
  return bars;
}

// เครื่องเล่นเสียงขนาดเล็ก พร้อม waveform ตกแต่ง (ไม่ใช่คลื่นเสียงจริง) + ปุ่มเล่น/หยุด + seek แถบคลิกได้
export function AudioPreview({ file, disabled }: AudioPreviewProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  // ค่าล่าสุดที่ render ไปแล้ว — ใช้กรอง timeupdate ให้ setState เฉพาะเมื่อวินาที/แท่ง active เปลี่ยน
  const lastTickRef = useRef({ sec: -1, bar: -1 });

  const waveBars = useMemo(() => getWaveBars(file.name), [file.name]);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const activeBar = Math.floor((progress / 100) * waveBars.length);

  // เรียกถี่มากตอนเล่นเสียง (event timeupdate ของ <audio>) — เช็คก่อนว่าเลขวินาที/แท่ง active
  // เปลี่ยนจริงไหมค่อย setState กันหน้า re-render บ่อยเกินจำเป็น (คล้าย throttle)
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = audio.currentTime;
    const sec = Math.floor(time);
    const dur = audio.duration;
    const bar = dur > 0 ? Math.floor((time / dur) * waveBars.length) : 0;
    if (sec !== lastTickRef.current.sec || bar !== lastTickRef.current.bar) {
      lastTickRef.current = { sec, bar };
      setCurrentTime(time);
    }
  };

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

  // คำนวณตำแหน่งที่คลิก/ลากบนแถบ waveform แล้วแปลงเป็นเวลาที่ต้อง seek ไป
  // ratio = สัดส่วนระยะจากขอบซ้ายแถบ (0-1) clamp ไว้ไม่ให้หลุดขอบซ้าย/ขวา
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
    <div className={`ui-panel-muted p-4 ${disabled ? 'pointer-events-none opacity-60' : ''}`}>
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
        className="hidden"
      />

      {/* File info */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[3px] border border-[var(--line)] bg-[var(--paper)]">
          <svg className="h-3.5 w-3.5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-[var(--ink)]">{file.name}</p>
          <p className="text-xs text-[var(--muted)]">
            {formatSize(file.size)}{duration > 0 ? ` · ${formatTime(duration)}` : ''}
          </p>
        </div>
      </div>

      {/* Waveform + play controls */}
      <div className="flex items-center gap-3">
        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[4px] bg-[var(--ink)] hover:bg-[var(--accent)]"
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
                      ? 'bg-[var(--accent)]'
                      : isCurrent
                      ? 'bg-[var(--accent)]'
                      : 'bg-[var(--line-strong)]'
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
          <div className="flex justify-between text-xs tabular-nums text-[var(--muted)]">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useCallback, useRef, useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  onRemove?: () => void;
  disabled?: boolean;
  selectedFile?: File | null;
}

const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.m4a'];

export function UploadZone({ onFileSelect, onRemove, disabled, selectedFile }: UploadZoneProps) {
  const { t } = useLang();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (file: File): boolean => {
    const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError(t.invalidFileType);
      return false;
    }
    setError(null);
    return true;
  };

  const handleFile = useCallback(
    (file: File) => {
      if (validate(file)) onFileSelect(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onFileSelect, t],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div className="w-full">
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={[
          'relative border-2 border-dashed rounded-xl text-center',
          // เลือกไฟล์แล้ว → strip กะทัดรัด (ชื่อ/ขนาดไฟล์แสดงใน AudioPreview ข้างใต้อยู่แล้ว)
          selectedFile ? 'p-4' : 'p-8 sm:p-12',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-zinc-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-zinc-700/50',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".mp3,.wav,.m4a"
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled}
        />

        {selectedFile ? (
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isDragging
                  ? 'bg-blue-200 dark:bg-blue-700/50'
                  : 'bg-blue-100 dark:bg-blue-900/40'
              }`}
            >
              <svg
                className="w-4 h-4 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <span className="text-xs text-gray-500 dark:text-slate-400">{t.changeFile}</span>
            {onRemove && !disabled && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onRemove(); }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                style={{ transition: 'color 150ms ease, background-color 150ms ease' }}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {t.removeFile}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                isDragging
                  ? 'bg-blue-200 dark:bg-blue-700/50'
                  : 'bg-blue-100 dark:bg-blue-900/40'
              }`}
            >
              <svg
                className="w-7 h-7 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
                {t.dropHere}{' '}
                <span className="text-blue-600 dark:text-blue-400">{t.clickToBrowse}</span>
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500">{t.supports}</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

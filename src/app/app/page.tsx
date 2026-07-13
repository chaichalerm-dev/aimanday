'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { UploadZone } from '@/components/UploadZone';
import { AudioPreview } from '@/components/AudioPreview';
import { useLang } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import type { EstimationResult } from '@/lib/analyzer';

// Lazy-load — ResultCard (รวม ExportMenu/portal) ไม่จำเป็นตอน idle; chunk ถูก warm ล่วงหน้าใน handleAnalyze
const ResultCard = dynamic(
  () => import('@/components/ResultCard').then(m => ({ default: m.ResultCard })),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-48 rounded-2xl bg-gray-100 dark:bg-zinc-800 animate-pulse"
        style={{ transition: 'none' }}
      />
    ),
  }
);

type Step = 'idle' | 'transcribing' | 'transcribed' | 'analyzing' | 'done';

// ตำแหน่ง step ปัจจุบันบน indicator 3 ขั้น (done = 3 → ครบทุกขั้น)
const STEP_ORDER: Record<Step, number> = {
  idle: 0,
  transcribing: 0,
  transcribed: 1,
  analyzing: 1,
  done: 3,
};

// Deterministic waveform data — 32 bars with varied heights, speeds and offsets
const WAVE_HEIGHTS  = [28,45,62,48,80,58,35,72,50,88,42,65,82,47,70,56,32,85,60,76,44,55,90,46,68,78,52,38,60,44,30,50];
const WAVE_DURATIONS= [1.4,1.7,1.2,1.9,1.1,1.6,1.8,1.3,1.5,1.2,1.7,1.4,1.1,1.8,1.5,1.3,1.6,1.2,1.9,1.4,1.1,1.7,1.5,1.3,1.8,1.2,1.6,1.4,1.9,1.1,1.5,1.7];
const WAVE_DELAYS   = [0,.3,.12,.5,.18,.4,.25,.07,.45,.22,.35,.1,.42,.28,.15,.5,.08,.38,.2,.12,.47,.33,.05,.43,.17,.27,.48,.1,.35,.22,.4,.15];

// Client-safe JSON parser (no server imports)
function parseEstimation(text: string): EstimationResult | null {
  try {
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    const parsed = JSON.parse(cleaned);
    if (
      Array.isArray(parsed.sow) &&
      typeof parsed.manday_estimate?.min === 'number' &&
      typeof parsed.manday_estimate?.max === 'number' &&
      Array.isArray(parsed.modules) &&
      Array.isArray(parsed.assumptions)
    ) {
      return parsed as EstimationResult;
    }
    return null;
  } catch {
    return null;
  }
}

type InputMode = 'audio' | 'text';

export default function Home() {
  const { t } = useLang();
  const { showToast } = useToast();
  const { status: authStatus } = useSession();
  const [inputMode, setInputMode] = useState<InputMode>('audio');
  const [manualEntry, setManualEntry] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [prefillAudioName, setPrefillAudioName] = useState('');
  const [editedTranscript, setEditedTranscript] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [result, setResult] = useState<EstimationResult | null>(null);
  const [step, setStep] = useState<Step>('idle');
  const [error, setError] = useState<string | null>(null);

  const transcriptCardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLPreElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Prefill transcript from history re-analyze
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('reanalyze_prefill');
      if (!raw) return;
      sessionStorage.removeItem('reanalyze_prefill');
      const { transcript, audioName } = JSON.parse(raw) as { transcript: string; audioName: string };
      setEditedTranscript(transcript);
      setPrefillAudioName(audioName);
      setStep('transcribed');
      showToast(t.reAnalyzeToast, 'info');
    } catch {
      // ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isProcessing = step === 'transcribing' || step === 'analyzing';

  // เลื่อนจอไปยังขั้นถัดไปเมื่อ step เปลี่ยน — card ใหม่โผล่นอกจอด้านล่างโดยเฉพาะบน mobile
  useEffect(() => {
    if (step !== 'transcribed' && step !== 'done') return;
    const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';
    if (step === 'transcribed') {
      transcriptCardRef.current?.scrollIntoView({ behavior, block: 'start' });
      // focus เฉพาะอุปกรณ์มีเมาส์ — บน touch จะดัน virtual keyboard เด้งกลางทาง
      if (window.matchMedia('(pointer: fine)').matches) {
        textareaRef.current?.focus({ preventScroll: true });
      }
    } else {
      resultRef.current?.scrollIntoView({ behavior, block: 'start' });
    }
  }, [step]);

  // ให้ terminal เลื่อนตามท้ายข้อความระหว่าง stream
  useEffect(() => {
    const el = terminalRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [streamingText]);

  // Step 1: Upload audio → STT (รับไฟล์เป็น parameter — เรียกจาก event handler ทันทีที่เลือกไฟล์
  // ห้ามย้ายไป useEffect on file: StrictMode จะยิง /api/upload ซ้ำและเปลือง rate limit)
  const transcribeFile = async (selected: File) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setError(null);
    try {
      setStep('transcribing');
      const formData = new FormData();
      formData.append('audio', selected);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Transcription failed');
      const { transcript } = await res.json();
      setEditedTranscript(transcript);
      setStep('transcribed');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Transcription failed');
      setStep('idle');
    }
  };

  const handleFileSelect = (selected: File) => {
    setFile(selected);
    setPrefillAudioName('');
    setManualEntry(false);
    setEditedTranscript('');
    setStreamingText('');
    setResult(null);
    setError(null);
    void transcribeFile(selected);
  };

  // Text mode: user types the requirement directly, skipping STT entirely
  const handleTextModeContinue = () => {
    if (!editedTranscript.trim()) return;
    setManualEntry(true);
    setPrefillAudioName('');
    setStreamingText('');
    setResult(null);
    setError(null);
    setStep('transcribed');
  };

  // Step 2: Stream transcript → LLM
  const handleAnalyze = async () => {
    if (!editedTranscript.trim()) return;
    // warm chunk ของ ResultCard ระหว่างรอ LLM stream — ตอน done จะไม่มี loading flash
    void import('@/components/ResultCard');
    setError(null);
    setResult(null);
    setStreamingText('');

    try {
      setStep('analyzing');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: editedTranscript, audioName: file?.name ?? prefillAudioName }),
      });

      if (!response.ok) throw new Error((await response.json()).error ?? 'Analysis failed');
      if (!response.body) throw new Error('No response stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      // flush ลง state ~10fps พอ — setState ทุก chunk ทำให้ทั้งหน้า re-render ต่อ token
      let lastFlush = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const now = Date.now();
        if (now - lastFlush >= 100) {
          lastFlush = now;
          setStreamingText(accumulated);
        }
      }
      setStreamingText(accumulated);

      if (accumulated.includes('__STREAM_ERROR__')) {
        throw new Error('AI generation failed. Please try again.');
      }

      const parsed = parseEstimation(accumulated);
      if (!parsed) throw new Error('Failed to parse AI response. Please try again.');

      setResult(parsed);
      setStep('done');
      setStreamingText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setStep('transcribed');
      setStreamingText('');
    }
  };

  const handleRetranscribe = () => {
    setEditedTranscript('');
    setPrefillAudioName('');
    setStreamingText('');
    setResult(null);
    setError(null);
    if (file) {
      // มีไฟล์อยู่แล้ว → ถอดใหม่ทันที ไม่ต้องวนกลับไปหน้าอัปโหลด
      void transcribeFile(file);
    } else {
      setStep('idle');
    }
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setFile(null);
    setPrefillAudioName('');
    setManualEntry(false);
    setEditedTranscript('');
    setStreamingText('');
    setResult(null);
    setStep('idle');
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="print:hidden"><Header /></div>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 print:py-0 print:max-w-full print:px-0">
        {/* Hero */}
        <div className="text-center mb-8 print:hidden">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t.appTitle}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-slate-400 max-w-xl mx-auto">
            {t.appSubtitle}
          </p>
        </div>

        {/* Step indicator — แสดงตลอดให้รู้ว่าอยู่ขั้นไหน (เดิมโผล่เฉพาะตอนรอ) */}
        <div className="flex items-center justify-center gap-3 mb-6 print:hidden">
          {[t.stepUpload, t.stepReview, t.stepResult].map((label, i) => {
            const current = STEP_ORDER[step];
            const isDone = i < current;
            const isActive = i === current;
            const isPulsing = isActive && isProcessing;
            return (
              <div key={label} className="flex items-center gap-3">
                {i > 0 && <div className="w-8 h-px bg-gray-300 dark:bg-zinc-600" />}
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isDone
                        ? 'bg-green-500 text-white'
                        : isActive
                          ? `bg-blue-600 text-white${isPulsing ? ' animate-pulse' : ''}`
                          : 'bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-slate-400'
                    }`}
                    style={{ transition: 'none' }}
                  >
                    {isDone ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      isDone
                        ? 'text-green-600 dark:text-green-400'
                        : isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-400 dark:text-slate-500'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guest mode notice — logged out users can still use the tool, just no saved history */}
        {authStatus === 'unauthenticated' && (
          <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl print:hidden">
            <svg className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="flex-1 text-xs text-blue-700 dark:text-blue-300">{t.guestModeNotice}</p>
            <Link href="/login" className="flex-shrink-0 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:underline whitespace-nowrap">
              {t.loginNav}
            </Link>
          </div>
        )}

        {/* Upload card */}
        {(step === 'idle' || step === 'transcribing') && (
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-700 p-5 sm:p-8 mb-5">
            {/* Input mode tabs — audio upload vs typing the requirement directly */}
            <div className="flex items-center gap-2 mb-5" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={inputMode === 'audio'}
                onClick={() => setInputMode('audio')}
                disabled={isProcessing}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                  inputMode === 'audio'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-zinc-700'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
                {t.inputModeAudio}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={inputMode === 'text'}
                onClick={() => setInputMode('text')}
                disabled={isProcessing}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                  inputMode === 'text'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-zinc-700'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.862 4.487z" />
                </svg>
                {t.inputModeText}
              </button>
            </div>

            {inputMode === 'audio' ? (
              <>
                <UploadZone onFileSelect={handleFileSelect} onRemove={handleReset} disabled={isProcessing} selectedFile={file} />

                {step === 'idle' && !file && (
                  <p className="mt-3 text-center text-xs text-gray-400 dark:text-slate-500">
                    {t.autoTranscribeNote}
                  </p>
                )}

                {/* Audio preview player */}
                {file && (
                  <div className="mt-4">
                    <AudioPreview file={file} disabled={isProcessing} />
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}
                {/* ถอดเสียงเริ่มอัตโนมัติเมื่อเลือกไฟล์ — เหลือแค่ status ระหว่างรอ + retry ตอน error */}
                {step === 'transcribing' && (
                  <div className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                    <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" style={{ transition: 'none' }}>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t.transcribing}
                  </div>
                )}
                {step === 'idle' && file && error && (
                  <div className="mt-4">
                    <button
                      onClick={() => void transcribeFile(file)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {t.retryTranscribe}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div>
                <textarea
                  value={editedTranscript}
                  onChange={e => setEditedTranscript(e.target.value)}
                  rows={7}
                  placeholder={t.textModePlaceholder}
                  className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-700 text-sm text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 p-4 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <button
                  onClick={handleTextModeContinue}
                  disabled={!editedTranscript.trim()}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white disabled:text-gray-400 dark:disabled:text-slate-500 font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t.textModeContinue}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Ambient waveform — only on idle audio mode, purely decorative */}
        {step === 'idle' && inputMode === 'audio' && (
          <div
            className="flex items-end justify-center gap-0.5 h-12 mt-5 opacity-[0.22] dark:opacity-[0.14] pointer-events-none print:hidden"
            aria-hidden
          >
            {WAVE_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className="wave-bar w-1 rounded-full bg-blue-500 dark:bg-blue-400"
                style={{
                  height: `${h}%`,
                  transformOrigin: '50% 100%',
                  transition: 'none',
                  animationDuration: `${WAVE_DURATIONS[i]}s`,
                  animationDelay: `${WAVE_DELAYS[i]}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Editable transcript card */}
        {(step === 'transcribed' || step === 'analyzing') && (
          <div
            ref={transcriptCardRef}
            className="scroll-mt-20 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-700 p-5 sm:p-8 mb-5"
          >
            {/* Re-analyze source banner */}
            {prefillAudioName && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                <svg className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-blue-700 dark:text-blue-300 truncate">
                  {prefillAudioName}
                </span>
              </div>
            )}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  {manualEntry ? (
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.862 4.487z" />
                      </svg>
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                  {t.editTranscriptLabel}
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">{manualEntry ? t.manualEntryHint : t.editTranscriptHint}</p>
              </div>
              <span className="flex-shrink-0 text-xs text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-zinc-700 px-2 py-1 rounded-full">
                {editedTranscript.trim().split(/\s+/).filter(Boolean).length} {t.wordsUnit}
              </span>
            </div>
            {/* Audio replay — lets the user cross-check the transcript against the original recording */}
            {file && (
              <div className="mb-4">
                <AudioPreview file={file} disabled={step === 'analyzing'} />
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={editedTranscript}
              onChange={e => setEditedTranscript(e.target.value)}
              disabled={step === 'analyzing'}
              rows={6}
              className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-700 text-sm text-gray-800 dark:text-slate-200 p-4 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-60 disabled:cursor-not-allowed"
            />

            {/* Streaming terminal */}
            {step === 'analyzing' && (
              <div className="mt-4 bg-slate-950 rounded-xl p-4 overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ transition: 'none' }} />
                  <span className="text-xs font-mono text-slate-400">{t.generating}</span>
                </div>
                <pre
                  ref={terminalRef}
                  className="font-mono text-xs text-green-400 whitespace-pre-wrap break-all max-h-40 overflow-y-auto leading-relaxed"
                >
                  {streamingText || ' '}
                  <span className="animate-pulse" style={{ transition: 'none' }}>▌</span>
                </pre>
              </div>
            )}

            {error && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl flex items-start gap-2">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleAnalyze}
                disabled={!editedTranscript.trim() || step === 'analyzing'}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white disabled:text-gray-400 dark:disabled:text-slate-500 font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                {step === 'analyzing' ? (
                  <>
                    <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" style={{ transition: 'none' }}>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t.analyzing}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {t.analyzeAiBtn}
                  </>
                )}
              </button>
              {step !== 'analyzing' && (
                <button
                  onClick={handleRetranscribe}
                  className="px-4 py-3 border border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-slate-300 font-medium rounded-xl text-sm flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {!file && manualEntry ? t.editAgain : t.retranscribe}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div ref={resultRef} className="scroll-mt-20">
            <div className="flex items-center justify-between mb-4 print:hidden">
              <div className="h-px flex-1 bg-gray-200 dark:bg-zinc-700" />
              <span className="px-3 text-xs text-gray-400 dark:text-slate-500 font-medium">{t.resultLabel}</span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-zinc-700" />
            </div>
            <ResultCard result={result} />
            <div className="mt-5 text-center print:hidden">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 border border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-slate-300 font-medium rounded-xl text-sm"
              >
                {t.reset}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer className="print:hidden" />
    </div>
  );
}

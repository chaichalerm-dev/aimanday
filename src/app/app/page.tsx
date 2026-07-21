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
        className="h-48 animate-pulse rounded-[6px] bg-[var(--paper-muted)]"
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

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12 print:max-w-full print:px-0 print:py-0">
        {/* Hero */}
        <div className="mb-8 border-b border-[var(--line)] pb-6 print:hidden">
          <h1 className="text-3xl font-semibold tracking-[-0.025em] text-[var(--ink)] sm:text-4xl">
            {t.appTitle}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
            {t.appSubtitle}
          </p>
        </div>

        {/* Step indicator — แสดงตลอดให้รู้ว่าอยู่ขั้นไหน (เดิมโผล่เฉพาะตอนรอ) */}
        <div className="mb-6 grid grid-cols-3 border-y border-[var(--line)] bg-[var(--paper)] print:hidden">
          {[t.stepUpload, t.stepReview, t.stepResult].map((label, i) => {
            const current = STEP_ORDER[step];
            const isDone = i < current;
            const isActive = i === current;
            const isPulsing = isActive && isProcessing;
            return (
              <div key={label} className={`flex items-center gap-2 px-2 py-3 sm:px-4 ${i > 0 ? 'border-l border-[var(--line)]' : ''}`}>
                  <span
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      isDone
                        ? 'bg-emerald-700 text-white'
                        : isActive
                          ? `bg-[var(--accent)] text-white${isPulsing ? ' animate-pulse' : ''}`
                          : 'border border-[var(--line)] text-[var(--muted)]'
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
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : isActive
                          ? 'text-[var(--ink)]'
                          : 'text-[var(--muted)]'
                    }`}
                  >
                    {label}
                  </span>
              </div>
            );
          })}
        </div>

        {/* Guest mode notice — logged out users can still use the tool, just no saved history */}
        {authStatus === 'unauthenticated' && (
          <div className="mb-5 flex items-center gap-3 border-l-2 border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-3 print:hidden">
            <svg className="h-4 w-4 flex-shrink-0 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="flex-1 text-xs text-[var(--ink)]">{t.guestModeNotice}</p>
            <Link href="/login" className="flex-shrink-0 whitespace-nowrap text-xs font-semibold text-[var(--accent)] hover:underline">
              {t.loginNav}
            </Link>
          </div>
        )}

        {/* Upload card */}
        {(step === 'idle' || step === 'transcribing') && (
          <div className="ui-panel mb-5 p-5 sm:p-7">
            {/* Input mode tabs — audio upload vs typing the requirement directly */}
            <div className="mb-6 flex items-center border-b border-[var(--line)]" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={inputMode === 'audio'}
                onClick={() => setInputMode('audio')}
                disabled={isProcessing}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 ${
                  inputMode === 'audio'
                    ? 'border-[var(--accent)] text-[var(--ink)]'
                    : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
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
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 ${
                  inputMode === 'text'
                    ? 'border-[var(--accent)] text-[var(--ink)]'
                    : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
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
                  <div className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-[var(--accent)]">
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
                      className="ui-button-primary w-full px-6 py-3 text-sm"
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
                  className="ui-field resize-y p-4 text-sm placeholder:text-[var(--muted)]"
                />
                <button
                  onClick={handleTextModeContinue}
                  disabled={!editedTranscript.trim()}
                  className="ui-button-primary mt-4 w-full px-6 py-3 text-sm disabled:cursor-not-allowed disabled:border-[var(--line)] disabled:bg-[var(--paper-muted)] disabled:text-[var(--muted)]"
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

        {/* Editable transcript card */}
        {(step === 'transcribed' || step === 'analyzing') && (
          <div
            ref={transcriptCardRef}
            className="ui-panel mb-5 scroll-mt-20 p-5 sm:p-7"
          >
            {/* Re-analyze source banner */}
            {prefillAudioName && (
              <div className="mb-4 flex items-center gap-2 border-l-2 border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-2">
                <svg className="h-3.5 w-3.5 flex-shrink-0 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="truncate text-xs text-[var(--ink)]">
                  {prefillAudioName}
                </span>
              </div>
            )}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  {manualEntry ? (
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                      <svg className="h-3 w-3 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              className="ui-field resize-y p-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
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
                className="ui-button-primary flex-1 px-6 py-3 text-sm disabled:cursor-not-allowed disabled:border-[var(--line)] disabled:bg-[var(--paper-muted)] disabled:text-[var(--muted)]"
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
                  className="ui-button-secondary px-4 py-3 text-sm"
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
            <div className="mb-4 border-b border-[var(--line)] pb-2 print:hidden">
              <span className="eyebrow">{t.resultLabel}</span>
            </div>
            <ResultCard result={result} />
            <div className="mt-5 text-center print:hidden">
              <button
                onClick={handleReset}
                className="ui-button-secondary px-6 py-2.5 text-sm"
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

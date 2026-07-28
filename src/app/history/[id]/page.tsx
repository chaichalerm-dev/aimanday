'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ResultCard } from '@/components/ResultCard';
import { AudioPreview } from '@/components/AudioPreview';
import { ExportMenu } from '@/components/ExportMenu';
import { useLang } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { calculateReliability } from '@/lib/reliability';
import { downloadJson, downloadMarkdown, downloadCsv, safeBaseName } from '@/lib/download';
import { buildPrintHTML } from '@/lib/print';
import { buildItemJson, buildItemMarkdown, buildItemCsv } from '@/lib/historyExport';
import type { EstimationResult } from '@/lib/analyzer';
import type { HistoryItem } from '@/types/history';

// หน้ารายละเอียดผลประเมิน 1 รายการ (/history/[id]) — ใช้ ResultCard ตัวเดียวกับหน้า /app (hideToolbar)
export default function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, lang } = useLang();
  const { showToast } = useToast();

  const [item, setItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/history/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((data: HistoryItem) => setItem(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAudioFile(file);
    e.target.value = '';
  };

  // Map stored record → EstimationResult so we can reuse ResultCard
  // แปลง HistoryItem (รูปแบบที่เก็บใน DB/ส่งมาจาก API) ให้ตรง shape กับ EstimationResult ที่ ResultCard ต้องการ
  const result: EstimationResult | null = item
    ? {
        sow: item.sow,
        manday_estimate: { min: item.mandayMin, max: item.mandayMax },
        modules: item.modules,
        assumptions: item.assumptions,
      }
    : null;

  // ── Export handlers ──────────────────────────────────────────────────
  const baseName = item
    ? `manday-${safeBaseName(item.audioName)}-${item.mandayMin}-${item.mandayMax}`
    : 'manday-estimate';

  const handleCopyJson = async () => {
    if (!item) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(buildItemJson(item), null, 2));
      showToast(t.copied);
    } catch {
      showToast(t.copyFailed, 'error');
    }
  };

  const handleCopyMarkdown = async () => {
    if (!item) return;
    try {
      await navigator.clipboard.writeText(buildItemMarkdown(item, t, lang));
      showToast(t.copied);
    } catch {
      showToast(t.copyFailed, 'error');
    }
  };

  const handleExportJson = () => {
    if (!item) return;
    downloadJson(baseName, buildItemJson(item));
    showToast(t.exportJsonSuccess, 'info');
  };

  const handleExportMarkdown = () => {
    if (!item) return;
    downloadMarkdown(baseName, buildItemMarkdown(item, t, lang));
    showToast(t.exportMarkdownSuccess, 'info');
  };

  const handleExportCsv = () => {
    if (!item) return;
    downloadCsv(baseName, buildItemCsv(item, t, lang));
    showToast(t.exportCsvSuccess, 'info');
  };

  const handlePrint = () => {
    const html = document.documentElement;
    const wasDark = html.classList.contains('dark');
    if (wasDark) html.classList.remove('dark');
    window.print();
    if (wasDark) html.classList.add('dark');
  };

  // เหมือน handlePrintItem ในหน้า /history — เปิดหน้าต่างใหม่ + เขียน HTML ที่ประกอบไว้ล่วงหน้า + สั่งพิมพ์
  const handlePrintFull = () => {
    if (!item) return;
    const rel = calculateReliability({
      sow: item.sow,
      manday_estimate: { min: item.mandayMin, max: item.mandayMax },
      modules: item.modules,
      assumptions: item.assumptions,
    });
    const label = rel.level === 'high' ? t.reliabilityHigh : rel.level === 'medium' ? t.reliabilityMedium : t.reliabilityLow;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (win) {
      win.document.write(buildPrintHTML(item, t, lang, rel.score, rel.level, label));
      win.document.close();
      // Trigger print from here (the opener) rather than an inline <script> in the
      // written HTML — an inline script there would need its own CSP nonce, which
      // this same-origin-but-separate popup document has no way to receive.
      win.onload = () => win.print();
    }
  };

  const handleReAnalyze = () => {
    if (!item) return;
    sessionStorage.setItem(
      'reanalyze_prefill',
      JSON.stringify({ transcript: item.transcript, audioName: item.audioName }),
    );
    router.push('/app');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {/* Back link */}
        <Link
          href="/history"
          className="mb-5 flex w-fit items-center gap-1 text-xs font-medium text-[var(--muted)] hover:text-[var(--ink)] print:hidden"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t.backToHistory}
        </Link>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400 dark:text-slate-500">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" style={{ transition: 'none' }}>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">{t.loadingHistory}</span>
          </div>
        )}

        {/* Not found */}
        {!loading && notFound && (
          <div className="text-center py-20">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[4px] border border-[var(--line)] bg-[var(--paper-muted)]">
              <svg className="w-8 h-8 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-gray-700 dark:text-slate-300">{t.detailNotFound}</p>
            <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">{t.detailNotFoundDesc}</p>
            <Link href="/history" className="ui-button-primary mt-5 px-5 py-2.5 text-sm">
              {t.backToHistory}
            </Link>
          </div>
        )}

        {/* Detail */}
        {!loading && item && result && (
          <>
            {/* ── Page header: file info + actions ──────────────────── */}
            <div className="mb-5 flex flex-col gap-3 border-b border-[var(--line)] pb-5 sm:flex-row sm:items-start sm:gap-4 print:hidden">
              {/* Left: icon + filename + date */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[4px] border border-[var(--line)] bg-[var(--paper-muted)]">
                  <svg className="h-5 w-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)]">{item.audioName}</h1>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                    {t.savedAt}{' '}
                    {new Date(item.createdAt).toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Right: action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0 sm:pt-0.5">
                <button
                  onClick={handleReAnalyze}
                  className="ui-button-primary px-3 py-1.5 text-xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {t.reAnalyze}
                </button>
                <ExportMenu
                  onCopyMarkdown={handleCopyMarkdown}
                  onCopyJson={handleCopyJson}
                  onDownloadMarkdown={handleExportMarkdown}
                  onDownloadJson={handleExportJson}
                  onDownloadCsv={handleExportCsv}
                  onPrint={handlePrintFull}
                />
              </div>
            </div>

            {/* ── Audio player ─────────────────────────────────────── */}
            <div className="ui-panel mb-5 p-5 print:hidden">
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                {t.playAudio}
              </p>
              {audioFile ? (
                <>
                  <AudioPreview file={audioFile} />
                  <button
                    onClick={() => setAudioFile(null)}
                    className="mt-2.5 text-xs text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {t.changeAudioFile}
                  </button>
                </>
              ) : (
                <>
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept=".mp3,.wav,.m4a"
                    className="hidden"
                    onChange={handleAudioSelect}
                  />
                  <button
                    onClick={() => audioInputRef.current?.click()}
                    className="group flex w-full items-center gap-3 rounded-[6px] border border-dashed border-[var(--line-strong)] px-4 py-3 text-left hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
                  >
                    <svg className="h-5 w-5 flex-shrink-0 text-[var(--muted)] group-hover:text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                    <div className="min-w-0">
                      <span className="block text-sm text-[var(--muted)] group-hover:text-[var(--accent)]">
                        {t.selectAudioFile}
                      </span>
                      <span className="block text-xs text-gray-400 dark:text-slate-500 truncate mt-0.5">
                        {item.audioName}
                      </span>
                    </div>
                  </button>
                </>
              )}
            </div>

            {/* ── Estimation results ───────────────────────────────── */}
            <ResultCard result={result} hideToolbar />

            {/* ── Source transcript ────────────────────────────────── */}
            <div className="ui-panel mt-5 p-5 sm:p-6 print:hidden">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t.sourceTranscript}</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{item.transcript}</p>
            </div>
          </>
        )}
      </main>

      <Footer className="print:hidden" />
    </div>
  );
}

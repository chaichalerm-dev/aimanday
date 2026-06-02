'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLang } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { calculateReliability } from '@/lib/reliability';
import { downloadJson, downloadMarkdown, downloadCsv, safeBaseName } from '@/lib/download';
import { plainText } from '@/lib/bilingual';
import { ExportMenu } from '@/components/ExportMenu';
import { AudioPreview } from '@/components/AudioPreview';
import { Bilingual } from '@/components/Bilingual';
import { buildPrintHTML } from '@/lib/print';
import { buildItemJson, buildItemMarkdown, buildItemCsv } from '@/lib/historyExport';
import type { HistoryItem } from '@/types/history';

const ITEMS_PER_PAGE = 5;

function formatDate(iso: string, lang: 'th' | 'en'): string {
  return new Date(iso).toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// Smart page range: always show first, last, and ±1 around current
function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const candidates = [0, total - 1, current, current - 1, current + 1]
    .filter(n => n >= 0 && n < total);
  const sorted = Array.from(new Set(candidates)).sort((a, b) => a - b);
  const result: (number | 'ellipsis')[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) result.push('ellipsis');
    result.push(n);
  });
  return result;
}

// Module-level cache — survives client-side navigation within the session.
// Lets the page render instantly on revisit while it refreshes in the background.
let historyCache: HistoryItem[] | null = null;

export default function HistoryPage() {
  const { t, lang } = useLang();
  const { showToast } = useToast();
  const router = useRouter();

  const [items, setItems] = useState<HistoryItem[]>(historyCache ?? []);
  // Only show the full-screen spinner on the very first load (no cache yet)
  const [loading, setLoading] = useState(historyCache === null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [expandedAudio, setExpandedAudio] = useState<File | null>(null);
  const expandedAudioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/history')
      .then(r => r.json())
      .then((data: HistoryItem[]) => {
        historyCache = data;
        if (!cancelled) setItems(data);
      })
      .catch(() => { if (!cancelled && historyCache === null) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Reset to first page when search changes
  useEffect(() => { setPage(0); }, [search]);
  // Clear audio when a different item is expanded
  useEffect(() => { setExpandedAudio(null); }, [expandedId]);

  const filteredItems = useMemo(() =>
    search.trim()
      ? items.filter(item =>
          item.audioName.toLowerCase().includes(search.toLowerCase()),
        )
      : items,
    [items, search],
  );

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
  const fromItem = filteredItems.length === 0 ? 0 : page * ITEMS_PER_PAGE + 1;
  const toItem = Math.min((page + 1) * ITEMS_PER_PAGE, filteredItems.length);

  const showingText = t.showingOf
    .replace('{from}', String(fromItem))
    .replace('{to}', String(toItem))
    .replace('{total}', String(filteredItems.length));

  const toggleExpand = (id: string) => setExpandedId(prev => (prev === id ? null : id));
  const handleDeleteCancel = () => setConfirmingId(null);

  const handleDeleteExecute = async (id: string) => {
    setDeletingId(id);
    setConfirmingId(null);
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setItems(prev => prev.filter(item => item.id !== id));
      // Keep cache in sync so the next visit doesn't show the deleted item
      if (historyCache) historyCache = historyCache.filter(item => item.id !== id);
      if (expandedId === id) setExpandedId(null);
      showToast(t.deleteSuccess);
    } catch {
      showToast(lang === 'th' ? 'ลบไม่สำเร็จ กรุณาลองใหม่' : 'Delete failed. Please try again.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyJsonItem = async (item: HistoryItem) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(buildItemJson(item), null, 2));
      showToast(t.copied);
    } catch {
      showToast(t.copyFailed, 'error');
    }
  };

  const handleCopyMarkdownItem = async (item: HistoryItem) => {
    try {
      await navigator.clipboard.writeText(buildItemMarkdown(item, t, lang));
      showToast(t.copied);
    } catch {
      showToast(t.copyFailed, 'error');
    }
  };

  const itemBaseName = (item: HistoryItem) =>
    `manday-${safeBaseName(item.audioName)}-${item.mandayMin}-${item.mandayMax}`;

  const handleExportJsonItem = (item: HistoryItem) => {
    downloadJson(itemBaseName(item), buildItemJson(item));
    showToast(t.exportJsonSuccess, 'info');
  };

  const handleExportMarkdownItem = (item: HistoryItem) => {
    downloadMarkdown(itemBaseName(item), buildItemMarkdown(item, t, lang));
    showToast(t.exportMarkdownSuccess, 'info');
  };

  const handleExportCsvItem = (item: HistoryItem) => {
    downloadCsv(itemBaseName(item), buildItemCsv(item, t, lang));
    showToast(t.exportCsvSuccess, 'info');
  };

  const handlePrintItem = (item: HistoryItem) => {
    const rel = calculateReliability({
      sow: item.sow,
      manday_estimate: { min: item.mandayMin, max: item.mandayMax },
      modules: item.modules,
      assumptions: item.assumptions,
    });
    const label = rel.level === 'high' ? t.reliabilityHigh : rel.level === 'medium' ? t.reliabilityMedium : t.reliabilityLow;
    const html = buildPrintHTML(item, t, lang, rel.score, rel.level, label);
    const win = window.open('', '_blank', 'width=900,height=700');
    if (win) { win.document.write(html); win.document.close(); }
  };

  const handleReAnalyze = (item: HistoryItem) => {
    sessionStorage.setItem(
      'reanalyze_prefill',
      JSON.stringify({ transcript: item.transcript, audioName: item.audioName }),
    );
    router.push('/');
  };

  const handleExpandedAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setExpandedAudio(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12">
        {/* Page header */}
        <div className="mb-6">
          <Link href="/" className="text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 flex items-center gap-1 text-sm mb-2 w-fit">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.backHome}
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t.historyTitle}</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{t.historySubtitle}</p>
            </div>
            {items.length > 0 && (
              <span className="text-xs text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-zinc-700 px-3 py-1.5 rounded-full">
                {items.length} {t.items}
              </span>
            )}
          </div>
        </div>

        {/* Search bar */}
        {!loading && items.length > 0 && (
          <div className="relative mb-6">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 text-xs font-medium px-1.5"
              >
                {t.searchClear}
              </button>
            )}
          </div>
        )}

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

        {/* Empty state — no items at all */}
        {!loading && items.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-gray-700 dark:text-slate-300">{t.historyEmpty}</p>
            <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">{t.historyEmptyDesc}</p>
            <Link href="/" className="mt-5 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t.backHome}
            </Link>
          </div>
        )}

        {/* No search results */}
        {!loading && items.length > 0 && filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-gray-100 dark:bg-zinc-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">{t.searchNoResults}</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">{t.searchNoResultsDesc}</p>
            <button
              onClick={() => setSearch('')}
              className="mt-4 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t.searchClear}
            </button>
          </div>
        )}

        {/* List */}
        {!loading && paginatedItems.length > 0 && (
          <>
            {/* Showing count */}
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">{showingText}</p>

            <div className="space-y-4">
              {paginatedItems.map(item => {
                const isOpen = expandedId === item.id;
                const isDeleting = deletingId === item.id;
                const isConfirming = confirmingId === item.id;
                const totalMandays = item.modules.reduce((s, m) => s + m.manday, 0);
                const reliability = calculateReliability({
                  sow: item.sow,
                  manday_estimate: { min: item.mandayMin, max: item.mandayMax },
                  modules: item.modules,
                  assumptions: item.assumptions,
                });
                const reliabilityCfg = {
                  high:   { bg: 'bg-green-100 dark:bg-green-900/30',  text: 'text-green-700 dark:text-green-400',  dot: 'bg-green-500'  },
                  medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' },
                  low:    { bg: 'bg-red-100 dark:bg-red-900/20',       text: 'text-red-700 dark:text-red-400',       dot: 'bg-red-500'    },
                }[reliability.level];

                // Highlight matching search term in filename
                const highlightName = (name: string) => {
                  if (!search.trim()) return <span>{name}</span>;
                  const idx = name.toLowerCase().indexOf(search.toLowerCase());
                  if (idx === -1) return <span>{name}</span>;
                  return (
                    <span>
                      {name.slice(0, idx)}
                      <mark className="bg-yellow-200 dark:bg-yellow-700/50 text-inherit rounded px-0.5">
                        {name.slice(idx, idx + search.length)}
                      </mark>
                      {name.slice(idx + search.length)}
                    </span>
                  );
                };

                return (
                  <div
                    key={item.id}
                    className={`bg-white dark:bg-zinc-800 rounded-2xl border shadow-sm overflow-hidden ${
                      isDeleting ? 'opacity-40 pointer-events-none' : 'border-gray-200 dark:border-zinc-700'
                    }`}
                  >
                    <div className="p-5 sm:p-6">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/history/${item.id}`}
                              className="group/name inline-flex items-center gap-1 font-semibold text-gray-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 max-w-full"
                            >
                              <span className="truncate underline-offset-2 group-hover/name:underline">
                                {highlightName(item.audioName)}
                              </span>
                              <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover/name:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                              {t.savedAt} {formatDate(item.createdAt, lang)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
                            {item.mandayMin}–{item.mandayMax}
                            <span className="font-normal opacity-80">{lang === 'th' ? 'วัน' : 'd'}</span>
                          </span>

                          {/* Delete / Confirm */}
                          {isConfirming ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDeleteExecute(item.id)} className="px-2.5 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg">{t.deleteConfirm}</button>
                              <button onClick={handleDeleteCancel} className="px-2.5 py-1.5 text-xs font-medium border border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-600 dark:text-slate-400 rounded-lg">{t.deleteCancel}</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmingId(item.id)}
                              disabled={isDeleting}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 border border-transparent hover:border-red-200 dark:hover:border-red-800"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Stats badges */}
                      <div className="mt-4 flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${reliabilityCfg.bg} ${reliabilityCfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${reliabilityCfg.dot}`} style={{ transition: 'none' }} />
                          {reliability.score}% · {reliability.level === 'high' ? t.reliabilityHigh : reliability.level === 'medium' ? t.reliabilityMedium : t.reliabilityLow}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-zinc-700 px-2.5 py-1 rounded-full">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          {item.modules.length} {t.moduleWord} · {totalMandays} {lang === 'th' ? 'วัน' : 'days'}
                        </span>
                        {item.assumptions.length > 0 && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                            {item.assumptions.length} {t.assumptionsShort}
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 border border-gray-200 dark:border-zinc-700 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700"
                        >
                          {isOpen
                            ? <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>{t.hideDetail}</>
                            : <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>{t.viewDetail}</>
                          }
                        </button>
                        <button
                          onClick={() => handleReAnalyze(item)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          {t.reAnalyze}
                        </button>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isOpen && (
                      <div className="border-t border-gray-100 dark:border-zinc-700 px-5 sm:px-6 py-5 space-y-5">
                        {/* Audio player */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">{t.playAudio}</p>
                          {expandedAudio ? (
                            <>
                              <AudioPreview file={expandedAudio} />
                              <button
                                onClick={() => setExpandedAudio(null)}
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
                                ref={expandedAudioInputRef}
                                type="file"
                                accept=".mp3,.wav,.m4a"
                                className="hidden"
                                onChange={handleExpandedAudioSelect}
                              />
                              <button
                                onClick={() => expandedAudioInputRef.current?.click()}
                                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-dashed border-gray-200 dark:border-zinc-700 text-left hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-zinc-700 group"
                              >
                                <svg className="w-5 h-5 flex-shrink-0 text-gray-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                                </svg>
                                <div className="min-w-0">
                                  <span className="block text-sm text-gray-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
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

                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">{t.scopeOfWork}</p>
                          <ul className="space-y-2">
                            {item.sow.map((s, i) => (
                              <li key={i} className="flex items-start gap-2.5">
                                <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mt-0.5 flex-shrink-0">
                                  <svg className="w-2.5 h-2.5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </span>
                                <Bilingual value={s} className="text-sm text-gray-700 dark:text-slate-300" />
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">{t.modulesBreakdown}</p>

                          {/* Mobile: card layout */}
                          <div className="sm:hidden rounded-xl border border-gray-200 dark:border-zinc-700 divide-y divide-gray-100 dark:divide-slate-700 overflow-hidden">
                            {item.modules.map((m, i) => (
                              <div key={i} className="px-4 py-3">
                                <div className="flex items-start justify-between gap-3">
                                  <Bilingual value={m.name} className="font-medium text-gray-900 dark:text-white text-sm" />
                                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 flex-shrink-0">{m.manday} {lang === 'th' ? 'วัน' : 'd'}</span>
                                </div>
                                <div className="mt-1"><Bilingual value={m.description} className="text-sm text-gray-600 dark:text-slate-400" /></div>
                              </div>
                            ))}
                            <div className="px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-zinc-700">
                              <span className="text-xs font-semibold text-gray-900 dark:text-white">{t.total}</span>
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-600 text-white">{totalMandays} {lang === 'th' ? 'วัน' : 'd'}</span>
                            </div>
                          </div>

                          {/* Desktop: table layout */}
                          <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-700">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 dark:bg-zinc-700">
                                <tr>
                                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400">{t.colModule}</th>
                                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400">{t.colDescription}</th>
                                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 dark:text-slate-400">{t.colMandays}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                {item.modules.map((m, i) => (
                                  <tr key={i}>
                                    <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white align-top"><Bilingual value={m.name} className="whitespace-nowrap" /></td>
                                    <td className="px-4 py-2.5 text-gray-600 dark:text-slate-400 align-top"><Bilingual value={m.description} /></td>
                                    <td className="px-4 py-2.5 text-right align-top">
                                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">{m.manday}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-gray-50 dark:bg-zinc-700 border-t border-gray-200 dark:border-zinc-700">
                                <tr>
                                  <td colSpan={2} className="px-4 py-2.5 text-xs font-semibold text-gray-900 dark:text-white">{t.total}</td>
                                  <td className="px-4 py-2.5 text-right">
                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-600 text-white">{totalMandays}</span>
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>

                        {item.assumptions.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-3">{t.assumptions}</p>
                            <ul className="space-y-2">
                              {item.assumptions.map((a, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                  <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mt-0.5 flex-shrink-0 text-amber-700 dark:text-amber-400 text-xs font-bold">{i + 1}</span>
                                  <Bilingual value={a} className="text-sm text-amber-800 dark:text-amber-300" subClassName="text-xs text-amber-600/70 dark:text-amber-500/70 mt-0.5 font-normal" />
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <details className="group">
                          <summary className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer select-none flex items-center gap-2 hover:text-gray-600 dark:hover:text-slate-300">
                            <svg className="w-3.5 h-3.5 group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            {t.transcriptLabel}
                          </summary>
                          <p className="mt-3 text-sm text-gray-600 dark:text-slate-400 leading-relaxed bg-gray-50 dark:bg-zinc-700 rounded-xl p-4">{item.transcript}</p>
                        </details>

                        {/* Action toolbar */}
                        <div className="flex items-center justify-end pt-4 border-t border-gray-100 dark:border-zinc-700">
                          <ExportMenu
                            onCopyMarkdown={() => handleCopyMarkdownItem(item)}
                            onCopyJson={() => handleCopyJsonItem(item)}
                            onDownloadMarkdown={() => handleExportMarkdownItem(item)}
                            onDownloadJson={() => handleExportJsonItem(item)}
                            onDownloadCsv={() => handleExportCsvItem(item)}
                            onPrint={() => handlePrintItem(item)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-gray-400 dark:text-slate-500 order-2 sm:order-1">{showingText}</p>

                <div className="flex items-center gap-1 order-1 sm:order-2">
                  {/* Prev */}
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {t.prevPage}
                  </button>

                  {/* Page numbers */}
                  {getPageNumbers(page, totalPages).map((p, i) =>
                    p === 'ellipsis' ? (
                      <span key={`ellipsis-${i}`} className="w-8 text-center text-xs text-gray-400 dark:text-slate-500">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 text-xs font-semibold rounded-lg border ${
                          page === p
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {p + 1}
                      </button>
                    )
                  )}

                  {/* Next */}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white"
                  >
                    {t.nextPage}
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { ResultCard } from '@/components/ResultCard';
import { useLang } from '@/contexts/LanguageContext';
import type { EstimationResult, Module } from '@/lib/analyzer';
import type { MaybeBilingual } from '@/lib/bilingual';

interface HistoryItem {
  id: string;
  audioName: string;
  transcript: string;
  sow: MaybeBilingual[];
  mandayMin: number;
  mandayMax: number;
  modules: Module[];
  assumptions: MaybeBilingual[];
  createdAt: string;
}

export default function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useLang();
  const [item, setItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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

  // Map stored record → EstimationResult shape so we can reuse ResultCard
  const result: EstimationResult | null = item
    ? {
        sow: item.sow,
        manday_estimate: { min: item.mandayMin, max: item.mandayMax },
        modules: item.modules,
        assumptions: item.assumptions,
      }
    : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12">
        {/* Back link */}
        <Link
          href="/history"
          className="text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 flex items-center gap-1 text-sm mb-5 w-fit print:hidden"
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
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-gray-700 dark:text-slate-300">{t.detailNotFound}</p>
            <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">{t.detailNotFoundDesc}</p>
            <Link href="/history" className="mt-5 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm">
              {t.backToHistory}
            </Link>
          </div>
        )}

        {/* Detail */}
        {!loading && item && result && (
          <>
            {/* File header */}
            <div className="flex items-start gap-3 mb-5 print:hidden">
              <div className="w-11 h-11 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{item.audioName}</h1>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                  {t.savedAt}{' '}
                  {new Date(item.createdAt).toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* Reuse the full result card (banner, SOW, modules, assumptions, export menu) */}
            <ResultCard result={result} />

            {/* Source transcript */}
            <div className="mt-5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 sm:p-6 shadow-sm print:hidden">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t.sourceTranscript}</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{item.transcript}</p>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-gray-200 dark:border-slate-800 py-4 text-center print:hidden">
        <p className="text-xs text-gray-400 dark:text-slate-600">
          Powered by Groq Whisper &amp; Llama 3.3 · Stored in MongoDB
        </p>
      </footer>
    </div>
  );
}

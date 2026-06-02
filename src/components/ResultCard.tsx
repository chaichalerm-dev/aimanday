'use client';

import { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { calculateReliability, type ReliabilityScore } from '@/lib/reliability';
import { downloadJson, downloadMarkdown, downloadCsv } from '@/lib/download';
import { plainText } from '@/lib/bilingual';
import { ExportMenu } from '@/components/ExportMenu';
import { Bilingual } from '@/components/Bilingual';
import type { EstimationResult, Module } from '@/lib/analyzer';
import type { Translations } from '@/lib/i18n';

interface ResultCardProps {
  result: EstimationResult;
  hideToolbar?: boolean;
}

function ReliabilityBadge({
  reliability,
  t,
}: {
  reliability: ReliabilityScore;
  t: Translations;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const cfg = {
    high:   { bg: 'bg-green-400/20',  text: 'text-green-200',  ring: 'ring-green-400/40',  dot: 'bg-green-400',  label: t.reliabilityHigh },
    medium: { bg: 'bg-yellow-400/20', text: 'text-yellow-200', ring: 'ring-yellow-400/40', dot: 'bg-yellow-400', label: t.reliabilityMedium },
    low:    { bg: 'bg-red-400/20',    text: 'text-red-200',    ring: 'ring-red-400/40',    dot: 'bg-red-400',    label: t.reliabilityLow },
  }[reliability.level];

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ring-1 ${cfg.bg} ${cfg.ring} cursor-default`}
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} style={{ transition: 'none' }} />
        <span className={`text-xs font-semibold ${cfg.text} whitespace-nowrap`}>
          {reliability.score}% · {cfg.label}
        </span>
      </button>

      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 z-10 w-56 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl text-xs text-slate-300 space-y-1.5">
          <p className="font-semibold text-white mb-2">{t.reliabilityLabel}</p>
          <div className="flex justify-between">
            <span className="text-slate-400">{t.reliabilityAssumptions}</span>
            <span className={reliability.assumptionPenalty < 0 ? 'text-red-400' : 'text-slate-300'}>
              {reliability.assumptionPenalty < 0 ? reliability.assumptionPenalty : '–'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">{t.reliabilityRangeSpread}</span>
            <span className={reliability.rangePenalty < 0 ? 'text-red-400' : 'text-slate-300'}>
              {reliability.rangePenalty < 0 ? reliability.rangePenalty : '–'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">{t.reliabilityDetailBonus}</span>
            <span className={reliability.detailBonus > 0 ? 'text-green-400' : 'text-slate-300'}>
              {reliability.detailBonus > 0 ? `+${reliability.detailBonus}` : '–'}
            </span>
          </div>
          <div className="border-t border-slate-700 pt-1.5 flex justify-between font-semibold text-white">
            <span>{t.reliabilityScore}</span>
            <span>{reliability.score}/100</span>
          </div>
          <p className="text-slate-500 text-[10px] leading-relaxed pt-0.5">{t.reliabilityHint}</p>
        </div>
      )}
    </div>
  );
}

export function ResultCard({ result, hideToolbar = false }: ResultCardProps) {
  const { t, lang } = useLang();
  const { sow, manday_estimate, modules, assumptions } = result;
  const totalMandays = modules.reduce((sum: number, m: Module) => sum + m.manday, 0);

  const { showToast } = useToast();
  const reliability = calculateReliability(result);
  const baseName = `manday-estimate-${manday_estimate.min}-${manday_estimate.max}`;

  const buildMarkdown = (): string => {
    const lines: string[] = [];
    lines.push(`# Manday Estimate: ${manday_estimate.min}–${manday_estimate.max} ${lang === 'th' ? 'วันทำงาน' : 'mandays'}`);
    lines.push('');
    lines.push(`## ${t.scopeOfWork}`);
    sow.forEach(s => lines.push(`- ${plainText(s, lang)}`));
    lines.push('');
    lines.push(`## ${t.modulesBreakdown}`);
    lines.push(`| ${t.colModule} | ${t.colDescription} | ${t.colMandays} |`);
    lines.push('|---|---|---|');
    modules.forEach((m: Module) => lines.push(`| ${plainText(m.name, lang)} | ${plainText(m.description, lang)} | ${m.manday} |`));
    lines.push(`| **${t.total}** | | **${totalMandays}** |`);
    if (assumptions.length > 0) {
      lines.push('');
      lines.push(`## ${t.assumptions}`);
      assumptions.forEach(a => lines.push(`- ${plainText(a, lang)}`));
    }
    return lines.join('\n');
  };

  const buildCsv = (): string => {
    const header = [t.colModule, t.colDescription, t.colMandays];
    const rows = modules.map((m: Module) => [plainText(m.name, lang), plainText(m.description, lang), String(m.manday)]);
    return [header, ...rows, [t.total, '', String(totalMandays)]]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      showToast(t.copied);
    } catch {
      showToast(t.copyFailed, 'error');
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(buildMarkdown());
      showToast(t.copied);
    } catch {
      showToast(t.copyFailed, 'error');
    }
  };

  const handleExportJson = () => {
    downloadJson(baseName, result);
    showToast(t.exportJsonSuccess, 'info');
  };

  const handleExportMarkdown = () => {
    downloadMarkdown(baseName, buildMarkdown());
    showToast(t.exportMarkdownSuccess, 'info');
  };

  const handlePrint = () => {
    const html = document.documentElement;
    const wasDark = html.classList.contains('dark');
    if (wasDark) html.classList.remove('dark');
    window.print();
    if (wasDark) html.classList.add('dark');
  };

  const handleExportCsv = () => {
    downloadCsv(baseName, buildCsv());
    showToast(t.exportCsvSuccess, 'info');
  };

  return (
    <div className="space-y-4">
      {/* Print header — hidden on screen, visible only when printing */}
      <div className="hidden print:block mb-6 pb-5 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">AI Manday Estimator</h1>
            <p className="text-sm text-gray-500">{t.printReportTitle}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400">
          {t.printGeneratedOn}{' '}
          {new Date().toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>

      {/* Action toolbar — hidden when printing or when caller provides its own */}
      {!hideToolbar && (
      <div className="flex items-center justify-end print:hidden">
        <ExportMenu
          onCopyMarkdown={handleCopyMarkdown}
          onCopyJson={handleCopyJson}
          onDownloadMarkdown={handleExportMarkdown}
          onDownloadJson={handleExportJson}
          onDownloadCsv={handleExportCsv}
          onPrint={handlePrint}
        />
      </div>
      )}

      {/* Manday Banner */}
      <div className="print-banner bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest">{t.totalManday}</p>
          {/* Reliability Badge */}
          <ReliabilityBadge reliability={reliability} t={t} />
        </div>
        <div className="flex items-end gap-2 mt-2 flex-wrap">
          <span className="text-4xl sm:text-5xl font-bold tabular-nums">{manday_estimate.min}</span>
          <span className="text-2xl text-blue-300 mb-1">–</span>
          <span className="text-4xl sm:text-5xl font-bold tabular-nums">{manday_estimate.max}</span>
          <span className="text-base sm:text-lg text-blue-200 mb-1.5 ml-1">{t.mandays}</span>
        </div>
        <p className="mt-3 text-xs text-blue-200">
          {t.basedOn} {modules.length} {t.moduleWord} &bull; {t.sumOfModules}:{' '}
          <span className="font-semibold text-white">{totalMandays}</span>
        </p>
      </div>

      {/* Scope of Work */}
      <div className="print-card bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 p-5 sm:p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-700 dark:text-green-400 text-xs font-bold flex-shrink-0">
            {sow.length}
          </span>
          {t.scopeOfWork}
        </h3>
        <ul className="space-y-2.5">
          {sow.map((item, i: number) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mt-0.5">
                <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <Bilingual value={item} className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed" />
            </li>
          ))}
        </ul>
      </div>

      {/* Modules Breakdown */}
      <div className="print-card bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-zinc-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t.modulesBreakdown}</h3>
          <span className="text-xs text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-zinc-700 px-2 py-0.5 rounded-full">
            {modules.length} {t.moduleWord}
          </span>
        </div>
        {/* Mobile: card layout */}
        <div className="sm:hidden print:hidden divide-y divide-gray-100 dark:divide-slate-800">
          {modules.map((module: Module, i: number) => (
            <div key={i} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <Bilingual value={module.name} className="font-semibold text-gray-900 dark:text-white text-sm" />
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 flex-shrink-0">
                  {module.manday} {lang === 'th' ? 'วัน' : 'd'}
                </span>
              </div>
              <div className="mt-1.5">
                <Bilingual value={module.description} className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed" />
              </div>
            </div>
          ))}
          {/* Mobile total */}
          <div className="px-5 py-3.5 flex items-center justify-between bg-gray-50 dark:bg-zinc-700/50">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{t.total}</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-600 dark:bg-blue-500 text-white">
              {totalMandays} {lang === 'th' ? 'วัน' : 'd'}
            </span>
          </div>
        </div>

        {/* Desktop + print: table layout */}
        <div className="hidden sm:block print:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-700/50 border-b border-gray-100 dark:border-zinc-700">
              <tr>
                <th className="px-5 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{t.colModule}</th>
                <th className="px-5 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t.colDescription}</th>
                <th className="px-5 sm:px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{t.colMandays}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {modules.map((module: Module, i: number) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                  <td className="px-5 sm:px-6 py-3.5 font-medium text-gray-900 dark:text-white align-top">
                    <Bilingual value={module.name} className="whitespace-nowrap" />
                  </td>
                  <td className="px-5 sm:px-6 py-3.5 text-gray-600 dark:text-slate-400 max-w-xs align-top">
                    <Bilingual value={module.description} />
                  </td>
                  <td className="px-5 sm:px-6 py-3.5 text-right align-top">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                      {module.manday}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-zinc-700/50 border-t border-gray-100 dark:border-zinc-700">
              <tr>
                <td colSpan={2} className="px-5 sm:px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">{t.total}</td>
                <td className="px-5 sm:px-6 py-3 text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-600 dark:bg-blue-500 text-white">{totalMandays}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Assumptions */}
      {assumptions.length > 0 && (
        <div className="print-assumptions bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-700/50 p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {t.assumptions}
          </h3>
          <ul className="space-y-2.5">
            {assumptions.map((assumption, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-800/50 flex items-center justify-center mt-0.5 text-amber-700 dark:text-amber-400 text-xs font-bold">
                  {i + 1}
                </span>
                <Bilingual value={assumption} className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed" subClassName="text-xs text-amber-600/70 dark:text-amber-500/70 mt-0.5 font-normal" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

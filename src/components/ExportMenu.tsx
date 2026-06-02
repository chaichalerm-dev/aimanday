'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLang } from '@/contexts/LanguageContext';

export interface ExportMenuHandlers {
  onCopyMarkdown: () => void;
  onCopyJson: () => void;
  onDownloadMarkdown: () => void;
  onDownloadJson: () => void;
  onDownloadCsv: () => void;
  onPrint: () => void;
}

const ICONS = {
  copy: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  ),
  download: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  ),
  print: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  ),
};

function MenuItem({
  icon, label, onClick,
}: {
  icon: keyof typeof ICONS;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-zinc-600/60 rounded-lg text-left"
    >
      <svg className="w-4 h-4 flex-shrink-0 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {ICONS[icon]}
      </svg>
      {label}
    </button>
  );
}

const MENU_WIDTH = 224; // w-56

export function ExportMenu(handlers: ExportMenuHandlers) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; openUp: boolean }>({
    top: 0, left: 0, openUp: false,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Position the menu relative to the trigger, flipping up if near the bottom
  const updatePosition = () => {
    const btn = triggerRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const menuHeight = 320; // approx
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuHeight && rect.top > menuHeight;
    // Align right edge of menu to right edge of button, clamp to viewport
    let left = rect.right - MENU_WIDTH;
    left = Math.max(8, Math.min(left, window.innerWidth - MENU_WIDTH - 8));
    const top = openUp ? rect.top - 8 : rect.bottom + 8;
    setCoords({ top, left, openUp });
  };

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onScrollResize = () => updatePosition();
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEsc);
    window.addEventListener('scroll', onScrollResize, true);
    window.addEventListener('resize', onScrollResize);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
      window.removeEventListener('scroll', onScrollResize, true);
      window.removeEventListener('resize', onScrollResize);
    };
  }, [open]);

  const run = (fn: () => void) => () => { fn(); setOpen(false); };

  return (
    <>
      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
          open
            ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
            : 'border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{ICONS.download}</svg>
        {t.exportMenu}
        <svg
          className="w-3 h-3"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown rendered in a portal so no overflow-hidden ancestor can clip it */}
      {mounted && open && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[200] bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-2xl p-2"
          style={{
            top: coords.top,
            left: coords.left,
            width: MENU_WIDTH,
            transform: coords.openUp ? 'translateY(-100%)' : 'none',
          }}
        >
          <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
            {t.copyGroup}
          </p>
          <MenuItem icon="copy" label={t.copyMarkdown} onClick={run(handlers.onCopyMarkdown)} />
          <MenuItem icon="copy" label={t.copyJson} onClick={run(handlers.onCopyJson)} />

          <div className="my-1.5 border-t border-gray-100 dark:border-zinc-700" />

          <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
            {t.downloadGroup}
          </p>
          <MenuItem icon="download" label={t.exportMarkdown} onClick={run(handlers.onDownloadMarkdown)} />
          <MenuItem icon="download" label={t.exportJson} onClick={run(handlers.onDownloadJson)} />
          <MenuItem icon="download" label={t.exportCsv} onClick={run(handlers.onDownloadCsv)} />

          <div className="my-1.5 border-t border-gray-100 dark:border-zinc-700" />

          <MenuItem icon="print" label={t.printPdf} onClick={run(handlers.onPrint)} />
        </div>,
        document.body,
      )}
    </>
  );
}

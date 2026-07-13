'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLang } from '@/contexts/LanguageContext';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { lang, t, toggleLang } = useLang();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const logoutRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch {
      // Network hiccup (e.g. dev server restart) — don't crash, just hard-redirect
      window.location.href = '/';
    }
  };

  // Close the logout confirm popover on outside click / Esc
  useEffect(() => {
    if (!confirmingLogout) return;
    const onClickOutside = (e: MouseEvent) => {
      if (logoutRef.current && !logoutRef.current.contains(e.target as Node)) {
        setConfirmingLogout(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setConfirmingLogout(false);
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, [confirmingLogout]);

  return (
    <>
      {/* Spacer occupies the fixed header's height so content isn't hidden underneath */}
      <div className="h-14 print:hidden" aria-hidden />
      <header className="fixed top-0 inset-x-0 z-50 border-b border-gray-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md print:hidden">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo + Nav */}
        <div className="flex items-center gap-1 sm:gap-4 min-w-0">
          <Link
            href="/"
            aria-label="AI Manday Estimator — กลับหน้าหลัก"
            className="flex items-center gap-2 flex-shrink-0 rounded-lg -m-1 p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white text-sm whitespace-nowrap">
              AI Manday
            </span>
          </Link>

          {/* Nav links — hidden on mobile (replaced by BottomNav) */}
          <nav className="hidden md:flex items-center gap-0.5">
            <Link
              href="/app"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/app'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {t.homeNav}
            </Link>
            <Link
              href="/history"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/history'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.historyNav}
            </Link>
            <Link
              href="/guide"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/guide'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
              </svg>
              {t.guideNav}
            </Link>
          </nav>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Language Toggle */}
          <div className="flex items-center rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-700 p-0.5">
            <button
              onClick={() => lang !== 'th' && toggleLang()}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                lang === 'th'
                  ? 'bg-white dark:bg-zinc-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
              }`}
            >
              TH
            </button>
            <button
              onClick={() => lang !== 'en' && toggleLang()}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                lang === 'en'
                  ? 'bg-white dark:bg-zinc-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
              }`}
            >
              EN
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-8 h-8 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-700 flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-zinc-600"
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Account controls */}
          {status === 'loading' ? (
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-700 animate-pulse" style={{ transition: 'none' }} />
          ) : session?.user ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/account"
                title={session.user.email ?? ''}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium max-w-[36px] sm:max-w-[160px] transition-colors ${
                  pathname === '/account'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-zinc-600'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {(session.user.email ?? '?').charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline truncate">{session.user.email}</span>
              </Link>
              <div ref={logoutRef} className="relative">
                <button
                  onClick={() => setConfirmingLogout(v => !v)}
                  aria-label={t.logout}
                  title={t.logout}
                  className="w-8 h-8 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-700 flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>

                {confirmingLogout && (
                  <div
                    role="dialog"
                    aria-label={t.logoutConfirmTitle}
                    className="pop-in absolute right-0 top-full mt-3 w-64 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-2xl p-4 z-50"
                    style={{ animation: 'popIn 150ms ease-out' }}
                  >
                    {/* Caret pointing back at the trigger button */}
                    <div
                      className="absolute -top-1.5 right-3 w-3 h-3 bg-white dark:bg-zinc-800 border-l border-t border-gray-200 dark:border-zinc-700 rotate-45"
                      aria-hidden
                    />

                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 flex items-center justify-center">
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.logoutConfirmTitle}</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400 leading-relaxed break-words">
                          {t.logoutConfirmDesc.replace('{email}', session.user.email ?? '')}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-gray-100 dark:border-zinc-700 flex items-center gap-2">
                      <button
                        onClick={() => setConfirmingLogout(false)}
                        className="flex-1 px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-600 dark:text-slate-400 rounded-lg"
                      >
                        {t.logoutCancel}
                      </button>
                      <button
                        onClick={() => void handleSignOut()}
                        className="flex-1 px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg"
                      >
                        {t.logout}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
            >
              {t.loginNav}
            </Link>
          )}
        </div>
      </div>
      </header>
    </>
  );
}

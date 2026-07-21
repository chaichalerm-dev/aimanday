'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLang } from '@/contexts/LanguageContext';
import { LogoMark } from '@/components/LogoMark';

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
      <div className="h-16 print:hidden" aria-hidden />
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--line)] bg-[var(--page)] print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-5 lg:gap-8">
          <Link
            href="/"
            aria-label="AI Manday Estimator — กลับหน้าหลัก"
            className="group flex flex-shrink-0 items-center gap-2.5"
          >
            <LogoMark className="h-8 w-8 flex-shrink-0" />
            <span className="flex flex-col whitespace-nowrap leading-none">
              <span className="text-sm font-semibold tracking-[-0.025em] text-[var(--ink)]">Manday</span>
              <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Estimator</span>
            </span>
          </Link>

          <nav className="hidden h-16 items-center gap-6 md:flex">
            <Link
              href="/app"
              className={`flex h-full items-center border-b-2 pt-0.5 text-sm font-medium ${
                pathname === '/app'
                  ? 'border-[var(--accent)] text-[var(--ink)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {t.homeNav}
            </Link>
            <Link
              href="/history"
              className={`flex h-full items-center border-b-2 pt-0.5 text-sm font-medium ${
                pathname.startsWith('/history')
                  ? 'border-[var(--accent)] text-[var(--ink)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {t.historyNav}
            </Link>
            <Link
              href="/guide"
              className={`flex h-full items-center border-b-2 pt-0.5 text-sm font-medium ${
                pathname === '/guide'
                  ? 'border-[var(--accent)] text-[var(--ink)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {t.guideNav}
            </Link>
          </nav>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1.5">
          <div className="flex items-center border-r border-[var(--line)] pr-2">
            <button
              onClick={() => lang !== 'th' && toggleLang()}
              className={`px-1.5 py-1 text-[11px] font-semibold ${
                lang === 'th'
                  ? 'text-[var(--ink)] underline decoration-[var(--accent)] decoration-2 underline-offset-4'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              TH
            </button>
            <button
              onClick={() => lang !== 'en' && toggleLang()}
              className={`px-1.5 py-1 text-[11px] font-semibold ${
                lang === 'en'
                  ? 'text-[var(--ink)] underline decoration-[var(--accent)] decoration-2 underline-offset-4'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              EN
            </button>
          </div>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-[4px] text-[var(--muted)] hover:bg-[var(--paper-muted)] hover:text-[var(--ink)]"
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
            <div className="h-8 w-8 animate-pulse rounded-[4px] bg-[var(--paper-muted)]" style={{ transition: 'none' }} />
          ) : session?.user ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/account"
                title={session.user.email ?? ''}
                className={`flex max-w-[36px] items-center gap-1.5 rounded-[4px] px-1.5 py-1.5 text-xs font-medium sm:max-w-[160px] sm:px-2 ${
                  pathname === '/account'
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'text-[var(--muted)] hover:bg-[var(--paper-muted)] hover:text-[var(--ink)]'
                }`}
              >
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-[10px] font-bold text-[var(--page)]">
                  {(session.user.email ?? '?').charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline truncate">{session.user.email}</span>
              </Link>
              <div ref={logoutRef} className="relative">
                <button
                  onClick={() => setConfirmingLogout(v => !v)}
                  aria-label={t.logout}
                  title={t.logout}
                  className="flex h-8 w-8 items-center justify-center rounded-[4px] text-[var(--muted)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
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
                    className="pop-in ui-panel absolute right-0 top-full z-50 mt-3 w-64 p-4 shadow-lg"
                    style={{ animation: 'popIn 150ms ease-out' }}
                  >
                    {/* Caret pointing back at the trigger button */}
                    <div
                      className="absolute -top-1.5 right-3 h-3 w-3 rotate-45 border-l border-t border-[var(--line)] bg-[var(--paper)]"
                      aria-hidden
                    />

                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[4px] bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400">
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-sm font-semibold text-[var(--ink)]">{t.logoutConfirmTitle}</p>
                        <p className="mt-1 break-words text-xs leading-relaxed text-[var(--muted)]">
                          {t.logoutConfirmDesc.replace('{email}', session.user.email ?? '')}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 border-t border-[var(--line)] pt-3.5">
                      <button
                        onClick={() => setConfirmingLogout(false)}
                        className="ui-button-secondary flex-1 px-3 py-1.5 text-xs"
                      >
                        {t.logoutCancel}
                      </button>
                      <button
                        onClick={() => void handleSignOut()}
                        className="flex-1 rounded-[4px] bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800"
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
              className="ui-button-primary whitespace-nowrap px-3 py-1.5 text-xs"
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

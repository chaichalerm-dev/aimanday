'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from '@/contexts/LanguageContext';

interface NavItem {
  href: string;
  labelKey: 'homeNav' | 'historyNav' | 'guideNav';
  icon: (active: boolean) => React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/app',
    labelKey: 'homeNav',
    icon: (active) => active ? (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 11-1.06 1.06l-.97-.97v9.24a1.5 1.5 0 01-1.5 1.5H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.25a1.5 1.5 0 01-1.5-1.5v-9.24l-.97.97a.75.75 0 11-1.06-1.06l8.69-8.69z" />
      </svg>
    ) : (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    href: '/history',
    labelKey: 'historyNav',
    icon: (active) => active ? (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: '/guide',
    labelKey: 'guideNav',
    icon: (active) => active ? (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
      </svg>
    ) : (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
];

// Marketing/auth pages aren't part of the app's mobile tab flow — no bottom bar there.
const HIDDEN_PATHS = ['/', '/login', '/register'];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLang();

  if (HIDDEN_PATHS.includes(pathname)) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--line)] bg-[var(--paper)] md:hidden print:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch justify-around">
        {NAV_ITEMS.map(({ href, labelKey, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="group relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 py-2.5"
            >
              {/* Active indicator bar */}
              <span
                className={`absolute left-1/2 top-0 h-0.5 -translate-x-1/2 transition-all duration-200 ${
                  active ? 'w-full bg-[var(--accent)]' : 'w-0 bg-transparent'
                }`}
                style={{ transition: 'width 200ms ease' }}
              />

              {/* Icon */}
              <span
                className={`transition-colors ${
                  active
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--muted)] group-hover:text-[var(--ink)]'
                }`}
              >
                {icon(active)}
              </span>

              {/* Label */}
              <span
                className={`text-[11px] font-semibold leading-none transition-colors ${
                  active
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--muted)] group-hover:text-[var(--ink)]'
                }`}
              >
                {t[labelKey]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Reserves the space BottomNav occupies on mobile — skipped on the same pages BottomNav hides on,
// otherwise those pages get a blank gap at the bottom of the viewport.
export function MobileNavSpacer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hasBottomNav = !HIDDEN_PATHS.includes(pathname);

  return <div className={hasBottomNav ? 'pb-16 md:pb-0' : ''}>{children}</div>;
}

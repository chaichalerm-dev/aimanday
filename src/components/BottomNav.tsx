'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from '@/contexts/LanguageContext';

interface NavItem {
  href: string;
  labelKey: 'homeNav' | 'historyNav';
  icon: (active: boolean) => React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/',
    labelKey: 'homeNav',
    icon: (active) => active ? (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-1.47-1.47V19.5a1.5 1.5 0 01-1.5 1.5h-4.5a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v4.5a.75.75 0 01-.75.75H4.5A1.5 1.5 0 013 19.5V10l-1.47 1.47a.75.75 0 01-1.06-1.06l8.69-8.69z" />
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
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLang();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-gray-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md print:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch justify-around">
        {NAV_ITEMS.map(({ href, labelKey, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center justify-center gap-1 flex-1 py-3 min-h-[56px] group"
            >
              {/* Active indicator bar */}
              <span
                className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-200 ${
                  active ? 'w-8 bg-blue-600 dark:bg-blue-400' : 'w-0 bg-transparent'
                }`}
                style={{ transition: 'width 200ms ease' }}
              />

              {/* Icon */}
              <span
                className={`transition-colors ${
                  active
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300'
                }`}
              >
                {icon(active)}
              </span>

              {/* Label */}
              <span
                className={`text-[11px] font-semibold leading-none transition-colors ${
                  active
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300'
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

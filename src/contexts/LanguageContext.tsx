'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { th, en, type Translations } from '@/lib/i18n';

type Lang = 'th' | 'en';

interface LanguageContextValue {
  lang: Lang;
  t: Translations;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'th',
  t: th,
  toggleLang: () => {},
});

function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'th';
  return (localStorage.getItem('lang') as Lang) ?? 'th';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(getInitialLang);

  const toggleLang = useCallback(() => {
    setLang(l => {
      const next = l === 'th' ? 'en' : 'th';
      localStorage.setItem('lang', next);
      return next;
    });
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, t: lang === 'th' ? th : en, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);

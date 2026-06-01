'use client';

import { createContext, useContext, useState } from 'react';
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

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('th');

  return (
    <LanguageContext.Provider
      value={{
        lang,
        t: lang === 'th' ? th : en,
        toggleLang: () => setLang(l => (l === 'th' ? 'en' : 'th')),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);

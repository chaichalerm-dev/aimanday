// Helpers for rendering transcript-derived content in both Thai + English.
// Tolerant of legacy records where fields were plain strings (single language).

export interface BilingualText {
  th: string;
  en: string;
}

export type MaybeBilingual = string | Partial<BilingualText> | null | undefined;

export type Lang = 'th' | 'en';

/**
 * Resolve a field to a primary string (matching the UI language) and an
 * optional secondary string (the other language, shown small).
 */
export function pickText(value: MaybeBilingual, lang: Lang): { primary: string; secondary?: string } {
  if (value == null) return { primary: '' };
  if (typeof value === 'string') return { primary: value };

  const primary = (value[lang] ?? value.th ?? value.en ?? '').trim();
  const otherLang: Lang = lang === 'th' ? 'en' : 'th';
  const other = (value[otherLang] ?? '').trim();

  return {
    primary,
    secondary: other && other !== primary ? other : undefined,
  };
}

/** Primary text only — used for exports (CSV/JSON/Markdown) to avoid clutter. */
export function plainText(value: MaybeBilingual, lang: Lang): string {
  return pickText(value, lang).primary;
}

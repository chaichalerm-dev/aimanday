'use client';

import { useLang } from '@/contexts/LanguageContext';
import { pickText, type MaybeBilingual } from '@/lib/bilingual';

interface BilingualProps {
  value: MaybeBilingual;
  /** Tailwind classes for the primary (main) text */
  className?: string;
  /** Tailwind classes for the small secondary translation */
  subClassName?: string;
}

/**
 * Renders transcript content with the primary language and a small
 * secondary translation beneath it (when available).
 */
// component กลางไว้แสดงข้อความ 2 ภาษา — เรียกใช้แทนการ render string ตรง ๆ ทุกที่ที่เนื้อหามาจาก LLM/transcript
export function Bilingual({
  value,
  className = '',
  subClassName = 'text-xs text-gray-400 dark:text-slate-500 mt-0.5 font-normal',
}: BilingualProps) {
  const { lang } = useLang();
  const { primary, secondary } = pickText(value, lang);

  return (
    <span className="block">
      <span className={className}>{primary}</span>
      {secondary && <span className={`block ${subClassName}`}>{secondary}</span>}
    </span>
  );
}

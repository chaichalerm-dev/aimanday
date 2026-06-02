import { plainText } from './bilingual';
import type { HistoryItem } from '@/types/history';
import type { Translations } from './i18n';

export function buildItemJson(item: HistoryItem) {
  return {
    audioName: item.audioName,
    sow: item.sow,
    manday_estimate: { min: item.mandayMin, max: item.mandayMax },
    modules: item.modules,
    assumptions: item.assumptions,
    createdAt: item.createdAt,
  };
}

export function buildItemMarkdown(item: HistoryItem, t: Translations, lang: 'th' | 'en'): string {
  const total = item.modules.reduce((s, m) => s + m.manday, 0);
  const lines: string[] = [
    `# Manday Estimate: ${item.mandayMin}–${item.mandayMax} ${lang === 'th' ? 'วันทำงาน' : 'mandays'}`,
    `> ${item.audioName}`, '',
    `## ${t.scopeOfWork}`,
    ...item.sow.map(s => `- ${plainText(s, lang)}`), '',
    `## ${t.modulesBreakdown}`,
    `| ${t.colModule} | ${t.colDescription} | ${t.colMandays} |`,
    '|---|---|---|',
    ...item.modules.map(m => `| ${plainText(m.name, lang)} | ${plainText(m.description, lang)} | ${m.manday} |`),
    `| **${t.total}** | | **${total}** |`,
  ];
  if (item.assumptions.length > 0) {
    lines.push('', `## ${t.assumptions}`, ...item.assumptions.map(a => `- ${plainText(a, lang)}`));
  }
  return lines.join('\n');
}

export function buildItemCsv(item: HistoryItem, t: Translations, lang: 'th' | 'en'): string {
  const total = item.modules.reduce((s, m) => s + m.manday, 0);
  return [
    [t.colModule, t.colDescription, t.colMandays],
    ...item.modules.map(m => [plainText(m.name, lang), plainText(m.description, lang), String(m.manday)]),
    [t.total, '', String(total)],
  ].map(row => row.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
}

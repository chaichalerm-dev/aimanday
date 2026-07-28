import { plainText } from './bilingual';
import type { HistoryItem } from '@/types/history';
import type { Translations } from './i18n';

// แปลง HistoryItem (record จาก DB) ให้เป็น object รูปแบบเดียวกับที่ export เป็น JSON
// รับ item คืนค่า object ที่ตัด field ภายใน (id, userId ฯลฯ) ออก เหลือแค่ข้อมูลผลประเมิน
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

// สร้างเนื้อหา Markdown จาก HistoryItem 1 รายการ (สำหรับ copy/export เป็น .md)
// รับ item, t (translations), lang คืนค่าเป็น markdown string เดียว (join ด้วย \n)
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

// Cell text ultimately comes from the user-editable transcript. A cell that opens
// with =, +, -, @, tab, or CR is interpreted as a formula by Excel/Sheets when the
// file is later opened — prefix with a straight quote to force it to plain text
// (the well-known CSV/formula-injection mitigation).
// รับ value (เนื้อหา 1 เซลล์) คืนค่าเดิม หรือเติม ' นำหน้าถ้าขึ้นต้นด้วยอักขระที่ Excel ตีความเป็นสูตร
// regex /^[=+\-@\t\r]/ เช็คว่าตัวอักษรตัวแรกของ string เป็นหนึ่งใน = + - @ tab หรือ CR หรือไม่
export function csvSafeCell(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

// สร้างเนื้อหา CSV จาก HistoryItem 1 รายการ (ตาราง module + total)
// รับ item, t, lang คืนค่าเป็น csv string (แต่ละเซลล์ครอบด้วย "" และ escape " ซ้ำ)
export function buildItemCsv(item: HistoryItem, t: Translations, lang: 'th' | 'en'): string {
  const total = item.modules.reduce((s, m) => s + m.manday, 0);
  return [
    [t.colModule, t.colDescription, t.colMandays],
    ...item.modules.map(m => [plainText(m.name, lang), plainText(m.description, lang), String(m.manday)]),
    [t.total, '', String(total)],
  ].map(row => row.map(c => `"${csvSafeCell(c).replace(/"/g, '""')}"`).join(',')).join('\n');
}

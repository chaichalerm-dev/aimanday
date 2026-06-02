import { pickText, type MaybeBilingual } from './bilingual';
import type { Translations } from './i18n';
import type { ReliabilityLevel } from './reliability';
import type { HistoryItem } from '@/types/history';

export function buildPrintHTML(
  item: HistoryItem,
  t: Translations,
  lang: 'th' | 'en',
  reliabilityScore: number,
  reliabilityLevel: ReliabilityLevel,
  reliabilityLabel: string,
): string {
  const total = item.modules.reduce((s, m) => s + m.manday, 0);
  const dateStr = new Date(item.createdAt).toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const relColor = reliabilityLevel === 'high' ? '#86efac' : reliabilityLevel === 'medium' ? '#fde047' : '#fca5a5';
  const relBg = reliabilityLevel === 'high' ? 'rgba(34,197,94,0.2)' : reliabilityLevel === 'medium' ? 'rgba(234,179,8,0.2)' : 'rgba(239,68,68,0.2)';

  const renderBilingual = (v: MaybeBilingual) => {
    const { primary, secondary } = pickText(v, lang);
    return secondary ? `${primary}<span class="sub">${secondary}</span>` : primary;
  };

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>AI Manday Estimator – ${item.audioName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Sarabun',sans-serif;color:#111827;padding:32px;max-width:800px;margin:0 auto;font-size:14px;line-height:1.7}
    .hdr{border-bottom:2px solid #e5e7eb;padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-start}
    .hdr h1{font-size:20px;font-weight:700}.hdr-sub{font-size:12px;color:#6b7280;margin-top:4px}
    .hdr-right{text-align:right;font-size:12px;color:#9ca3af}
    .banner{background:#2563eb;color:#fff;border-radius:12px;padding:20px 24px;margin-bottom:14px}
    .banner-lbl{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.7);margin-bottom:6px}
    .banner-num{font-size:40px;font-weight:700;display:flex;align-items:baseline;gap:8px}
    .banner-unit{font-size:16px;color:rgba(255,255,255,.7)}
    .banner-foot{font-size:12px;color:rgba(255,255,255,.7);margin-top:6px}
    .rel-badge{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;margin-top:8px;background:${relBg};color:${relColor}}
    .sec{border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;margin-bottom:12px}
    .sec-title{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#6b7280;margin-bottom:10px}
    .sow-list{list-style:none}
    .sow-item{display:flex;align-items:flex-start;gap:10px;margin-bottom:7px}
    .sow-check{width:16px;height:16px;border-radius:50%;background:#dcfce7;color:#16a34a;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:10px;margin-top:2px}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th{background:#f9fafb;padding:7px 12px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;border:1px solid #e5e7eb}
    td{padding:7px 12px;border:1px solid #e5e7eb;color:#374151}
    tfoot td{background:#f9fafb;font-weight:600}
    .badge{background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600}
    .badge-dark{background:#1d4ed8;color:#fff}
    .assump{background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;padding:16px 20px;margin-bottom:12px}
    .assump .sec-title{color:#92400e}
    .assump-item{display:flex;gap:10px;margin-bottom:7px;color:#92400e;font-size:13px}
    .assump-num{width:18px;height:18px;border-radius:50%;background:#fde68a;color:#92400e;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}
    .sub{display:block;font-size:11px;color:#9ca3af;font-weight:400;margin-top:1px}
    .assump .sub{color:#b45309}
    @media print{body{padding:0}@page{size:A4;margin:15mm 20mm}}
  </style>
</head>
<body>
<div class="hdr">
  <div><h1>AI Manday Estimator</h1><div class="hdr-sub">${t.printReportTitle}</div></div>
  <div class="hdr-right"><div>${item.audioName}</div><div>${t.printGeneratedOn} ${dateStr}</div></div>
</div>
<div class="banner">
  <div class="banner-lbl">${t.totalManday}</div>
  <div class="banner-num"><span>${item.mandayMin}</span><span style="color:rgba(255,255,255,.4)">–</span><span>${item.mandayMax}</span><span class="banner-unit">${t.mandays}</span></div>
  <div class="banner-foot">${t.basedOn} ${item.modules.length} ${t.moduleWord} · ${t.sumOfModules}: ${total}</div>
  <div class="rel-badge">${reliabilityScore}% · ${reliabilityLabel}</div>
</div>
<div class="sec">
  <div class="sec-title">${t.scopeOfWork} (${item.sow.length})</div>
  <ul class="sow-list">${item.sow.map(s => `<li class="sow-item"><span class="sow-check">✓</span><span>${renderBilingual(s)}</span></li>`).join('')}</ul>
</div>
<div class="sec">
  <div class="sec-title">${t.modulesBreakdown}</div>
  <table>
    <thead><tr><th>${t.colModule}</th><th>${t.colDescription}</th><th style="text-align:right">${t.colMandays}</th></tr></thead>
    <tbody>${item.modules.map(m => `<tr><td><strong>${renderBilingual(m.name)}</strong></td><td>${renderBilingual(m.description)}</td><td style="text-align:right"><span class="badge">${m.manday}</span></td></tr>`).join('')}</tbody>
    <tfoot><tr><td colspan="2">${t.total}</td><td style="text-align:right"><span class="badge badge-dark">${total}</span></td></tr></tfoot>
  </table>
</div>
${item.assumptions.length > 0 ? `<div class="assump"><div class="sec-title">${t.assumptions}</div>${item.assumptions.map((a, i) => `<div class="assump-item"><span class="assump-num">${i + 1}</span><span>${renderBilingual(a)}</span></div>`).join('')}</div>` : ''}
<script>window.onload=function(){window.print()}<\/script>
</body></html>`;
}

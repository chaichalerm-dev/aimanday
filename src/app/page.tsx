'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLang } from '@/contexts/LanguageContext';

interface Step {
  title: string;
  desc: string;
}

interface Principle {
  title: string;
  desc: string;
}

const content = {
  th: {
    eyebrow: 'เครื่องมือช่วยประเมินงานซอฟต์แวร์',
    heroTitle: 'สรุป Requirement ให้เป็น SOW พร้อมประเมิน Manday',
    heroSubtitle:
      'อัปโหลดไฟล์เสียงหรือวางรายละเอียดงาน ตรวจแก้ข้อความ แล้วให้ระบบช่วยแยกขอบเขตและจำนวนวันทำงานของแต่ละโมดูล',
    ctaPrimary: 'เริ่มประเมินงาน',
    ctaSecondary: 'อ่านวิธีใช้งาน',
    sampleLabel: 'ESTIMATE / 024',
    sampleTitle: 'ระบบร้านค้าออนไลน์',
    sampleSource: 'สรุปจากการคุย Requirement · 18 นาที',
    sampleStatus: 'พร้อมตรวจสอบ',
    sampleTotal: 'Manday โดยประมาณ',
    sampleUnit: 'Mandays',
    sampleModules: [
      { name: 'บัญชีผู้ใช้', days: '4–6' },
      { name: 'แคตตาล็อกและตะกร้า', days: '7–9' },
      { name: 'ชำระเงินและคำสั่งซื้อ', days: '6–8' },
    ],
    sampleNote: 'แสดงเป็นช่วง เพราะรายละเอียดบางส่วนอาจยังไม่ชัดเจน',
    facts: [
      ['INPUT', 'ไฟล์เสียง หรือข้อความ'],
      ['REVIEW', 'ตรวจและแก้ข้อความก่อนประเมิน'],
      ['OUTPUT', 'SOW พร้อม Manday แยกโมดูล'],
    ],
    workflowEyebrow: 'ขั้นตอนการทำงาน',
    workflowTitle: 'จาก Requirement ถึงตัวเลขประเมินใน 4 ขั้นตอน',
    workflowSubtitle: 'ตรวจแก้ข้อมูลได้ก่อนวิเคราะห์ และกลับมาแก้ใหม่ได้ทุกเมื่อ',
    steps: [
      { title: 'ใส่รายละเอียดงาน', desc: 'อัปโหลดไฟล์ MP3, WAV, M4A หรือพิมพ์รายละเอียดที่มีอยู่' },
      { title: 'ตรวจข้อความ', desc: 'เปิดฟังเสียงต้นฉบับและแก้ชื่อระบบ คำเฉพาะ หรือรายละเอียดที่ถอดผิด' },
      { title: 'ประเมินงาน', desc: 'ระบบจะสรุปขอบเขต แยกโมดูล และคำนวณช่วง Manday ให้' },
      { title: 'ตรวจผลและส่งต่อ', desc: 'เช็กสมมติฐานและตัวเลขอีกครั้ง ก่อนดาวน์โหลดไปใช้กับทีม' },
    ] as Step[],
    principlesEyebrow: 'ก่อนนำตัวเลขไปใช้',
    principlesTitle: 'ดูได้ทั้งผลประเมินและข้อมูลที่ใช้คิด',
    principles: [
      { title: 'ย้อนดูข้อความต้นฉบับได้', desc: 'เก็บข้อความที่ใช้วิเคราะห์ไว้คู่กับผลประเมิน จึงตรวจที่มาของตัวเลขได้ง่าย' },
      { title: 'รู้ว่าส่วนไหนยังไม่ชัด', desc: 'ดูช่วง Manday สมมติฐาน และข้อมูลที่ควรถามเพิ่มก่อนสรุปราคา' },
      { title: 'นำไปทำงานต่อได้', desc: 'ค้นงานเก่า ประเมินใหม่ หรือส่งออกเป็น JSON, Markdown, CSV และ PDF ได้' },
    ] as Principle[],
    closingTitle: 'มี Requirement ที่อยากลองประเมินไหม?',
    closingDesc: 'เริ่มจากไฟล์เสียงหรือข้อความที่มีอยู่ แล้วค่อยตรวจรายละเอียดก่อนนำตัวเลขไปใช้จริง',
    closingButton: 'เริ่มประเมินงาน',
  },
  en: {
    eyebrow: 'Software project estimation',
    heroTitle: 'Turn requirements into a SOW and manday estimate.',
    heroSubtitle:
      'Upload an audio file or add a written brief, review the text, then prepare the scope and manday range for each module.',
    ctaPrimary: 'Start an estimate',
    ctaSecondary: 'Read the guide',
    sampleLabel: 'ESTIMATE / 024',
    sampleTitle: 'Online storefront',
    sampleSource: 'From an 18-minute requirement meeting',
    sampleStatus: 'Ready for review',
    sampleTotal: 'Estimated range',
    sampleUnit: 'Mandays',
    sampleModules: [
      { name: 'Customer accounts', days: '4–6' },
      { name: 'Catalogue and cart', days: '7–9' },
      { name: 'Payments and orders', days: '6–8' },
    ],
    sampleNote: 'A range is shown because some details may still need confirmation.',
    facts: [
      ['INPUT', 'Audio file or written brief'],
      ['REVIEW', 'Check and edit the text'],
      ['OUTPUT', 'SOW with mandays by module'],
    ],
    workflowEyebrow: 'Workflow',
    workflowTitle: 'Go from requirement to estimate in four steps.',
    workflowSubtitle: 'Review the source before analysis, and come back to revise it whenever needed.',
    steps: [
      { title: 'Add the requirement', desc: 'Upload an MP3, WAV, or M4A file, or enter the details you already have.' },
      { title: 'Review the text', desc: 'Replay the audio and correct any names, technical terms, or missing details.' },
      { title: 'Prepare the estimate', desc: 'The tool summarizes the scope, splits it into modules, and calculates a manday range.' },
      { title: 'Check and share', desc: 'Review the assumptions and numbers before downloading the result for your team.' },
    ] as Step[],
    principlesEyebrow: 'Before using the numbers',
    principlesTitle: 'See the estimate and the information behind it.',
    principles: [
      { title: 'Check the original text', desc: 'The text used for analysis stays with the estimate, making the source easy to review.' },
      { title: 'See what needs clarification', desc: 'Use the manday range and assumptions to find questions to confirm before pricing.' },
      { title: 'Continue with your team', desc: 'Find earlier work, run it again, or export JSON, Markdown, CSV, and PDF.' },
    ] as Principle[],
    closingTitle: 'Have a requirement you want to estimate?',
    closingDesc: 'Start with the audio or text you have, then review the details before using the numbers.',
    closingButton: 'Start an estimate',
  },
};

// หน้าแรก (/) — marketing/landing page ล้วน ไม่มี logic ซับซ้อน เนื้อหาทั้งหมดมาจาก object content[lang] ด้านบน
export default function LandingPage() {
  const { lang } = useLang();
  const c = content[lang];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b border-[var(--line)]">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-24">
            <div>
              <p className="eyebrow">{c.eyebrow}</p>
              <h1 className="mt-5 max-w-2xl text-balance text-4xl font-semibold leading-[1.22] tracking-[-0.035em] text-[var(--ink)] sm:text-5xl lg:text-[3.45rem]">
                {c.heroTitle}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                {c.heroSubtitle}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/app" className="ui-button-primary px-5 py-3 text-sm">
                  {c.ctaPrimary}
                  <span aria-hidden>→</span>
                </Link>
                <Link href="/guide" className="ui-button-secondary px-5 py-3 text-sm">
                  {c.ctaSecondary}
                </Link>
              </div>
            </div>

            <div className="ui-panel overflow-hidden" aria-label={c.sampleTitle}>
              <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] bg-[var(--paper-muted)] px-5 py-4 sm:px-6">
                <div>
                  <p className="font-mono text-[10px] font-semibold tracking-[0.12em] text-[var(--muted)]">{c.sampleLabel}</p>
                  <h2 className="mt-1 text-base font-semibold text-[var(--ink)]">{c.sampleTitle}</h2>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">{c.sampleSource}</p>
                </div>
                <span className="mt-0.5 whitespace-nowrap border-l-2 border-emerald-600 pl-2 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  {c.sampleStatus}
                </span>
              </div>

              <div className="px-5 py-6 sm:px-6">
                <p className="text-xs font-medium text-[var(--muted)]">{c.sampleTotal}</p>
                <div className="mt-1 flex items-end gap-3 border-b border-[var(--line)] pb-6">
                  <span className="text-5xl font-semibold tracking-[-0.05em] text-[var(--ink)]">17–23</span>
                  <span className="pb-1.5 text-sm text-[var(--muted)]">{c.sampleUnit}</span>
                </div>

                <div className="divide-y divide-[var(--line)]">
                  {c.sampleModules.map((module, index) => (
                    <div key={module.name} className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 py-3.5 text-sm">
                      <span className="font-mono text-[10px] text-[var(--muted)]">0{index + 1}</span>
                      <span className="font-medium text-[var(--ink)]">{module.name}</span>
                      <span className="font-mono text-xs text-[var(--accent)]">{module.days}</span>
                    </div>
                  ))}
                </div>
                <p className="border-t border-[var(--line)] pt-4 text-xs leading-5 text-[var(--muted)]">{c.sampleNote}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[var(--line)] bg-[var(--paper)]">
          <div className="mx-auto grid max-w-6xl sm:grid-cols-3">
            {c.facts.map(([label, value], index) => (
              <div key={label} className={`px-4 py-5 sm:px-6 ${index > 0 ? 'border-t border-[var(--line)] sm:border-l sm:border-t-0' : ''}`}>
                <p className="font-mono text-[10px] tracking-[0.14em] text-[var(--accent)]">{label}</p>
                <p className="mt-1 text-sm font-medium text-[var(--ink)]">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="eyebrow">{c.workflowEyebrow}</p>
            <h2 className="mt-4 max-w-md text-balance text-3xl font-semibold tracking-[-0.025em] text-[var(--ink)] sm:text-4xl">{c.workflowTitle}</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-[var(--muted)]">{c.workflowSubtitle}</p>
          </div>
          <ol className="border-t border-[var(--line-strong)]">
            {c.steps.map((step, index) => (
              <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-[var(--line)] py-5 sm:grid-cols-[3rem_12rem_1fr] sm:gap-5">
                <span className="font-mono text-xs text-[var(--accent)]">0{index + 1}</span>
                <h3 className="text-sm font-semibold text-[var(--ink)]">{step.title}</h3>
                <p className="col-start-2 text-sm leading-6 text-[var(--muted)] sm:col-start-3">{step.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-y border-[var(--line)] bg-[var(--paper)]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="eyebrow">{c.principlesEyebrow}</p>
            <h2 className="mt-4 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.025em] text-[var(--ink)] sm:text-4xl">{c.principlesTitle}</h2>
            <div className="mt-10 grid border-y border-[var(--line-strong)] sm:grid-cols-3">
              {c.principles.map((principle, index) => (
                <article key={principle.title} className={`py-6 sm:px-6 ${index > 0 ? 'border-t border-[var(--line)] sm:border-l sm:border-t-0' : ''} ${index === 0 ? 'sm:pl-0' : ''}`}>
                  <p className="font-mono text-[10px] text-[var(--accent)]">0{index + 1}</p>
                  <h3 className="mt-3 text-base font-semibold text-[var(--ink)]">{principle.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{principle.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid items-center gap-8 border-l-4 border-[var(--accent)] bg-[var(--ink)] px-6 py-8 text-[var(--page)] sm:px-10 sm:py-10 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">{c.closingTitle}</h2>
              <p className="mt-2 text-sm opacity-70">{c.closingDesc}</p>
            </div>
            <Link href="/app" className="inline-flex items-center justify-center gap-2 rounded-[4px] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]">
              {c.closingButton}<span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

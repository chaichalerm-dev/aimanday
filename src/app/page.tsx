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
    eyebrow: 'Project estimation workspace',
    heroTitle: 'เปลี่ยนบทสนทนาเรื่องงาน ให้เป็นขอบเขตที่ประเมินราคาได้',
    heroSubtitle:
      'นำไฟล์เสียงหรือ Requirement ที่มีอยู่เข้ามา ตรวจข้อความให้เรียบร้อย แล้วรับ SOW พร้อม Manday แยกรายโมดูลในที่เดียว',
    ctaPrimary: 'เริ่มประเมินงาน',
    ctaSecondary: 'อ่านวิธีใช้งาน',
    sampleLabel: 'ESTIMATE / 024',
    sampleTitle: 'ระบบร้านค้าออนไลน์',
    sampleSource: 'สรุปจาก Requirement meeting · 18 นาที',
    sampleStatus: 'พร้อมตรวจสอบ',
    sampleTotal: 'ช่วงเวลาประเมิน',
    sampleUnit: 'Mandays',
    sampleModules: [
      { name: 'บัญชีผู้ใช้', days: '4–6' },
      { name: 'แคตตาล็อกและตะกร้า', days: '7–9' },
      { name: 'ชำระเงินและคำสั่งซื้อ', days: '6–8' },
    ],
    sampleNote: 'ตัวเลขเป็นช่วงเพื่อสะท้อนความไม่แน่นอนของ Requirement',
    facts: [
      ['INPUT', 'ไฟล์เสียง หรือข้อความ'],
      ['REVIEW', 'แก้ Transcript ก่อนวิเคราะห์'],
      ['OUTPUT', 'SOW, Modules และ Manday'],
    ],
    workflowEyebrow: 'A practical workflow',
    workflowTitle: 'ทำงานตามลำดับที่ทีมประเมินจริง',
    workflowSubtitle: 'แต่ละขั้นแยกจากกันชัดเจน คุณยังเป็นคนตัดสินใจก่อนส่งต่อเสมอ',
    steps: [
      { title: 'นำ Requirement เข้า', desc: 'อัปโหลด MP3, WAV, M4A หรือวางข้อความที่เตรียมไว้แล้ว' },
      { title: 'อ่านและแก้ Transcript', desc: 'ฟังเสียงต้นฉบับซ้ำ พร้อมแก้คำศัพท์หรือรายละเอียดที่ถอดผิด' },
      { title: 'สร้าง Estimate', desc: 'ระบบจัดขอบเขต แยกโมดูล และประเมินช่วง Manday จากข้อมูลที่ตรวจแล้ว' },
      { title: 'ตรวจและส่งต่อ', desc: 'ดูสมมติฐาน คะแนนความน่าเชื่อถือ และส่งออกเป็นไฟล์ที่ทีมใช้ต่อได้' },
    ] as Step[],
    principlesEyebrow: 'Built for review',
    principlesTitle: 'ช่วยจัดงาน ไม่แย่งการตัดสินใจ',
    principles: [
      { title: 'ตรวจที่มาได้', desc: 'เก็บ Transcript คู่กับผลประเมิน เพื่อย้อนดูได้ว่าตัวเลขมาจาก Requirement ใด' },
      { title: 'เห็นความไม่แน่นอน', desc: 'แสดงช่วง Manday สมมติฐาน และคะแนนความน่าเชื่อถืออย่างตรงไปตรงมา' },
      { title: 'พร้อมเข้ากระบวนการทีม', desc: 'ค้นประวัติ วิเคราะห์ซ้ำ และส่งออก JSON, Markdown, CSV หรือ PDF ได้' },
    ] as Principle[],
    closingTitle: 'มี Requirement ที่ต้องตีขอบเขตอยู่หรือเปล่า?',
    closingDesc: 'เริ่มจากไฟล์ที่มี แล้วค่อยปรับรายละเอียดก่อนนำตัวเลขไปใช้จริง',
    closingButton: 'เปิดโต๊ะประเมินงาน',
  },
  en: {
    eyebrow: 'Project estimation workspace',
    heroTitle: 'Turn a project conversation into a scope you can estimate.',
    heroSubtitle:
      'Bring in an audio file or a written requirement, review the transcript, then prepare a module-by-module SOW and manday range in one place.',
    ctaPrimary: 'Start an estimate',
    ctaSecondary: 'Read the guide',
    sampleLabel: 'ESTIMATE / 024',
    sampleTitle: 'Online storefront',
    sampleSource: 'Prepared from an 18-minute requirement meeting',
    sampleStatus: 'Ready for review',
    sampleTotal: 'Estimated range',
    sampleUnit: 'Mandays',
    sampleModules: [
      { name: 'Customer accounts', days: '4–6' },
      { name: 'Catalogue and cart', days: '7–9' },
      { name: 'Payments and orders', days: '6–8' },
    ],
    sampleNote: 'Ranges are used to make requirement uncertainty visible.',
    facts: [
      ['INPUT', 'Audio file or written brief'],
      ['REVIEW', 'Edit the transcript first'],
      ['OUTPUT', 'SOW, modules and mandays'],
    ],
    workflowEyebrow: 'A practical workflow',
    workflowTitle: 'Follow the way estimation work actually happens.',
    workflowSubtitle: 'Each stage is separate and reviewable. You remain the decision-maker before anything moves on.',
    steps: [
      { title: 'Bring in the requirement', desc: 'Upload MP3, WAV or M4A, or paste a brief you already have.' },
      { title: 'Read and edit the transcript', desc: 'Replay the source audio while correcting terminology and missing details.' },
      { title: 'Prepare the estimate', desc: 'Structure the scope, split it into modules and calculate a manday range.' },
      { title: 'Review and hand off', desc: 'Check assumptions and reliability, then export in a format your team already uses.' },
    ] as Step[],
    principlesEyebrow: 'Built for review',
    principlesTitle: 'Structure the work without replacing judgment.',
    principles: [
      { title: 'Traceable source', desc: 'Keep the transcript beside the estimate so every number can be traced to a requirement.' },
      { title: 'Visible uncertainty', desc: 'Show ranges, assumptions and reliability instead of presenting false precision.' },
      { title: 'Fits team workflows', desc: 'Search history, re-analyze, and export JSON, Markdown, CSV or PDF.' },
    ] as Principle[],
    closingTitle: 'Have a requirement that needs scoping?',
    closingDesc: 'Start with what you have, then refine the details before using the numbers.',
    closingButton: 'Open the estimation desk',
  },
};

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

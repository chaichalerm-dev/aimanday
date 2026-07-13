'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLang } from '@/contexts/LanguageContext';

interface Step {
  num: number;
  title: string;
  desc: string;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

interface Stat {
  value: string;
  label: string;
}

// Deterministic decorative waveform — reuses the same .wave-bar keyframes as the app's idle state
const HERO_WAVE_HEIGHTS = [30, 55, 40, 70, 45, 85, 50, 65, 35, 75, 48, 60, 90, 42, 68, 52, 78, 38, 58, 46];
const HERO_WAVE_DURATIONS = [1.3, 1.6, 1.1, 1.8, 1.4, 1.2, 1.7, 1.5, 1.9, 1.3, 1.6, 1.1, 1.4, 1.8, 1.2, 1.7, 1.5, 1.9, 1.3, 1.6];
const HERO_WAVE_DELAYS = [0, 0.2, 0.4, 0.1, 0.35, 0.15, 0.3, 0.05, 0.25, 0.45, 0.1, 0.4, 0.2, 0.3, 0.05, 0.35, 0.15, 0.25, 0.4, 0.1];

const content = {
  th: {
    heroBadge: 'ขับเคลื่อนด้วย Groq Whisper + GPT OSS 120B',
    heroTitleLine1: 'จากไฟล์เสียง Requirement',
    heroTitleLine2: 'สู่ Manday ที่พร้อมเสนอราคา',
    heroSubtitle:
      'อัปโหลดไฟล์เสียงที่ลูกค้าพูดความต้องการ ให้ AI ถอดเสียง วิเคราะห์ขอบเขตงาน แล้วประมาณการวันทำงานแยกรายโมดูลให้อัตโนมัติ — เสร็จในไม่กี่นาที',
    ctaPrimary: 'เริ่มประเมินฟรี',
    ctaSecondary: 'ดูวิธีใช้งาน',
    mockTitle: 'ตัวอย่างผลลัพธ์',
    mockModules: [
      { name: 'ระบบสมาชิก & Login', manday: 5 },
      { name: 'หน้าตะกร้าสินค้า', manday: 8 },
      { name: 'ระบบชำระเงิน', manday: 6 },
    ],
    mockTotal: 'รวมประมาณการ',
    mockReliability: 'ความเชื่อมั่นสูง',
    stats: [
      { value: '3', label: 'ขั้นตอนง่ายๆ' },
      { value: '< 1 นาที', label: 'ถอดเสียงอัตโนมัติ' },
      { value: 'TH / EN', label: 'รองรับสองภาษา' },
      { value: 'Real-time', label: 'ดูผล AI แบบ Streaming' },
    ] as Stat[],
    howTitle: 'ใช้งานง่ายใน 4 ขั้นตอน',
    howSubtitle: 'ไม่ต้องพิมพ์ Requirement เอง แค่พูดแล้วอัปโหลด',
    steps: [
      { num: 1, title: 'อัปโหลดไฟล์เสียง', desc: 'ลากไฟล์ .mp3 / .wav / .m4a มาวาง หรือคลิกเพื่อเลือก ระบบเริ่มถอดเสียงให้ทันที' },
      { num: 2, title: 'ตรวจสอบข้อความ', desc: 'แก้ไข transcript ให้ถูกต้อง พร้อมฟังเสียงต้นฉบับซ้ำได้ทุกจุด' },
      { num: 3, title: 'วิเคราะห์ด้วย AI', desc: 'กดวิเคราะห์แล้วดูผลลัพธ์ค่อยๆ ปรากฏแบบ real-time' },
      { num: 4, title: 'รับ SOW + Manday', desc: 'ได้ขอบเขตงาน ตารางโมดูล และคะแนนความน่าเชื่อถือ พร้อมส่งออกทันที' },
    ] as Step[],
    featuresTitle: 'ครบทุกสิ่งที่ทีมประเมินงานต้องการ',
    featuresSubtitle: 'ออกแบบมาให้ใช้งานจริงได้ทันที ไม่ใช่แค่ demo',
    features: [
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
        ),
        title: 'ถอดเสียงอัตโนมัติ',
        desc: 'แปลงไฟล์เสียงเป็นข้อความด้วย Groq Whisper ทันทีที่เลือกไฟล์ ไม่ต้องกดปุ่มเพิ่ม',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        title: 'วิเคราะห์แบบ Streaming',
        desc: 'เห็นผล AI ค่อยๆ พิมพ์ออกมาแบบ real-time ไม่ต้องรอหน้าจอค้าง',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        title: 'คะแนนความน่าเชื่อถือ',
        desc: 'คำนวณจากสมมติฐาน ช่วง range และความละเอียด รู้ทันทีว่าควรเชื่อผลแค่ไหน',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
          </svg>
        ),
        title: 'รองรับสองภาษา',
        desc: 'เนื้อหาจากเสียงถูกจัดเก็บทั้งไทยและอังกฤษ สลับดูได้ทันทีไม่ต้องวิเคราะห์ซ้ำ',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        title: 'ประวัติ + วิเคราะห์ซ้ำ',
        desc: 'เก็บทุกการประเมิน ค้นหาได้ แก้ transcript แล้ววิเคราะห์ใหม่โดยไม่ต้องอัดเสียงซ้ำ',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 5.25v13.5A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
        ),
        title: 'ส่งออกหลายรูปแบบ',
        desc: 'คัดลอก/ดาวน์โหลดเป็น JSON, Markdown, CSV หรือพิมพ์เป็น PDF ได้ทันที',
      },
    ] as Feature[],
    finalCtaTitle: 'พร้อมประเมินโปรเจกต์ถัดไปหรือยัง?',
    finalCtaSubtitle: 'ไม่ต้องสมัครสมาชิก ไม่มีค่าใช้จ่าย เริ่มได้ทันที',
    finalCtaButton: 'เริ่มใช้งานเลย',
    poweredBy: 'Powered by Groq Whisper & GPT OSS 120B',
  },
  en: {
    heroBadge: 'Powered by Groq Whisper + GPT OSS 120B',
    heroTitleLine1: 'From a requirement recording',
    heroTitleLine2: 'to a quotable manday estimate',
    heroSubtitle:
      'Upload the audio where your client explains what they need — AI transcribes it, scopes the work, and estimates mandays per module automatically. Done in minutes.',
    ctaPrimary: 'Start Estimating Free',
    ctaSecondary: 'See How It Works',
    mockTitle: 'Sample Result',
    mockModules: [
      { name: 'Auth & Login', manday: 5 },
      { name: 'Shopping Cart', manday: 8 },
      { name: 'Payment System', manday: 6 },
    ],
    mockTotal: 'Total estimate',
    mockReliability: 'High Confidence',
    stats: [
      { value: '3', label: 'simple steps' },
      { value: '< 1 min', label: 'auto transcription' },
      { value: 'TH / EN', label: 'bilingual support' },
      { value: 'Real-time', label: 'streaming AI output' },
    ] as Stat[],
    howTitle: 'Get started in 4 steps',
    howSubtitle: "No need to type out requirements — just speak and upload",
    steps: [
      { num: 1, title: 'Upload audio', desc: 'Drop a .mp3 / .wav / .m4a file or click to browse. Transcription starts instantly.' },
      { num: 2, title: 'Review transcript', desc: 'Fix any STT errors while replaying the original audio at any point.' },
      { num: 3, title: 'Analyze with AI', desc: 'Hit analyze and watch the result stream in, live, in real time.' },
      { num: 4, title: 'Get SOW + mandays', desc: 'Receive scope of work, module breakdown, and a reliability score — ready to export.' },
    ] as Step[],
    featuresTitle: 'Everything your estimation workflow needs',
    featuresSubtitle: 'Built to be used for real work, not just a demo',
    features: [
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
        ),
        title: 'Auto transcription',
        desc: 'Audio is converted to text with Groq Whisper the moment you pick a file — no extra clicks.',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        title: 'Streaming analysis',
        desc: 'Watch the AI output type itself out live — no blank-screen waiting.',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        title: 'Reliability score',
        desc: 'Calculated from assumptions, range spread, and detail — know how much to trust the result.',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
          </svg>
        ),
        title: 'Bilingual by default',
        desc: 'Audio content is stored in both Thai and English — switch instantly without re-analyzing.',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        title: 'History + re-analyze',
        desc: 'Every estimate is saved and searchable. Edit an old transcript and re-run without re-recording.',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 5.25v13.5A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
        ),
        title: 'Export anywhere',
        desc: 'Copy or download as JSON, Markdown, CSV, or print straight to PDF.',
      },
    ] as Feature[],
    finalCtaTitle: 'Ready to estimate your next project?',
    finalCtaSubtitle: 'No sign-up, no cost — start right away',
    finalCtaButton: 'Get Started',
    poweredBy: 'Powered by Groq Whisper & GPT OSS 120B',
  },
};

export default function LandingPage() {
  const { lang } = useLang();
  const c = content[lang];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Decorative gradient blobs */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/30 dark:bg-blue-600/20 rounded-full blur-3xl" />
            <div className="absolute top-10 -right-24 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/15 rounded-full blur-3xl" />
          </div>

          <div className="max-w-6xl mx-auto px-4 pt-12 pb-16 sm:pt-20 sm:pb-24 grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" style={{ transition: 'none' }} />
                {c.heroBadge}
              </span>

              <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-snug sm:leading-[1.3]">
                {c.heroTitleLine1}
                <br />
                <span className="text-blue-600 dark:text-blue-400">{c.heroTitleLine2}</span>
              </h1>

              <p className="mt-5 text-base sm:text-lg text-gray-500 dark:text-slate-400 max-w-xl mx-auto lg:mx-0">
                {c.heroSubtitle}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <Link
                  href="/app"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3.5 rounded-xl text-sm shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-transform"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {c.ctaPrimary}
                </Link>
                <Link
                  href="/guide"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-slate-300 font-semibold px-6 py-3.5 rounded-xl text-sm active:scale-[0.98] transition-transform"
                >
                  {c.ctaSecondary}
                </Link>
              </div>

              {/* Decorative waveform */}
              <div className="mt-10 flex items-end justify-center lg:justify-start gap-0.5 h-10 opacity-[0.28] dark:opacity-[0.18] pointer-events-none" aria-hidden>
                {HERO_WAVE_HEIGHTS.map((h, i) => (
                  <div
                    key={i}
                    className="wave-bar w-1 rounded-full bg-blue-500 dark:bg-blue-400"
                    style={{
                      height: `${h}%`,
                      transformOrigin: '50% 100%',
                      transition: 'none',
                      animationDuration: `${HERO_WAVE_DURATIONS[i]}s`,
                      animationDelay: `${HERO_WAVE_DELAYS[i]}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Right: mock result card */}
            <div className="relative mx-auto w-full max-w-sm lg:max-w-none" aria-hidden>
              <div className="relative bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-700 p-5 sm:p-6 rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                    {c.mockTitle}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" style={{ transition: 'none' }} />
                    {c.mockReliability}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {c.mockModules.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-700/60"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{m.name}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex-shrink-0">
                        {m.manday} {lang === 'th' ? 'วัน' : 'd'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-700 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{c.mockTotal}</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {c.mockModules.reduce((s, m) => s + m.manday, 0)} {lang === 'th' ? 'วัน' : 'days'}
                  </span>
                </div>
              </div>

              {/* Floating mini badge */}
              <div className="absolute -bottom-4 -left-4 sm:-left-8 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 px-3.5 py-2.5 flex items-center gap-2 -rotate-3">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">AI Manday</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats strip ──────────────────────────────────────── */}
        <section className="border-y border-gray-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-800/40">
          <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {c.stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{s.value}</p>
                <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{c.howTitle}</h2>
            <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-slate-400">{c.howSubtitle}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {c.steps.map((s, i) => (
              <div key={s.num} className="relative">
                <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 p-5 h-full">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 text-white text-sm font-bold">
                    {s.num}
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
                {/* Connector line (desktop only, not after last) */}
                {i < c.steps.length - 1 && (
                  <div className="hidden lg:block absolute top-9 -right-2.5 w-5 h-px bg-gray-300 dark:bg-zinc-600" aria-hidden />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────── */}
        <section className="bg-white/60 dark:bg-zinc-800/40 border-y border-gray-200 dark:border-zinc-700">
          <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{c.featuresTitle}</h2>
              <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-slate-400">{c.featuresSubtitle}</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {c.features.map((f, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 p-5"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    {f.icon}
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-6 sm:px-12 py-12 sm:py-16 text-center">
            <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" aria-hidden />
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{c.finalCtaTitle}</h2>
            <p className="mt-2 text-sm sm:text-base text-blue-100">{c.finalCtaSubtitle}</p>
            <Link
              href="/app"
              className="mt-7 inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-blue-700 font-semibold px-6 py-3.5 rounded-xl text-sm shadow-lg active:scale-[0.98] transition-transform"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {c.finalCtaButton}
            </Link>
            <p className="mt-5 text-xs text-blue-200">{c.poweredBy}</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

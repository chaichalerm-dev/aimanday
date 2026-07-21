'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLang } from '@/contexts/LanguageContext';

// LINE Official Account
const LINE_OA_ID = '@861imfey';
const LINE_OA_URL = 'https://lin.ee/5isJ1J1';

interface Step {
  num: number;
  title: string;
  desc: string;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  desc: string;
  why: string;
}

const FEATURE_ICONS: React.ReactNode[] = [
  <path key="mic" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
    d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />,
  <path key="speaker" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
    d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />,
  <path key="pencil" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.862 4.487z" />,
  <path key="bolt" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
  <path key="shield" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  <path key="clock" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
  <path key="refresh" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
  <path key="download" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />,
  <path key="globe" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
    d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />,
];

function FeatureIcon({ index }: { index: number }) {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {FEATURE_ICONS[index]}
    </svg>
  );
}

const content = {
  th: {
    badge: 'คู่มือการใช้งาน',
    title: 'วิธีใช้งาน',
    subtitle: 'ทุกขั้นตอน ทุกฟีเจอร์ของ AI Manday Estimator ในหน้าเดียว',
    introTitle: 'แอปนี้คืออะไร?',
    intro: 'AI Manday Estimator คือระบบช่วยประเมินจำนวนวันทำงาน (Manday) จากไฟล์เสียง Requirement โดยอัตโนมัติ — เพียงอัปโหลดไฟล์เสียงที่ลูกค้าพูดความต้องการ (หรือพิมพ์ข้อความเองก็ได้) ระบบจะถอดเสียงเป็นข้อความ แล้วใช้ AI วิเคราะห์ออกมาเป็นขอบเขตงาน (SOW) พร้อมประมาณการเวลาแยกรายโมดูล',
    stepsTitle: 'ขั้นตอนการใช้งาน',
    stepsSubtitle: 'จากไฟล์เสียงหรือข้อความ สู่ผลลัพธ์พร้อมส่งออก',
    steps: [
      { num: 1, title: 'อัปโหลดไฟล์เสียง หรือพิมพ์ข้อความ', desc: 'ลากไฟล์ .mp3 / .wav / .m4a มาวาง หรือสลับแท็บ "พิมพ์ข้อความ" เพื่อกรอก Requirement เองโดยไม่ต้องมีไฟล์เสียง' },
      { num: 2, title: 'ถอดเสียงอัตโนมัติ', desc: 'เลือกไฟล์ปุ๊บ ระบบถอดเสียงเป็นข้อความด้วย Groq Whisper ให้ทันที ไม่ต้องกดปุ่มเพิ่ม' },
      { num: 3, title: 'ตรวจสอบและแก้ไขข้อความ', desc: 'AI ถอดเสียงอาจมีคำผิดบ้าง ฟังเสียงซ้ำได้จากเครื่องเล่นที่ปรากฏอยู่ แล้วแก้ไขข้อความให้ถูกต้องก่อนส่ง AI วิเคราะห์' },
      { num: 4, title: 'วิเคราะห์ด้วย AI', desc: 'กดปุ่ม "วิเคราะห์ด้วย AI" จะเห็นผลลัพธ์ค่อยๆ ปรากฏแบบ real-time พร้อม progress terminal' },
      { num: 5, title: 'ดูผลและส่งออก', desc: 'ดู SOW, ช่วง Manday, ตารางโมดูลแยกรายการ, สมมติฐาน และคะแนนความน่าเชื่อถือ จากนั้นคัดลอกหรือดาวน์โหลดเป็นไฟล์ได้ทันที' },
    ] as Step[],
    featuresTitle: 'ฟีเจอร์ทั้งหมด',
    featuresSubtitle: 'ออกแบบมาให้ใช้งานจริงได้ ไม่ใช่แค่ demo',
    features: [
      { title: 'ถอดเสียงเป็นข้อความ (STT)', desc: 'แปลงไฟล์เสียงเป็นข้อความด้วย Groq Whisper ใช้เวลาไม่กี่วินาที', why: 'ประหยัดเวลา PM ที่ต้องนั่งฟังและจดเองทีละนาที' },
      { title: 'เครื่องเล่นเสียงพร้อม Waveform', desc: 'เล่น / หยุด / Seek พร้อมแสดง waveform — ใช้ได้ทั้งขั้นอัปโหลด, ตรวจสอบ transcript และในหน้าประวัติ', why: 'เทียบเสียงกับข้อความได้ทุกจุดโดยไม่ต้องสลับแอป' },
      { title: 'แก้ไข Transcript ได้', desc: 'ฟังเสียงซ้ำขณะตรวจสอบ แล้วแก้ไขข้อความให้ถูกต้องก่อนส่ง AI', why: 'STT ไม่แม่น 100% การแก้ก่อนช่วยให้ผลวิเคราะห์แม่นยำขึ้นมาก' },
      { title: 'วิเคราะห์แบบ Streaming', desc: 'เห็นผล AI ค่อยๆ พิมพ์ออกมาแบบ real-time เหมือน terminal', why: 'ไม่ต้องรอหน้าจอค้าง รู้ว่าระบบกำลังทำงานอยู่ตลอดเวลา' },
      { title: 'คะแนนความน่าเชื่อถือ', desc: 'แสดง % ความเชื่อมั่นพร้อม breakdown: สมมติฐาน, ช่วง range, ความละเอียด', why: 'รู้ว่าควรเชื่อผลแค่ไหน หรือต้องสอบถามลูกค้าเพิ่มในจุดไหน' },
      { title: 'ประวัติและหน้ารายละเอียด', desc: 'เก็บทุกการประเมิน ค้นหา/แบ่งหน้าได้ คลิกชื่อไฟล์เปิดหน้าเดี่ยวพร้อม export และฟังเสียงประกอบ', why: 'ย้อนดูงานเก่า เปรียบเทียบ หรือนำมา Re-analyze ได้ทันที' },
      { title: 'วิเคราะห์ซ้ำ (Re-analyze)', desc: 'ดึง transcript เก่าจากประวัติ แก้ไข แล้ววิเคราะห์ใหม่โดยไม่ต้องอัดเสียงซ้ำ', why: 'ปรับ requirement หรือแก้คำผิดแล้วประเมินใหม่ได้ทันที' },
      { title: 'ส่งออกหลายรูปแบบ', desc: 'คัดลอก/ดาวน์โหลดเป็น JSON, Markdown, CSV หรือพิมพ์เป็น PDF — มีทุกหน้า', why: 'นำผลไปใช้ต่อในเอกสาร ใบเสนอราคา หรือส่งทีมได้ทันที' },
      { title: 'ธีม + ภาษา จำการตั้งค่า', desc: 'โหมดมืดโทนอบอุ่น (Zinc) ไม่ดำจนเกินไป สลับกับโหมดสว่างได้ทันที พร้อมสลับภาษา TH/EN ระบบจำค่าที่ตั้งไว้แม้ reload หน้า', why: 'ใช้งานสบายตาทุกสภาพแสง ทั้งในที่สว่างและมืด รองรับทีมที่ใช้ภาษาต่างกัน' },
    ] as Feature[],
    contactTitle: 'ติดต่อผู้พัฒนา',
    contactDesc: 'มีคำถาม ข้อเสนอแนะ หรือพบปัญหาการใช้งาน? ติดต่อเราได้ผ่าน LINE Official Account',
    lineButton: 'เพิ่มเพื่อนทาง LINE',
    lineNote: 'หรือค้นหา LINE ID:',
    backHome: 'เริ่มใช้งาน',
  },
  en: {
    badge: 'User Guide',
    title: 'How to Use',
    subtitle: 'Every step and feature of AI Manday Estimator, on one page',
    introTitle: 'What is this app?',
    intro: 'AI Manday Estimator automatically estimates project mandays from audio requirement recordings. Simply upload an audio file of a client describing their needs (or just type the requirement directly) — the system transcribes it to text, then uses AI to extract a Scope of Work (SOW) with per-module time estimates.',
    stepsTitle: 'How it works',
    stepsSubtitle: 'From audio or text, to an export-ready result',
    steps: [
      { num: 1, title: 'Upload audio, or type it in', desc: 'Drag & drop a .mp3 / .wav / .m4a file, or switch to the "Type Text" tab to enter the requirement directly — no audio needed.' },
      { num: 2, title: 'Auto transcription', desc: 'The moment you pick a file, Groq Whisper converts it to text automatically — no extra clicks.' },
      { num: 3, title: 'Review & edit', desc: 'STT may have minor errors. Play the audio again right on the same screen to cross-check, then edit the transcript before sending to AI.' },
      { num: 4, title: 'Analyze with AI', desc: 'Click "Analyze with AI" and watch results stream in real-time via a live terminal.' },
      { num: 5, title: 'View & export', desc: 'Review the SOW, manday range, modules table, assumptions, and reliability score — then copy or download in your preferred format.' },
    ] as Step[],
    featuresTitle: 'All Features',
    featuresSubtitle: 'Built to be used for real work, not just a demo',
    features: [
      { title: 'Speech-to-Text (STT)', desc: 'Convert audio to text via Groq Whisper in seconds', why: 'Saves PMs from listening and note-taking minute by minute' },
      { title: 'Audio Player with Waveform', desc: 'Play / pause / seek with waveform visualization — available at upload, transcript review, and in history', why: 'Cross-check audio against text at every stage without switching apps' },
      { title: 'Editable Transcript', desc: 'Replay the audio while reviewing, then fix any STT errors before AI analysis', why: 'Even small corrections significantly improve the quality of the AI output' },
      { title: 'Streaming Analysis', desc: 'Watch AI output appear word-by-word in real-time, like a terminal', why: 'No frozen screen — you always know the system is working' },
      { title: 'Reliability Score', desc: 'Shows a confidence % with a breakdown: assumptions, range spread, detail level', why: 'Know exactly how much to trust the result and where to probe the client' },
      { title: 'History & Detail Page', desc: 'All estimates saved — searchable, paginated. Click any filename for a full detail page with export and audio replay', why: 'Revisit, compare, or re-analyze past work instantly' },
      { title: 'Re-analyze', desc: 'Pull any past transcript back into the editor, edit it, and re-run the analysis', why: 'Adjust requirements or fix transcription errors without re-recording' },
      { title: 'Multi-format Export', desc: 'Copy/download as JSON, Markdown, CSV, or print to PDF — available on every page', why: 'Drop results straight into docs, quotes, or share with the team' },
      { title: 'Theme + Language Saved', desc: 'Warm dark mode (Zinc tones, not pitch-black) + light mode, plus Thai/English toggle — all settings saved across reloads', why: 'Easy on the eyes in any lighting, works for mixed-language teams' },
    ] as Feature[],
    contactTitle: 'Contact the Developer',
    contactDesc: 'Questions, feedback, or issues? Reach us via our LINE Official Account.',
    lineButton: 'Add on LINE',
    lineNote: 'Or search LINE ID:',
    backHome: 'Get Started',
  },
};

export default function GuidePage() {
  const { lang } = useLang();
  const c = content[lang];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="border-b border-[var(--line)]">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="eyebrow">{c.badge}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-5xl">{c.title}</h1>
            <p className="mt-3 max-w-xl text-sm text-[var(--muted)] sm:text-base">{c.subtitle}</p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-14">
          {/* Intro */}
          <section className="mx-auto mb-16 flex max-w-4xl items-start gap-4 border-l-2 border-[var(--accent)] bg-[var(--paper)] p-5 sm:p-6">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center text-[var(--accent)]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <div>
              <h2 className="mb-1.5 text-sm font-semibold text-[var(--ink)]">{c.introTitle}</h2>
              <p className="text-sm leading-relaxed text-[var(--muted)]">{c.intro}</p>
            </div>
          </section>

          {/* Steps */}
          <section className="mb-16">
            <div className="mb-8 border-b border-[var(--line-strong)] pb-5">
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)] sm:text-3xl">{c.stepsTitle}</h2>
              <p className="mt-2 text-sm text-[var(--muted)] sm:text-base">{c.stepsSubtitle}</p>
            </div>

            <div className="grid border-b border-[var(--line)] sm:grid-cols-2 lg:grid-cols-5">
              {c.steps.map((step, i) => (
                <div key={step.num} className={`border-t border-[var(--line)] p-5 ${i > 0 ? 'lg:border-l' : ''}`}>
                  <span className="font-mono text-xs font-semibold text-[var(--accent)]">0{step.num}</span>
                  <h3 className="mt-4 text-sm font-semibold text-[var(--ink)]">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="mb-16">
            <div className="mb-8 border-b border-[var(--line-strong)] pb-5">
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)] sm:text-3xl">{c.featuresTitle}</h2>
              <p className="mt-2 text-sm text-[var(--muted)] sm:text-base">{c.featuresSubtitle}</p>
            </div>

            <div className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
              {c.features.map((f, i) => (
                <div key={i} className="border-b border-[var(--line)] py-5">
                  <div className="flex h-8 w-8 items-center justify-center text-[var(--accent)]">
                    <FeatureIcon index={i} />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-[var(--ink)]">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{f.desc}</p>
                  <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-[var(--accent)]">
                    <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {f.why}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact — LINE OA */}
          <section className="ui-panel relative mx-auto max-w-4xl border-l-4 border-l-green-600 p-6 sm:p-8">
            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              {/* LINE icon */}
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[4px] bg-green-600">
                <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.072 9.436-6.971C23.176 14.393 24 12.458 24 10.314" />
                </svg>
              </div>

              {/* Text + button */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-lg font-bold">{c.contactTitle}</h2>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{c.contactDesc}</p>
                <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href={LINE_OA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[4px] bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 sm:w-auto"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.072 9.436-6.971C23.176 14.393 24 12.458 24 10.314" />
                    </svg>
                    {c.lineButton}
                  </a>
                  <span className="text-sm text-[var(--muted)]">
                    {c.lineNote} <span className="font-semibold text-[var(--ink)]">{LINE_OA_ID}</span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="mt-10 text-center">
            <Link
              href="/app"
              className="ui-button-primary px-6 py-3.5 text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {c.backHome}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

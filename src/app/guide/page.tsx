'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { useLang } from '@/contexts/LanguageContext';

// LINE Official Account ID
const LINE_OA_ID = '@lineoademo';
const LINE_OA_URL = 'https://line.me/R/ti/p/@lineoademo';

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

const content = {
  th: {
    title: 'วิธีใช้งาน',
    subtitle: 'คู่มือการใช้งาน AI Manday Estimator ทั้งหมด',
    introTitle: 'แอปนี้คืออะไร?',
    intro: 'AI Manday Estimator คือระบบช่วยประเมินจำนวนวันทำงาน (Manday) จากไฟล์เสียง Requirement โดยอัตโนมัติ — เพียงอัปโหลดไฟล์เสียงที่ลูกค้าพูดความต้องการ ระบบจะถอดเสียงเป็นข้อความ แล้วใช้ AI วิเคราะห์ออกมาเป็นขอบเขตงาน (SOW) พร้อมประมาณการเวลาแยกรายโมดูล',
    stepsTitle: 'ขั้นตอนการใช้งาน',
    steps: [
      { num: 1, title: 'อัปโหลดไฟล์เสียง', desc: 'ลากไฟล์ .mp3 / .wav / .m4a มาวาง หรือคลิกเพื่อเลือกไฟล์ สามารถกดเล่นฟังก่อนได้จากเครื่องเล่นที่ปรากฏ' },
      { num: 2, title: 'ถอดเสียง', desc: 'กดปุ่ม "ถอดเสียง" ระบบจะแปลงไฟล์เสียงเป็นข้อความด้วย AI (Whisper)' },
      { num: 3, title: 'ตรวจสอบและแก้ไขข้อความ', desc: 'AI ถอดเสียงอาจมีคำผิดบ้าง สามารถแก้ไขข้อความให้ถูกต้องก่อนส่งวิเคราะห์ได้' },
      { num: 4, title: 'วิเคราะห์ด้วย AI', desc: 'กดปุ่ม "วิเคราะห์ด้วย AI" จะเห็นผลลัพธ์ค่อยๆ ปรากฏแบบ real-time' },
      { num: 5, title: 'ดูผลและส่งออก', desc: 'ดู SOW, ช่วง Manday, ตารางโมดูล และสมมติฐาน จากนั้นคัดลอกหรือดาวน์โหลดเป็นไฟล์ได้' },
    ] as Step[],
    featuresTitle: 'ฟีเจอร์ทั้งหมด',
    features: [
      { title: 'ถอดเสียงเป็นข้อความ (STT)', desc: 'แปลงไฟล์เสียงเป็นข้อความด้วย Groq Whisper', why: 'ประหยัดเวลา PM ที่ต้องนั่งฟังและจดเองทีละนาที' },
      { title: 'แก้ไข Transcript ได้', desc: 'แก้ไขข้อความที่ถอดได้ก่อนส่งให้ AI', why: 'STT ไม่แม่น 100% การแก้ก่อนช่วยให้ผลวิเคราะห์ถูกต้องขึ้น' },
      { title: 'วิเคราะห์แบบ Streaming', desc: 'เห็นผล AI ค่อยๆ พิมพ์ออกมาแบบ real-time', why: 'ไม่ต้องรอหน้าจอค้าง รู้ว่าระบบกำลังทำงานอยู่' },
      { title: 'คะแนนความน่าเชื่อถือ', desc: 'แสดง % ความเชื่อมั่นของการประเมิน', why: 'ช่วยให้รู้ว่าควรเชื่อผลแค่ไหน หรือต้องถามลูกค้าเพิ่ม' },
      { title: 'ประวัติการประเมิน', desc: 'เก็บทุกการประเมินไว้ ค้นหาและแบ่งหน้าได้', why: 'ย้อนดูงานเก่า เปรียบเทียบ หรือนำมาใช้ใหม่ได้' },
      { title: 'วิเคราะห์ซ้ำ', desc: 'ดึง transcript เก่ามาแก้แล้ววิเคราะห์ใหม่', why: 'ปรับ requirement แล้วประเมินใหม่โดยไม่ต้องอัดเสียงซ้ำ' },
      { title: 'ส่งออกหลายรูปแบบ', desc: 'คัดลอก/ดาวน์โหลดเป็น JSON, Markdown, CSV หรือ PDF', why: 'นำผลไปใช้ต่อในเอกสาร ใบเสนอราคา หรือส่งทีมได้ทันที' },
      { title: 'โหมดมืด/สว่าง + ไทย/อังกฤษ', desc: 'สลับธีมและภาษาได้ทันที', why: 'ใช้งานสบายตาทุกสภาพแสง รองรับทีมต่างชาติ' },
    ] as Feature[],
    contactTitle: 'ติดต่อผู้พัฒนา',
    contactDesc: 'มีคำถาม ข้อเสนอแนะ หรือพบปัญหาการใช้งาน? ติดต่อเราได้ผ่าน LINE Official Account',
    lineButton: 'เพิ่มเพื่อนทาง LINE',
    lineNote: 'หรือค้นหา LINE ID:',
    backHome: 'เริ่มใช้งาน',
  },
  en: {
    title: 'How to Use',
    subtitle: 'Complete guide to AI Manday Estimator',
    introTitle: 'What is this app?',
    intro: 'AI Manday Estimator automatically estimates project mandays from audio requirement recordings. Simply upload an audio file of a client describing their needs — the system transcribes it to text, then uses AI to extract a Scope of Work (SOW) with per-module time estimates.',
    stepsTitle: 'How it works',
    steps: [
      { num: 1, title: 'Upload audio', desc: 'Drag & drop a .mp3 / .wav / .m4a file or click to browse. Preview it with the built-in player before processing.' },
      { num: 2, title: 'Transcribe', desc: 'Click "Transcribe Audio" — the system converts speech to text using AI (Whisper).' },
      { num: 3, title: 'Review & edit', desc: 'STT may have minor errors. Edit the transcript before sending for analysis.' },
      { num: 4, title: 'Analyze with AI', desc: 'Click "Analyze with AI" and watch results stream in real-time.' },
      { num: 5, title: 'View & export', desc: 'Review the SOW, manday range, modules table, and assumptions — then copy or download as a file.' },
    ] as Step[],
    featuresTitle: 'All Features',
    features: [
      { title: 'Speech-to-Text', desc: 'Convert audio to text via Groq Whisper', why: 'Saves PMs from listening and note-taking minute by minute' },
      { title: 'Editable Transcript', desc: 'Fix the transcript before AI analysis', why: 'STT is not 100% accurate; editing improves analysis quality' },
      { title: 'Streaming Analysis', desc: 'Watch AI output appear in real-time', why: 'No frozen screen — you know the system is working' },
      { title: 'Reliability Score', desc: 'Shows a confidence % for each estimate', why: 'Know how much to trust the result or when to ask the client' },
      { title: 'Estimation History', desc: 'Stores every estimate with search & pagination', why: 'Revisit, compare, or reuse past work' },
      { title: 'Re-analyze', desc: 'Reload a past transcript, edit, and re-run', why: 'Adjust requirements and re-estimate without re-recording' },
      { title: 'Multi-format Export', desc: 'Copy/download as JSON, Markdown, CSV, or PDF', why: 'Drop results into docs, quotes, or share with the team instantly' },
      { title: 'Dark mode + TH/EN', desc: 'Switch theme and language instantly', why: 'Comfortable in any lighting, works for international teams' },
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

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{c.title}</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-slate-400">{c.subtitle}</p>
        </div>

        {/* Intro */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 mb-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">{c.introTitle}</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{c.intro}</p>
        </section>

        {/* Steps */}
        <section className="mb-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 px-1">{c.stepsTitle}</h2>
          <div className="space-y-3">
            {c.steps.map(step => (
              <div key={step.num} className="flex items-start gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-4 sm:p-5 shadow-sm">
                <span className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {step.num}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{step.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mb-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 px-1">{c.featuresTitle}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {c.features.map((f, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                <p className="mt-2 text-xs text-blue-600 dark:text-blue-400 leading-relaxed flex items-start gap-1.5">
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
        <section className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* LINE icon */}
            <div className="flex-shrink-0 w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.072 9.436-6.971C23.176 14.393 24 12.458 24 10.314" />
              </svg>
            </div>

            {/* Text + button */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-lg font-bold">{c.contactTitle}</h2>
              <p className="mt-1 text-sm text-green-50 leading-relaxed">{c.contactDesc}</p>
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={LINE_OA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-green-600 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-green-50 active:bg-green-100 w-full sm:w-auto justify-center"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.072 9.436-6.971C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                  {c.lineButton}
                </a>
                <span className="text-sm text-green-50">
                  {c.lineNote} <span className="font-semibold text-white">{LINE_OA_ID}</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {c.backHome}
          </Link>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-slate-800 py-4 text-center">
        <p className="text-xs text-gray-400 dark:text-slate-600">
          Powered by Groq Whisper &amp; Llama 3.3 · Stored in MongoDB
        </p>
      </footer>
    </div>
  );
}

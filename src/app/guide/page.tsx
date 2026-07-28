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

// เลือกไอคอนตาม index จากอาเรย์ FEATURE_ICONS ด้านบน (map 1:1 กับลำดับ features ใน content[lang].features)
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
    subtitle: 'รวมขั้นตอนใช้งานและความสามารถหลักไว้ในหน้านี้',
    introTitle: 'AI Manday Estimator ใช้ทำอะไร?',
    intro: 'เครื่องมือนี้ช่วยเปลี่ยนไฟล์เสียงหรือข้อความ Requirement ให้เป็นขอบเขตงาน (SOW) พร้อมประมาณการ Manday แยกตามโมดูล หากเริ่มจากไฟล์เสียง ระบบจะถอดเสียงให้ก่อน และคุณสามารถตรวจแก้ข้อความได้ทุกครั้งก่อนนำไปวิเคราะห์',
    stepsTitle: 'ขั้นตอนการใช้งาน',
    stepsSubtitle: 'เริ่มจากข้อมูลที่มี ตรวจให้เรียบร้อย แล้วค่อยนำผลไปใช้งานต่อ',
    steps: [
      { num: 1, title: 'ใส่ไฟล์เสียงหรือข้อความ', desc: 'ลากไฟล์ .mp3, .wav หรือ .m4a มาวาง หากไม่มีไฟล์เสียงให้เลือก “พิมพ์ข้อความ” แล้วใส่รายละเอียดงานแทน' },
      { num: 2, title: 'รอระบบถอดเสียง', desc: 'เมื่อเลือกไฟล์แล้ว ระบบจะเริ่มถอดเสียงให้ทันที ไม่ต้องกดปุ่มเพิ่ม' },
      { num: 3, title: 'ตรวจและแก้ข้อความ', desc: 'เปิดฟังเสียงเทียบกับข้อความ แล้วแก้ชื่อระบบ คำเฉพาะ หรือรายละเอียดที่ถอดมาไม่ตรง' },
      { num: 4, title: 'เริ่มวิเคราะห์', desc: 'กด “วิเคราะห์ด้วย AI” แล้วรอสักครู่ ระบบจะแสดงผลที่กำลังสร้างบนหน้าจอ' },
      { num: 5, title: 'ตรวจผลและส่งออก', desc: 'เช็ก SOW ช่วง Manday รายละเอียดแต่ละโมดูล และสมมติฐาน ก่อนคัดลอกหรือดาวน์โหลดไฟล์' },
    ] as Step[],
    featuresTitle: 'สิ่งที่ระบบช่วยได้',
    featuresSubtitle: 'ฟังก์ชันสำหรับตรวจงาน เก็บประวัติ และนำผลไปใช้ต่อ',
    features: [
      { title: 'ถอดเสียงเป็นข้อความ', desc: 'รองรับไฟล์เสียง .mp3, .wav และ .m4a โดยใช้ Groq Whisper ช่วยถอดเสียง', why: 'ไม่ต้องนั่งฟังและพิมพ์ใหม่ทั้งหมด' },
      { title: 'เปิดฟังเสียงในหน้าเดิม', desc: 'เล่น หยุด หรือเลื่อนไปยังช่วงที่ต้องการได้จากหน้าตรวจข้อความและหน้าประวัติ', why: 'เทียบเสียงกับข้อความได้โดยไม่ต้องสลับโปรแกรม' },
      { title: 'แก้ข้อความก่อนประเมิน', desc: 'แก้คำที่ถอดผิดหรือเติมรายละเอียดที่ตกหล่นได้ก่อนเริ่มวิเคราะห์', why: 'ข้อความที่ชัดขึ้นช่วยให้ผลประเมินใช้งานได้มากขึ้น' },
      { title: 'เห็นผลระหว่างวิเคราะห์', desc: 'ผลลัพธ์จะแสดงขึ้นมาระหว่างที่ระบบกำลังทำงาน', why: 'มองเห็นความคืบหน้าได้โดยไม่ต้องเดาว่าหน้าจอค้างหรือไม่' },
      { title: 'คะแนนความน่าเชื่อถือ', desc: 'มีคะแนนประกอบจากสมมติฐาน ช่วง Manday และรายละเอียดของแต่ละโมดูล', why: 'ช่วยบอกว่าส่วนไหนควรกลับไปถามข้อมูลเพิ่ม' },
      { title: 'เก็บประวัติการประเมิน', desc: 'ค้นหาและเปิดดูผลเก่า พร้อมข้อความที่ใช้ประเมินได้', why: 'หยิบงานเดิมกลับมาเทียบหรือทำต่อได้ง่าย' },
      { title: 'นำงานเก่ามาประเมินใหม่', desc: 'เปิดข้อความจากประวัติ แก้ไข แล้วสั่งวิเคราะห์อีกครั้งได้', why: 'ไม่ต้องเริ่มใหม่เมื่อ Requirement เปลี่ยนเพียงบางส่วน' },
      { title: 'ส่งออกได้หลายรูปแบบ', desc: 'คัดลอกหรือดาวน์โหลดเป็น JSON, Markdown, CSV และสั่งพิมพ์เป็น PDF ได้', why: 'นำไปใส่เอกสาร ทำใบเสนอราคา หรือส่งให้ทีมต่อได้' },
      { title: 'จำธีมและภาษาที่เลือก', desc: 'สลับโหมดสว่างหรือมืด และเลือกใช้ภาษาไทยหรืออังกฤษได้', why: 'เมื่อกลับมาใช้อีกครั้ง ระบบจะใช้ค่าที่เลือกไว้เดิม' },
    ] as Feature[],
    contactTitle: 'ติดต่อผู้พัฒนา',
    contactDesc: 'หากมีคำถาม ข้อเสนอแนะ หรือพบปัญหา ทักมาทาง LINE Official Account ได้เลย',
    lineButton: 'เพิ่มเพื่อนทาง LINE',
    lineNote: 'หรือค้นหา LINE ID:',
    backHome: 'เริ่มใช้งาน',
  },
  en: {
    badge: 'User Guide',
    title: 'How to Use',
    subtitle: 'A quick guide to the main workflow and features',
    introTitle: 'What does AI Manday Estimator do?',
    intro: 'This tool turns an audio recording or written requirement into a Scope of Work (SOW) with a manday range for each module. When you start with audio, you can review and correct the transcript before it is analyzed.',
    stepsTitle: 'How it works',
    stepsSubtitle: 'Start with what you have, review it, then prepare the result for your team',
    steps: [
      { num: 1, title: 'Add audio or text', desc: 'Drop in a .mp3, .wav, or .m4a file. If you do not have audio, choose “Type Text” and enter the requirement instead.' },
      { num: 2, title: 'Wait for the transcript', desc: 'Transcription starts as soon as you select a file, with no extra button to press.' },
      { num: 3, title: 'Review and edit', desc: 'Compare the transcript with the recording and correct any names, technical terms, or missing details.' },
      { num: 4, title: 'Run the analysis', desc: 'Click “Analyze with AI.” The result will appear on screen as it is prepared.' },
      { num: 5, title: 'Check and export', desc: 'Review the SOW, manday range, modules, and assumptions before copying or downloading the result.' },
    ] as Step[],
    featuresTitle: 'What the tool can help with',
    featuresSubtitle: 'Review the source, keep a history, and hand the result to your team',
    features: [
      { title: 'Audio transcription', desc: 'Transcribe .mp3, .wav, and .m4a files with Groq Whisper', why: 'Avoid typing the whole conversation from scratch' },
      { title: 'Audio playback', desc: 'Play, pause, and seek from the transcript review and history pages', why: 'Compare the recording with the text without switching apps' },
      { title: 'Transcript editing', desc: 'Correct transcription errors or add missing details before analysis', why: 'Clearer input gives you a more useful estimate' },
      { title: 'Live progress', desc: 'See the output appear while the system is working', why: 'You can tell that the analysis is still running' },
      { title: 'Reliability score', desc: 'A score based on assumptions, the manday range, and module detail', why: 'Use it to spot areas that need more information' },
      { title: 'Estimation history', desc: 'Search and reopen saved estimates with the text used to create them', why: 'Return to earlier work without starting over' },
      { title: 'Re-analysis', desc: 'Open a saved transcript, edit it, and run the analysis again', why: 'Useful when only part of the requirement has changed' },
      { title: 'Multiple export formats', desc: 'Copy or download JSON, Markdown, and CSV, or print to PDF', why: 'Move the result into a document, quote, or team handoff' },
      { title: 'Saved theme and language', desc: 'Switch between light and dark themes, and between Thai and English', why: 'Your selected settings are ready the next time you return' },
    ] as Feature[],
    contactTitle: 'Contact the Developer',
    contactDesc: 'If you have a question, suggestion, or problem, send us a message on LINE.',
    lineButton: 'Add on LINE',
    lineNote: 'Or search LINE ID:',
    backHome: 'Get Started',
  },
};

// หน้าคู่มือการใช้งาน (/guide) — เนื้อหาทั้งหมดมาจาก object content[lang] ด้านบน ไม่มี logic ซับซ้อน
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

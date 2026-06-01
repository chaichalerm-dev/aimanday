# CLAUDE.md

คำแนะนำสำหรับ Claude Code ในการทำงานกับโปรเจกต์นี้

## ภาพรวมโปรเจกต์

**AI Manday Estimator** — ระบบ full-stack ที่รับไฟล์เสียง Requirement → ถอดเสียง (STT) → วิเคราะห์ด้วย LLM → ออกมาเป็น Scope of Work (SOW) + ประมาณการ Manday แยกรายโมดูล

โปรเจกต์นี้เป็น **technical assessment** สำหรับตำแหน่ง Full Stack Developer (โจทย์อยู่ในไฟล์ PDF ที่ถูก gitignore)

## Tech Stack

- **Next.js 14** (App Router) + **TypeScript** (strict mode)
- **Tailwind CSS** + **Sarabun font** (รองรับ Thai + Latin)
- **Prisma 5** + **MongoDB Atlas**
- **Groq SDK** — ใช้ทั้ง Whisper STT (`whisper-large-v3`) และ LLM (`llama-3.3-70b-versatile`)
- ไม่ใช้ Anthropic/OpenAI — ใช้ Groq อย่างเดียวเพราะ **ฟรี** (ผู้ใช้ไม่ต้องการเสียเงิน)

## คำสั่งที่ใช้บ่อย

```bash
npm run dev              # รัน dev server (localhost:3000)
npm run build            # production build
npm run prisma:generate  # generate Prisma client (ใช้ dotenv -e .env.local)
npm run prisma:push      # push schema ไป MongoDB (ใช้ dotenv -e .env.local)
npx tsc --noEmit         # ตรวจ TypeScript (เช็คทุกครั้งหลังแก้โค้ด — โปรเจกต์นี้ไม่มี error เลย รักษาไว้)
```

**สำคัญ:** Prisma CLI อ่านแค่ `.env` ปกติ แต่โปรเจกต์นี้เก็บ secrets ใน `.env.local` ทั้งหมด จึงใช้ `dotenv-cli` (`dotenv -e .env.local -- prisma ...`) ใน npm scripts — Prisma 5.22 ยังไม่รองรับ `--env-file` flag

## Environment Variables (`.env.local`)

```env
GROQ_API_KEY="gsk_..."        # ใช้ทั้ง STT และ LLM
DATABASE_URL="mongodb+srv://...mongodb.net/aimanday?appName=Cluster0"
```

**หมายเหตุ:** DATABASE_URL ต้องมี `/aimanday` (ชื่อ database) ก่อน `?` ไม่งั้น Prisma error P1013

## สภาพแวดล้อม

- **Windows + PowerShell** — ใช้ syntax `$env:VAR`, `;` แทน `&&`
- working directory: `C:\xampp\htdocs\myproject\aimanday`
- ยังไม่ได้ init git / ยังไม่ได้ push ขึ้น GitHub (Deliverable ที่เหลือ)

## โครงสร้างโปรเจกต์

```
src/
├── app/
│   ├── page.tsx                   # หน้าหลัก: upload → transcribe → edit → analyze (stream) → result
│   ├── layout.tsx                 # providers (Theme/Lang/Toast) + BottomNav + spacer + inline theme script
│   ├── globals.css                # Tailwind + print CSS + dark transitions
│   ├── guide/page.tsx             # หน้าวิธีใช้งาน + ติดต่อผ่าน LINE OA
│   ├── history/
│   │   ├── page.tsx               # ประวัติ: search + pagination (5/หน้า) + expand inline + export ต่อ item
│   │   └── [id]/page.tsx          # หน้า detail เต็มต่อ item (reuse ResultCard)
│   └── api/
│       ├── upload/route.ts        # STT + rate limit + file size validate
│       ├── analyze/route.ts       # LLM streaming + DB save + rate limit
│       └── history/
│           ├── route.ts           # GET list (latest 200, force-dynamic)
│           └── [id]/route.ts      # GET single + DELETE (force-dynamic)
├── components/
│   ├── Header.tsx                 # fixed header + spacer, nav (ซ่อนบน mobile), TH/EN + theme toggle, logo→home
│   ├── BottomNav.tsx              # bottom tab bar เฉพาะ mobile/tablet (md:hidden): หน้าหลัก/ประวัติ/วิธีใช้
│   ├── UploadZone.tsx             # drag & drop
│   ├── AudioPreview.tsx           # custom audio player + waveform
│   ├── ResultCard.tsx             # SOW/Manday/Modules/Assumptions + ExportMenu + ReliabilityBadge (mobile=cards, desktop=table)
│   ├── ExportMenu.tsx             # dropdown รวม Copy/Download/Print — ใช้ React Portal กัน overflow clip
│   └── Bilingual.tsx              # แสดงข้อความ 2 ภาษา (หลัก + รองตัวเล็ก)
├── contexts/
│   ├── ThemeContext.tsx           # dark/light (อ่าน initial จาก DOM class ที่ inline script ตั้งไว้)
│   ├── LanguageContext.tsx        # TH/EN
│   └── ToastContext.tsx           # toast + container อยู่ในตัว provider
└── lib/
    ├── prisma.ts                  # singleton
    ├── whisper.ts                 # Groq Whisper helper
    ├── analyzer.ts                # SYSTEM_PROMPT, buildUserPrompt, tryParseJSON (exported), types
    ├── reliability.ts             # คำนวณ confidence score
    ├── rateLimit.ts               # in-memory sliding window
    ├── bilingual.ts               # pickText/plainText — เลือกภาษาหลัก/รอง
    ├── download.ts                # downloadJson/Markdown/Csv + safeBaseName (UTF-8 BOM)
    └── i18n.ts                    # Translations interface + th/en objects
prisma/schema.prisma               # model Estimation
```

## รูปแบบสถาปัตยกรรมที่สำคัญ

### Flow การทำงาน (2 ขั้น แยกกัน)
1. `/api/upload` — รับไฟล์เสียง → คืน transcript (ไม่บันทึก DB)
2. ผู้ใช้แก้ transcript ได้ (Editable Transcript)
3. `/api/analyze` — รับ transcript → **stream** LLM response → parse JSON → บันทึก DB

### Streaming
- `/api/analyze` คืนค่าเป็น `ReadableStream` (text/plain) ไม่ใช่ JSON
- frontend อ่านด้วย `response.body.getReader()` แสดง terminal live
- ถ้า error กลางทาง stream ส่ง `__STREAM_ERROR__` sentinel
- บันทึก DB เกิด server-side หลัง stream จบ
- `parseEstimation()` มีซ้ำใน `page.tsx` (client-safe) เพราะ import จาก analyzer.ts ไม่ได้ (มี server deps)

### Bilingual (เนื้อหาจากเสียง 2 ภาษา)
- LLM ถูกสั่งให้ส่งทุก text field เป็น `{ th, en }` (มีตัวอย่างใน prompt ให้ชัด)
- type คือ `MaybeBilingual = string | {th?,en?}` — **รองรับ record เก่าที่เป็น string ภาษาเดียว**
- `pickText(value, lang)` คืน `{primary, secondary}` — secondary คืออีกภาษา (ซ่อนถ้าเหมือน primary)
- ใช้ `<Bilingual>` ใน UI, `plainText()` ใน export (CSV/MD ใช้ภาษาหลักภาษาเดียว, PDF แสดง secondary ตัวเล็ก)
- DB field เป็น `Json` อยู่แล้ว → เก็บ object ได้โดยไม่ต้อง migrate (ใส่ `as any` ตอน prisma create)

### JSON Parsing (analyzer.ts)
- strip markdown fences → `JSON.parse` → validate ว่าเป็น array + manday เป็น number (lenient ไม่บังคับ th/en)
- retry 1 ครั้งถ้า parse ล้มเหลว (non-streaming path)

### i18n
- ทุก label เพิ่มใน `Translations` interface + ทั้ง `th` และ `en` object ใน `lib/i18n.ts`
- ใช้ผ่าน `useLang()` → `t.keyName`
- string ที่มี placeholder ใช้ `.replace('{key}', value)` (เช่น `showingOf`)
- หน้า guide เก็บเนื้อหายาวเป็น object `content[lang]` ในไฟล์เอง (ไม่ยัดลง i18n)
- **ระวัง hardcoded English** — เคยพลาดคำว่า "assumptions" ใน badge ลืมใช้ `t.assumptionsShort`

### Theme (ป้องกัน flash)
- inline script ใน `<head>` ตั้ง `dark` class ก่อน first paint
- `ThemeContext` อ่าน initial state จาก DOM class (ไม่ใช่ localStorage โดยตรง)
- **darkMode: 'class'** ใน tailwind.config.ts — ต้อง restart dev server หลังแก้ config นี้

### Responsive / Mobile
- **Header**: `fixed top-0` + spacer `h-14` (เลื่อนตามจอ); nav links ซ่อนบน mobile (`hidden md:flex`)
- **BottomNav**: แสดงเฉพาะ mobile/tablet (`md:hidden`) + `fixed bottom-0` + `env(safe-area-inset-bottom)`
- body มี `pb-16 md:pb-0` กันเนื้อหาโดน BottomNav บัง
- **ตาราง Modules**: mobile = card layout (`sm:hidden`), desktop/print = table (`hidden sm:block`)

### ExportMenu (dropdown)
- ใช้ **React Portal** (`createPortal` ไป document.body) + `position: fixed` คำนวณพิกัดจาก `getBoundingClientRect()`
- เหตุผล: card แม่มี `overflow-hidden` (มุมโค้ง) จะ clip dropdown ถ้าใช้ absolute
- auto flip ขึ้นบนถ้าใกล้ขอบล่าง, clamp viewport, ติดตาม scroll/resize, ปิดเมื่อคลิกนอก/Esc
- รับ callback handlers (onCopyMarkdown ฯลฯ) → reuse ได้ทั้ง ResultCard + History

### Print/PDF
- หน้าหลัก/detail: `window.print()` + CSS `@media print` + class `print-card`/`print-banner`/`print-assumptions` + force light mode
- หน้า history list: `window.open()` สร้าง standalone HTML แล้ว auto-print (ไม่กระทบหน้าหลัก) — รวม bilingual ตัวเล็กด้วย

### History detail page
- `/history/[id]` map record → `EstimationResult` แล้ว reuse `<ResultCard>` เต็มตัว (ได้ export/print/bilingual ฟรี)
- ชื่อไฟล์ในหน้า list เป็น `<Link>` ไป detail

### Rate Limiting
- `lib/rateLimit.ts` in-memory sliding window 10 req/min/IP ต่อ endpoint (upload + analyze)
- **หมายเหตุ:** reset ทุก cold start บน serverless (Vercel) — production จริงควรใช้ Redis

## แนวทางการแก้โค้ด

1. **ตรวจ TypeScript เสมอ** หลังแก้: `npx tsc --noEmit`
2. **เพิ่ม UI string ใหม่** ต้องอัปเดต i18n ครบทั้ง 2 ภาษา + ระวัง hardcoded English
3. **iteration patterns** — เลี่ยง `for...of` บน Map/Set, ใช้ `Array.from(...).forEach()` แทน (target ES บางจุด)
4. **dark mode** — ทุก element ที่มีสีต้องมี `dark:` variant คู่กัน
5. **animation/spinner** — ใส่ `style={{ transition: 'none' }}` เพราะ globals.css มี global transition ที่อาจกวน
6. **เนื้อหาจากเสียง** (sow/modules/assumptions) ต้องใช้ `<Bilingual>` หรือ `plainText()` เสมอ ห้าม render ตรงๆ (เป็น object ได้)
7. ผู้ใช้สื่อสารภาษาไทย — ตอบเป็นภาษาไทย

## สถานะปัจจุบัน

ระบบทำงานครบทุก requirement + bonus features เยอะมาก (streaming, editable transcript, history CRUD + detail page, search/pagination, reliability score, audio preview, toast, dark mode, TH/EN bilingual content, rate limiting, export JSON/MD/CSV/PDF, guide page + LINE OA, responsive + bottom nav)

**สิ่งที่เหลือ:** init git + push ขึ้น GitHub (Deliverable ของโจทย์), deploy Vercel (optional)

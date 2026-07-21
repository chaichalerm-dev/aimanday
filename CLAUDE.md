# CLAUDE.md

คำแนะนำสำหรับ Claude Code ในการทำงานกับโปรเจกต์นี้

## ภาพรวมโปรเจกต์

**AI Manday Estimator** — ระบบ full-stack ที่รับไฟล์เสียง Requirement → ถอดเสียง (STT) → วิเคราะห์ด้วย LLM → ออกมาเป็น Scope of Work (SOW) + ประมาณการ Manday แยกรายโมดูล

โปรเจกต์นี้เป็น **technical assessment** สำหรับตำแหน่ง Full Stack Developer (โจทย์อยู่ในไฟล์ PDF ที่ถูก gitignore)

## Tech Stack

ใช้ **Groq API อย่างเดียว** — `openai/gpt-oss-120b` เป็น OSS model ที่ Groq ให้บริการ (ไม่ได้ใช้ OpenAI API โดยตรง)

## คำสั่งที่ใช้บ่อย

```bash
npx tsc --noEmit         # ตรวจ TypeScript (เช็คทุกครั้งหลังแก้โค้ด — โปรเจกต์นี้ไม่มี error เลย รักษาไว้)
```

**สำคัญ:** Prisma CLI อ่านแค่ `.env` ปกติ แต่โปรเจกต์นี้เก็บ secrets ใน `.env.local` ทั้งหมด จึงใช้ `dotenv-cli` (`dotenv -e .env.local -- prisma ...`) ใน npm scripts — Prisma 5.22 ยังไม่รองรับ `--env-file` flag

## Environment Variables (`.env.local`)

```env
GROQ_API_KEY="gsk_..."        # ใช้ทั้ง STT และ LLM
DATABASE_URL="mongodb+srv://...mongodb.net/aimanday?appName=Cluster0"
NEXTAUTH_SECRET="..."          # random string เซ็น JWT/cookie ของ session (สร้างด้วย openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"   # base URL ของแอป — บน Vercel ตั้งเป็น production URL
```

**หมายเหตุ:** DATABASE_URL ต้องมี `/aimanday` (ชื่อ database) ก่อน `?` ไม่งั้น Prisma error P1013

## รูปแบบสถาปัตยกรรมที่สำคัญ

### Authentication (NextAuth.js v4)
- **Credentials provider เท่านั้น** — ไม่มี OAuth ไม่มี adapter (session ใช้ JWT strategy ล้วน ไม่ผูก DB) → ไม่ต้องมี model Account/Session/VerificationToken ใน schema
- `lib/auth.ts` คือ `authOptions` — `authorize()` เช็ค email (lowercase) + `bcrypt.compare` กับ `User.password` ที่ hash ไว้ตอนสมัคร; `jwt`/`session` callback แปะ `user.id` ลง token แล้วลง `session.user.id`
- `src/types/next-auth.d.ts` — module augmentation เพิ่ม `id` ใน `session.user` (ไม่งั้น TS ไม่รู้จัก field นี้)
- **สมัครสมาชิกเปิดสาธารณะ** — `POST /api/auth/register` hash password ด้วย bcrypt (cost 10) + validate email/password ก่อน create, มี rate limit เหมือน endpoint อื่น
- **บัญชีทดสอบ (seed ไว้ใน MongoDB Atlas แล้ว)**: `demo@example.com` / `Demo12345` — หน้า `/login` มีกล่อง "บัญชีสำหรับทดสอบ" พร้อมปุ่ม autofill ให้ reviewer ลองระบบได้ทันทีโดยไม่ต้องสมัคร ถ้า DB ถูกล้าง/ย้าย ต้อง seed ใหม่ด้วยสคริปต์ inline (ดูประวัติ commit) หรือสมัครผ่าน `/register` แล้วแก้ email เป็นค่านี้
- `src/middleware.ts` **ไม่ได้ใช้ `next-auth/middleware`'s `withAuth` แล้ว** — เขียนเองด้วย `getToken()` (edge-compatible, ไม่พึ่ง `authOptions`/bcrypt/prisma) เพราะ `withAuth` จะข้าม path ที่เป็น `pages.signIn` (`/login`) ไม่รัน middleware ของเราเลย ซึ่งชนกับหน้าที่ที่สองของ middleware คือใส่ CSP nonce ให้ทุกหน้ารวม `/login` ด้วย (ดู "CSP nonce" ด้านล่าง) — เช็ค `isProtectedPage()` เอง (`/history`, `/account`) แล้ว redirect ไป `/login?callbackUrl=...` เองถ้าไม่มี token, พฤติกรรมกับผู้ใช้เหมือนเดิมทุกประการ
- **`/app` (เครื่องมือจริง) เป็น public — ไม่ login ก็ใช้งานได้เต็มรูปแบบ** เพียงแค่ผลลัพธ์จะไม่ถูกบันทึกลง DB (ไม่มี `userId` ให้ผูก) — `/api/upload` และ `/api/analyze` จึงไม่เช็ค session แบบบังคับ (401) อีกต่อไป, `/api/analyze` อ่าน `session?.user?.id` แบบ optional แล้วข้ามขั้น `prisma.estimation.create` ถ้าไม่มี userId
- `app/app/page.tsx` โชว์ banner แจ้งเตือน (`t.guestModeNotice` + ลิงก์ `t.loginNav`) เมื่อ `useSession().status === 'unauthenticated'` ให้รู้ว่าผลลัพธ์จะไม่ถูกเก็บ
- **หน้า public**: landing (`/`), `/app`, `/guide`, `/login`, `/register` — ไม่ต้อง login (`/history`, `/history/[id]`, `/account` ยังบังคับ login ผ่าน middleware)
- **จัดการบัญชี (`/account`)**: แก้ชื่อ/อีเมล ผ่าน `PATCH /api/account`, เปลี่ยนรหัสผ่านผ่าน `PATCH /api/account/password` (ต้องส่ง `currentPassword` มาเช็คก่อนเสมอ) — คลิก avatar/อีเมลใน `Header.tsx` (ทั้ง mobile ไอคอนกลม + desktop เห็นอีเมลเต็ม) เพื่อเข้าหน้านี้
- **sync session หลังแก้โปรไฟล์โดยไม่ต้อง re-login**: `lib/auth.ts` เพิ่ม `trigger === 'update'` ใน `jwt` callback รับค่าจาก `useSession().update({ name, email })` ที่เรียกฝั่ง client หลัง PATCH สำเร็จ — ถ้าลืมเรียก `update()` header จะยังโชว์อีเมล/ชื่อเก่าจนกว่าจะ refresh token รอบถัดไป
- API ที่แตะข้อมูล history (`/api/history*`) ยังคง เช็ค `getServerSession(authOptions)` บังคับ (401 ถ้าไม่มี session) เพราะดูประวัติของใครก็ต้องรู้ว่าใครถาม — defense-in-depth เพราะ middleware ไม่ครอบ `/api/*`
- **ประวัติแยกต่อ user**: `Estimation.userId` (optional relation ไป `User`) — query/delete ทุกจุด filter ด้วย `userId: session.user.id` เสมอ (ห้าม `findUnique`/`delete` ด้วย id อย่างเดียว เพราะจะข้าม user อื่นได้ — ใช้ `findFirst`/`deleteMany` ที่มี `userId` ใน where แทน)
- record ที่มาจาก guest (ไม่ login ตอน analyze) หรือ record เก่าก่อนมี auth จะไม่มี `userId` (เป็น `null`) → มองไม่เห็นในหน้าประวัติของใคร (ข้อมูลกำพร้า ยอมรับได้สำหรับโปรเจกต์นี้)
- `contexts/AuthProvider.tsx` wrap `next-auth/react` `SessionProvider` (ต้องเป็น client component) — ครอบใน `layout.tsx` เป็น provider ชั้นนอกสุด
- `Header.tsx` ใช้ `useSession()` โชว์ avatar+email / ปุ่ม logout (`signOut`) หรือปุ่ม login ตามสถานะ — เช็ค `status === 'loading'` ก่อน กัน UI กระพริบ

### Flow การทำงาน (2 ขั้น แยกกัน, login ได้ไม่บังคับ)
1. `/api/upload` — รับไฟล์เสียง → คืน transcript (ไม่บันทึก DB, ไม่ต้อง login)
2. ผู้ใช้แก้ transcript ได้ (Editable Transcript)
3. `/api/analyze` — รับ transcript → **stream** LLM response → parse JSON → บันทึก DB พร้อม `userId` จาก session **เฉพาะกรณี login อยู่** — guest ได้ผลลัพธ์เหมือนกันแต่ไม่ถูกบันทึก

### Input mode: ไฟล์เสียง vs พิมพ์ข้อความ (`app/app/page.tsx`)
- แท็บสลับ `inputMode: 'audio' | 'text'` บนการ์ดขั้นแรก — โหมดพิมพ์ข้อความข้าม STT ไปตรงสู่หน้าตรวจสอบ (`step: 'transcribed'`) โดยไม่มี `file`
- flag `manualEntry` แยกกรณี "พิมพ์เอง" ออกจากกรณี reanalyze prefill (ทั้งคู่ไม่มี `file` เหมือนกัน) — ใช้ปรับ hint text/ไอคอน/label ปุ่มใน review step ให้ตรงบริบท
- ambient waveform decoration โชว์เฉพาะ `inputMode === 'audio'`

### Auto-transcribe (UX flow ฝั่ง client, เฉพาะโหมดไฟล์เสียง)
- เลือก/วางไฟล์ปุ๊บ `transcribeFile(file)` ยิงทันที — **เรียกจาก event handler เท่านั้น ห้ามย้ายไป `useEffect` on file** (StrictMode จะ double-POST `/api/upload` เปลือง rate limit)
- `transcribeFile` รับไฟล์เป็น parameter (กัน stale closure) + มี `AbortController` ใน ref (abort ตอน reset/เปลี่ยนไฟล์)
- ปุ่มถอดเสียงไม่มีแล้ว — เหลือ status ระหว่างรอ + ปุ่ม Retry (`t.retryTranscribe`) ตอน error
- "ถอดเสียงใหม่": ถ้ามี `file` → ถอดทันที; ไม่มี (มาจาก reanalyze prefill หรือ manualEntry) → กลับ idle (label ปุ่มสลับเป็น `t.editAgain` ถ้าเป็น manualEntry)
- path `reanalyze_prefill` ไม่ auto-transcribe (ไม่มี file)
- step indicator 3 ขั้น (เริ่มต้น → ตรวจข้อความ → ผลลัพธ์) แสดงตลอด, mapping ผ่าน `STEP_ORDER`

### Scroll/focus management (page.tsx)
- `useEffect` on `[step]`: transcribed → scroll ไป transcript card + focus textarea (เฉพาะ `pointer: fine` กัน keyboard เด้งบน mobile); done → scroll ไป result
- target มี `scroll-mt-20` (header fixed h-14 จะบังหัว card) + เช็ค `prefers-reduced-motion` ก่อนเลือก smooth/auto

### Streaming
- `/api/analyze` คืนค่าเป็น `ReadableStream` (text/plain) ไม่ใช่ JSON
- frontend อ่านด้วย `response.body.getReader()` แสดง terminal live
- ถ้า error กลางทาง stream ส่ง `__STREAM_ERROR__` sentinel
- บันทึก DB เกิด server-side หลัง stream จบ
- `parseEstimation()` ใน `page.tsx` เป็น client-side duplicate ของ `tryParseJSON` — แยกไว้เพื่อให้ client component ไม่ต้อง import จาก module ฝั่ง server
- **throttle การ flush ลง state ~10fps** (`lastFlush` timestamp) + final flush หลังจบ loop — setState ทุก chunk ทำให้ทั้งหน้า re-render ต่อ token
- `ResultCard` โหลดผ่าน `next/dynamic` (named export ต้อง `.then(m => ({ default: m.ResultCard }))`) + warm chunk ด้วย `void import(...)` ตอนเริ่ม analyze

### Bilingual (เนื้อหาจากเสียง 2 ภาษา)
- LLM ถูกสั่งให้ส่งทุก text field เป็น `{ th, en }` (มีตัวอย่างใน prompt ให้ชัด)
- type คือ `MaybeBilingual = string | {th?,en?}` — **รองรับ record เก่าที่เป็น string ภาษาเดียว**
- `pickText(value, lang)` คืน `{primary, secondary}` — secondary คืออีกภาษา (ซ่อนถ้าเหมือน primary)
- ใช้ `<Bilingual>` ใน UI, `plainText()` ใน export (CSV/MD ใช้ภาษาหลักภาษาเดียว, PDF แสดง secondary ตัวเล็ก)
- DB field เป็น `Json` อยู่แล้ว → เก็บ object ได้โดยไม่ต้อง migrate (ใส่ `as any` ตอน prisma create)

### JSON Parsing (analyzer.ts)
- strip markdown fences → `JSON.parse` → validate ว่าเป็น array + manday เป็น number (lenient ไม่บังคับ th/en)
- `analyzer.ts` export เฉพาะ types + pure functions (ไม่มี Groq instance) — Groq client อยู่ใน `whisper.ts` และ `analyze/route.ts` เท่านั้น (lazy singleton)

### i18n
- ทุก label เพิ่มใน `Translations` interface + ทั้ง `th` และ `en` object ใน `lib/i18n.ts`
- ใช้ผ่าน `useLang()` → `t.keyName`
- string ที่มี placeholder ใช้ `.replace('{key}', value)` (เช่น `showingOf`)
- หน้า guide เก็บเนื้อหายาวเป็น object `content[lang]` ในไฟล์เอง (ไม่ยัดลง i18n)
- **ระวัง hardcoded English** — tooltip ใน ReliabilityBadge เคยพลาด ตอนนี้ใช้ `t.reliabilityAssumptions` / `t.reliabilityRangeSpread` / `t.reliabilityDetailBonus` / `t.reliabilityScore` แล้ว
- ภาษาที่เลือก persist ลง `localStorage` key `"lang"` — `LanguageContext` อ่าน initial state จาก localStorage (คล้าย Theme)

### Theme (ป้องกัน flash)
- inline script ใน `<head>` ตั้ง `dark` class ก่อน first paint
- `ThemeContext` อ่าน initial state จาก DOM class (ไม่ใช่ localStorage โดยตรง)
- **darkMode: 'class'** ใน tailwind.config.ts — ต้อง restart dev server หลังแก้ config นี้
- **Dark palette ใช้ `zinc`** (ไม่ใช่ `slate`) — zinc เป็น neutral warm gray ไม่มี blue tint ดูสบายตากว่า:
  - Page body: `zinc-900` (#18181B)
  - Cards/panels: `zinc-800` (#27272A)
  - Inputs/secondary: `zinc-700` (#3F3F46)
  - Borders: `zinc-700`
  - Streaming terminal (`bg-slate-950` ไม่มี dark: prefix) ยังคงดำสนิทตามต้องการ
- **ระวังสีที่ตั้งใจไว้สำหรับ dark mode แต่ไม่มี `dark:` prefix เลย** — `ReliabilityBadge` (`ResultCard.tsx`) เคยพลาดแบบนี้: ใช้ `text-yellow-200`/`bg-yellow-400/20` (โทนอ่อนสำหรับพื้นมืด) เป็นค่าเริ่มต้นตรงๆ ไม่มี `dark:` เลย ทำให้โหมดสว่างตัวหนังสือกลืนกับพื้นหลัง ตอนนี้แก้แล้ว (`bg-green/yellow/red-100` + `text-*-700` เป็นค่าเริ่มต้นโหมดสว่าง, `dark:` ค่อยเป็นโทนอ่อนแบบเดิม) — pattern เดียวกับที่ `history/page.tsx`'s `RELIABILITY_CFG` ทำถูกอยู่แล้วตั้งแต่แรก ใช้เป็น reference ได้เวลาเพิ่ม badge สีใหม่

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
- หน้า history list: `window.open()` สร้าง standalone HTML แล้ว auto-print — HTML template อยู่ใน `lib/print.ts` (`buildPrintHTML`) รวม bilingual ตัวเล็กด้วย
- **`buildPrintHTML` escape ทุกค่าที่มาจาก transcript/LLM ก่อนแทรกลง HTML string เสมอ** (`escapeHtml()` ในไฟล์เดียวกัน — คลุม `audioName` และทุก field ที่ผ่าน `renderBilingual`) เพราะ HTML นี้ถูก `document.write()` ตรงเข้าหน้าต่างใหม่แบบ same-origin ถ้าไม่ escape จะเป็นช่องโหว่ stored XSS (attacker เรียก `/api/analyze` ตรงๆ ใส่ `<script>` ใน `audioName` หรือ prompt-inject ผ่าน transcript ให้ LLM สะท้อน HTML กลับมาก็ได้)
- **ห้ามใส่ `<script>` ไว้ใน HTML ที่ `buildPrintHTML` คืนมา** — เดิมมี `<script>window.print()</script>` ฝังอยู่ท้ายไฟล์ แต่ CSP nonce-based (ดูด้านล่าง) บล็อก inline script ที่ไม่มี nonce ทุกตัว และ popup ที่เปิดด้วย `document.write` ไม่มีทางรับ nonce ของหน้าแม่ได้ → ย้าย logic สั่งพิมพ์ไปไว้ฝั่ง caller แทน: `win.onload = () => win.print()` (ดูใน `history/page.tsx` และ `history/[id]/page.tsx`)

### Shared types
- `src/types/history.ts` export `HistoryItem` interface — ใช้ร่วมกันระหว่าง `history/page.tsx` และ `history/[id]/page.tsx` ป้องกัน drift

### History detail page
- `/history/[id]` มี page header รวม filename + date + **Re-analyze** + **ExportMenu** ไว้ด้วยกัน
- ใช้ `<ResultCard hideToolbar>` เพื่อซ่อน toolbar ใน ResultCard (ป้องกัน duplicate) — prop `hideToolbar?: boolean` ใน ResultCard
- Export handlers ใน detail page ใช้ `buildItemJson/Markdown/Csv` จาก `lib/historyExport.ts`
- Print ใน detail page ใช้ `buildPrintHTML` (standalone window) ไม่ใช่ `window.print()` (CSS-based)
- ชื่อไฟล์ในหน้า list เป็น `<Link>` ไป detail

### Rate Limiting
- `lib/rateLimit.ts` in-memory sliding window 10 req/min/IP ต่อ endpoint (upload + analyze + register + account/password)
- **หมายเหตุ:** reset ทุก cold start บน serverless (Vercel) — production จริงควรใช้ Redis
- `getClientIp()` **ห้ามอ่าน `x-forwarded-for` เป็นตัวแรก** — ค่านี้เป็น header ที่ client ใส่เองได้ (spoof ได้ทุก request ทำให้ข้าม rate limit ไปเรื่อยๆ) อ่าน `x-real-ip` (Vercel เขียนทับให้เองที่ edge เชื่อถือได้) ก่อนเสมอ แล้วค่อย fallback ไป `x-vercel-forwarded-for` แล้วค่อย XFF ตัวแรกเป็นทางเลือกสุดท้าย (dev local เท่านั้น)
- `/api/analyze` จำกัดความยาว `transcript` (20,000 ตัวอักษร) และ `audioName` (255 ตัวอักษร) ด้วย เพราะเรียก API ตรงๆ ได้โดยไม่ผ่าน UI — payload ใหญ่เกินจำเป็นจะกิน token LLM/พื้นที่ DB โดยเปล่าประโยชน์

### Security hardening (ดูรายละเอียดใน commit "fix: harden security across auth, XSS, CSP, and rate limiting")
- **CSP เป็น nonce-based** — สร้างใน `src/middleware.ts` ใหม่ทุก request (`crypto.randomUUID()`) แล้วแปะเป็น request header `x-nonce` + response header `Content-Security-Policy` (`script-src 'self' 'nonce-xxx' 'strict-dynamic'`) **ไม่มี `unsafe-inline` แล้ว** — `next.config.mjs` เก็บแค่ security headers อื่นที่ไม่ต้องเปลี่ยนต่อ request (X-Frame-Options, HSTS, ฯลฯ)
- `layout.tsx` อ่าน nonce ด้วย `headers().get('x-nonce')` แปะเข้า inline theme script (`nonce={nonce}`) — **ผลข้างเคียงที่ตั้งใจ:** การเรียก `headers()` ใน root layout ทำให้ทุกหน้าออกจาก static rendering กลายเป็น dynamic ทั้งหมด (จำเป็น เพราะ nonce ต้องสดใหม่ทุก request) ไม่ใช่บั๊ก
- React จะ warn `Prop 'nonce' did not match` ใน dev console เสมอเมื่อใช้ nonce-based CSP — เป็น known quirk (React ตั้งใจไม่ใส่ค่า nonce ลงใน SSR diff กันถูก scrape จาก view-source แต่ HTML จริงที่ส่งไปมีค่าถูกต้อง) ไม่ใช่บั๊ก มี `suppressHydrationWarning` ปิดไว้แล้วที่ script tag นั้น
- CSV export (`lib/historyExport.ts` → `csvSafeCell()`, reuse ใน `ResultCard.tsx`) ป้องกัน **CSV formula injection** — เซลล์ที่ขึ้นต้นด้วย `=`, `+`, `-`, `@` จะถูกเติม `'` นำหน้าก่อนเสมอ (เนื้อหาเซลล์มาจาก transcript ที่ผู้ใช้คุมได้ทั้งหมด ถ้าไม่กันไว้ Excel จะรันเป็นสูตรตอนเปิดไฟล์)
- `/api/analyze` ไม่ echo `error.message` ดิบกลับไปหา client แล้ว (เคย leak รายละเอียด internal error เช่นข้อความจาก Prisma/Groq) — log เต็มด้วย `console.error` ฝั่ง server เท่านั้น ส่ง generic message กลับ

### Idle Waveform Animation
- `page.tsx` มี constants `WAVE_HEIGHTS`, `WAVE_DURATIONS`, `WAVE_DELAYS` (32 bars) นอก component
- animation แสดงเฉพาะ `step === 'idle'` — ซ่อนทันทีที่ user เริ่ม interact
- CSS class `.wave-bar` + `@keyframes waveBar` ใน `globals.css`
- รองรับ `prefers-reduced-motion` ใน globals.css — หยุด animation อัตโนมัติ

## แนวทางการแก้โค้ด

1. **ตรวจ TypeScript เสมอ** หลังแก้: `npx tsc --noEmit`
2. **เพิ่ม UI string ใหม่** ต้องอัปเดต i18n ครบทั้ง 2 ภาษา + ระวัง hardcoded English
3. **iteration patterns** — เลี่ยง `for...of` บน Map/Set, ใช้ `Array.from(...).forEach()` แทน (target ES บางจุด)
4. **dark mode** — ทุก element ที่มีสีต้องมี `dark:` variant คู่กัน
5. **animation/spinner** — ใส่ `style={{ transition: 'none' }}` เพราะ globals.css มี global transition ที่อาจกวน
6. **เนื้อหาจากเสียง** (sow/modules/assumptions) ต้องใช้ `<Bilingual>` หรือ `plainText()` เสมอ ห้าม render ตรงๆ (เป็น object ได้)
7. ผู้ใช้สื่อสารภาษาไทย — ตอบเป็นภาษาไทย

## สถานะปัจจุบัน

ระบบทำงานครบทุก requirement + bonus features เยอะมาก (streaming, editable transcript + audio replay, history CRUD + detail page + audio replay, search/pagination, reliability score, audio preview + remove file, idle waveform animation, toast, warm dark mode (zinc), TH/EN bilingual content + language persist, rate limiting, export JSON/MD/CSV/PDF, guide page + LINE OA, responsive + bottom nav, landing page แยกจากเครื่องมือ, input mode ไฟล์เสียง/พิมพ์ข้อความ, login/register + ประวัติแยกต่อผู้ใช้)

โค้ดผ่าน refactoring แล้ว: shared types, dead code ลบออก, error handling ครบ, i18n ครบทุก label

ผ่าน security hardening pass แล้ว (branch `redesign`): อัปเกรด Next.js ปิด CVE middleware bypass, แก้ stored XSS ในหน้าพิมพ์, กัน CSV formula injection, แก้ rate-limit IP spoofing, จำกัดขนาด payload, CSP เปลี่ยนเป็น nonce-based เลิกใช้ `unsafe-inline` — รายละเอียดดู section "Security hardening" ด้านบน

source code อยู่บน GitHub แล้ว (Deliverable ส่งแล้ว)

**สิ่งที่เหลือ:** deploy Vercel (optional), ตรวจสอบว่าบัญชีทดสอบ `demo@example.com` ยัง login ได้จริงใน DB ปัจจุบัน (เจอ 401 ตอนทดสอบ security pass ล่าสุด — อาจต้อง seed ใหม่)

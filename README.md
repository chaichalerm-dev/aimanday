# AI Manday Estimator

ระบบ AI ที่แปลงไฟล์เสียง (หรือข้อความ) Requirement ให้กลายเป็น Scope of Work + ประมาณการ Manday แบบอัตโนมัติ

---

## ทำไมถึงทำโปรเจกต์นี้

ในการทำงานพัฒนาซอฟต์แวร์ ขั้นตอนที่ใช้เวลาและเสี่ยงต่อความผิดพลาดมากที่สุดขั้นตอนหนึ่งคือการประเมินขอบเขตงานและ Manday หลังจากการประชุม Requirement ทีมมักต้องนั่งถอดเทปเสียง แยกหัวข้อ แล้วค่อย estimate ด้วยมือ ซึ่งกินเวลาและมีโอกาสตกหล่นรายละเอียด

โปรเจกต์นี้จึงสร้างขึ้นเพื่อ **ช่วยให้กระบวนการนั้นเร็วขึ้น** โดยให้ AI ทำหน้าที่ฟัง วิเคราะห์ และสรุปงานออกมาเป็นโครงสร้างที่ใช้งานได้ทันที

---

## โปรเจกต์ทำอะไร

อัปโหลดไฟล์เสียงการประชุม (หรือพิมพ์ requirement เองก็ได้) → ระบบถอดเสียงเป็นข้อความ → แก้ไขข้อความได้ → AI วิเคราะห์และสรุปออกมาเป็น:

- **Scope of Work (SOW)** — รายการสิ่งที่ต้องทำ
- **Manday Range** — ช่วงประมาณการวันทำงาน (min–max)
- **Modules Breakdown** — แยกรายโมดูลพร้อม manday ต่อโมดูล
- **Assumptions** — สมมติฐานที่ใช้ในการประเมิน
- **Reliability Score** — คะแนนความน่าเชื่อถือของการประเมิน 0–100

ผลลัพธ์ทั้งหมดแสดงเป็น **2 ภาษา (ไทย + อังกฤษ)** พร้อม export เป็น JSON / Markdown / CSV / PDF

ใช้งานได้ทั้งแบบ **ไม่ login** (ลองระบบได้ทันที ไม่บันทึกประวัติ) และแบบ **login** (ประวัติทุกรายการถูกเก็บแยกเป็นของตัวเอง ค้นหา/ย้อนดู/วิเคราะห์ซ้ำได้)

---

## วิธีการทำงาน

```
[หน้า Landing (/)] → กด "เริ่มประเมินฟรี" → [เครื่องมือ (/app)] — ไม่ login ก็เข้าได้

เลือกโหมด: [อัปโหลดไฟล์เสียง]  หรือ  [พิมพ์ข้อความเอง]
        ↓ (เฉพาะโหมดไฟล์เสียง)
POST /api/upload  →  Groq Whisper (STT)  →  transcript text
        ↓
[ผู้ใช้ตรวจสอบ / แก้ไข transcript]
        ↓
POST /api/analyze  →  Groq GPT OSS 120B (LLM Streaming)
        ↓
parse JSON  →  แสดงผล real-time  →  บันทึก MongoDB (เฉพาะถ้า login อยู่)
```

**2 ขั้นตอนแยกกัน เพื่อให้ผู้ใช้แก้ไข transcript ก่อนส่ง AI ได้**

ระบบ stream ผลลัพธ์กลับมาทีละ token แสดงผลแบบ terminal live — ไม่ต้องรอจนครบ

---

## Tech Stack

| ส่วน | เทคโนโลยี | เหตุผลที่เลือก |
|---|---|---|
| Frontend | Next.js 14 App Router + TypeScript | Server/Client components, type-safe ตั้งแต่ต้น |
| Styling | Tailwind CSS + Prompt Font | จัดการ responsive ได้เร็ว, รองรับ Thai + Latin, หน้าตาทันสมัยแบบ SaaS |
| Auth | NextAuth.js v4 (Credentials + JWT) | login ด้วย email/password ล้วน ไม่ต้องพึ่ง OAuth provider ภายนอก, session ไม่ผูก DB |
| Database | MongoDB Atlas | เหมาะกับ JSON output ที่โครงสร้างยืดหยุ่น |
| ORM | Prisma 5 | type-safe queries, migrate schema ได้ง่าย |
| STT | Groq Whisper `whisper-large-v3` | เร็ว, แม่นยำ, รองรับภาษาไทย |
| LLM | Groq `openai/gpt-oss-120b` | ฟรี, streaming API, instruction following ดีมาก |

---

## ฟีเจอร์

**หลัก**
- Landing page แนะนำระบบ แยกจากหน้าเครื่องมือจริง
- อัปโหลดไฟล์เสียง `.mp3` / `.wav` / `.m4a` **หรือพิมพ์ Requirement เองโดยตรง** (ไม่มีไฟล์เสียงก็ใช้ได้)
- ถอดเสียงด้วย Groq Whisper (อัตโนมัติทันทีที่เลือกไฟล์)
- วิเคราะห์ด้วย AI → SOW + Manday + Modules + Assumptions
- บันทึก + ดูประวัติ — **แยกเป็นส่วนตัวต่อผู้ใช้แต่ละคน**

**บัญชีผู้ใช้**
- สมัครสมาชิก / เข้าสู่ระบบด้วย email + password (bcrypt hash)
- **ใช้เครื่องมือได้โดยไม่ต้อง login** — แค่ผลลัพธ์จะไม่ถูกบันทึกลงประวัติ (มี banner แจ้งเตือนให้ทราบ)
- หน้า "บัญชีของฉัน" แก้ไขชื่อ/อีเมล และเปลี่ยนรหัสผ่านได้เอง
- ช่องรหัสผ่านมีปุ่มแสดง/ซ่อน + มาตรวัดความปลอดภัยของรหัสผ่าน (อ่อน/ปานกลาง/แข็งแรง)
- มีบัญชีทดสอบพร้อมใช้ในหน้า login (autofill ได้ในคลิกเดียว)

**เพิ่มเติม**
- **Editable Transcript** — แก้ไขข้อความจาก STT ก่อนส่ง AI (เพราะ STT ไม่แม่น 100%)
- **Streaming Terminal** — แสดงผล AI แบบ real-time ทีละ token
- **Bilingual Output** — SOW / Modules / Assumptions แสดงทั้งไทยและอังกฤษพร้อมกัน
- **Reliability Score** — คะแนน 0–100 พร้อม breakdown ว่าหักจากอะไร
- **Audio Preview Player** — เล่นเสียงย้อนกลับได้ทุกขั้นตอน รวมถึงในหน้าประวัติ
- **History Page** — ค้นหา + แบ่งหน้า, เปิดรายละเอียดต่อ item, ลบได้ (ของตัวเองเท่านั้น)
- **Re-analyze** — โหลด transcript เก่ากลับมาวิเคราะห์ใหม่ได้
- **Export Menu** — Copy JSON/Markdown, Download CSV, Print/PDF
- **Dark / Light Mode** — โทน Zinc อบอุ่น, sync system preference, persist localStorage
- **Thai / English UI** — สลับภาษา UI ได้ทุก label, persist localStorage
- **Responsive + Bottom Nav** — ใช้งานบนมือถือได้สบาย มี bottom tab bar
- **Rate Limiting** — 10 req/min ต่อ IP ต่อ endpoint

---

## โครงสร้างโปรเจกต์

```
src/
├── middleware.ts                  # next-auth middleware — บังคับ login เฉพาะ /history และ /account
├── app/
│   ├── page.tsx                   # Landing page (public) — hero/features/how-it-works
│   ├── app/page.tsx               # เครื่องมือจริง (public): เลือกไฟล์เสียง/พิมพ์ข้อความ → transcribe/edit → analyze (stream) → result
│   ├── login/page.tsx             # หน้า login + บัญชีทดสอบ autofill
│   ├── register/page.tsx          # หน้าสมัครสมาชิก
│   ├── account/page.tsx           # จัดการบัญชี: แก้โปรไฟล์ + เปลี่ยนรหัสผ่าน
│   ├── layout.tsx                 # Root layout + providers (Auth/Theme/Lang/Toast) + BottomNav
│   ├── guide/page.tsx             # หน้าวิธีใช้งาน
│   ├── history/
│   │   ├── page.tsx               # รายการประวัติของตัวเอง + search + pagination
│   │   └── [id]/page.tsx          # หน้ารายละเอียดต่อ item
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts   # NextAuth handler
│       │   └── register/route.ts        # สมัครสมาชิก
│       ├── account/
│       │   ├── route.ts                 # GET/PATCH โปรไฟล์
│       │   └── password/route.ts        # PATCH เปลี่ยนรหัสผ่าน
│       ├── upload/route.ts        # STT + rate limit + file validation (public)
│       ├── analyze/route.ts       # LLM streaming + rate limit (public, บันทึก DB เฉพาะถ้า login)
│       └── history/[id]/route.ts  # GET single + DELETE (scope ด้วย userId)
├── components/
│   ├── Header.tsx / BottomNav.tsx / Footer.tsx
│   ├── UploadZone.tsx             # Drag & drop
│   ├── AudioPreview.tsx           # Custom audio player
│   ├── PasswordInput.tsx          # ช่องรหัสผ่าน + ปุ่มลูกตา + strength meter
│   ├── ResultCard.tsx             # แสดงผล SOW/Manday/Modules + export
│   ├── ExportMenu.tsx             # Dropdown ด้วย React Portal
│   └── Bilingual.tsx              # Render ข้อความ 2 ภาษา
├── contexts/                      # Auth / Theme / Language / Toast
├── lib/
│   ├── auth.ts                    # NextAuth authOptions (Credentials provider)
│   ├── passwordStrength.ts        # คำนวณคะแนนความปลอดภัยรหัสผ่าน
│   ├── analyzer.ts                # System prompt + JSON parser
│   ├── whisper.ts                 # Groq Whisper helper
│   ├── reliability.ts             # คำนวณ confidence score
│   ├── rateLimit.ts               # In-memory sliding window
│   ├── bilingual.ts               # pickText / plainText
│   ├── download.ts                # JSON/MD/CSV export
│   └── i18n.ts                    # คำแปล TH/EN ทุก label
└── types/                         # Shared types (HistoryItem, next-auth augmentation)
```

---

## ปัญหาที่เจอ และวิธีแก้

### 1. Prisma CLI อ่าน `.env.local` ไม่ได้
Next.js เก็บ secrets ใน `.env.local` แต่ Prisma CLI อ่านแค่ `.env` ปกติ ทำให้ `prisma push` ไม่เจอ `DATABASE_URL`

**แก้:** ใช้ `dotenv-cli` ครอบ command ใน `package.json`
```json
"prisma:push": "dotenv -e .env.local -- prisma db push"
```

---

### 2. LLM ส่ง JSON กลับมาไม่สม่ำเสมอ
บางครั้ง model ใส่ markdown code fence (` ```json `) ครอบมา บางครั้งส่ง string แทน number ทำให้ parse ล้มเหลว

**แก้:**
- Strip markdown fences ก่อน `JSON.parse` เสมอ
- ใช้ `temperature: 0.1` ลด randomness
- ใส่ JSON schema ไว้ทั้งใน system prompt และ user prompt (reinforcement)
- Shape validation ตรวจ type ทุก field ก่อน return

---

### 3. Streaming + JSON parsing ไม่ตรงกัน
ระบบ stream ข้อความกลับมาทีละ chunk ทำให้ client ได้ข้อความ "ระหว่างทาง" ที่ parse ไม่ได้ แต่ต้องการแสดงผล live ด้วย

**แก้:** แยก 2 ความรับผิดชอบชัดเจน — client แสดงผล raw text ระหว่าง stream, parse JSON เฉพาะตอนที่ stream จบแล้วเท่านั้น Server บันทึก DB หลัง stream สำเร็จ

---

### 4. Dropdown ถูกตัดโดย `overflow-hidden` ของ card
ExportMenu อยู่ใน ResultCard ที่มี `rounded-lg overflow-hidden` ทำให้ dropdown โดน clip หายไป

**แก้:** ใช้ **React Portal** render dropdown ตรงไปที่ `document.body` + คำนวณ position จาก `getBoundingClientRect()` + auto-flip ขึ้นถ้าใกล้ขอบล่าง

---

### 5. Dark mode กระพริบตอนโหลดหน้า (Flash of Unstyled Content)
React hydration ช้ากว่า browser render ทำให้ผู้ใช้เห็น light mode ชั่วครู่ก่อนที่ ThemeContext จะ apply dark class

**แก้:** ใส่ inline `<script>` ใน `<head>` ที่อ่าน localStorage และ set `dark` class บน `<html>` ก่อน first paint เลย — ThemeContext ค่อยอ่าน initial state จาก DOM class (ไม่ใช่ localStorage โดยตรง)

---

### 6. Bilingual content จาก LLM
ต้องการให้ LLM ส่งข้อความทุก field เป็น `{ th, en }` แต่ถ้า model ไม่ทำตามหรือมี record เก่าที่เป็น string เดี่ยว ระบบจะพัง

**แก้:** ใช้ type `MaybeBilingual = string | { th?: string; en?: string }` และ `pickText()` ที่ handle ทั้ง 2 กรณี — เก่า/ใหม่ทำงานได้ทั้งคู่โดยไม่ต้อง migrate

---

### 7. NextAuth client fetch พังตอน dev server สลับ port
`next-auth/react` อ่าน `NEXTAUTH_URL` ผ่าน `process.env` ตอน build bundle ฝั่ง client — แต่ Next.js ไม่ inline env var ที่ไม่ขึ้นต้นด้วย `NEXT_PUBLIC_` ให้ฝั่ง browser ทำให้ fallback เป็น `http://localhost:3000` เสมอ ถ้า dev server ดันไปรันที่ port อื่น (เช่น 3000 ถูกใช้อยู่ Next เลยสลับไป 3001) ปุ่ม logout จะยิง fetch ไปคนละ origin แล้ว throw `TypeError: Failed to fetch` กลายเป็น unhandled error เต็มจอ

**แก้:** ห่อ `signOut()` ด้วย `try/catch` เสมอ ไม่ปล่อยให้ promise reject หลุดออกมาเป็น unhandled rejection — ถ้า fetch ล้มเหลวให้ fallback เป็น hard redirect แทน

---

### 8. ประวัติเก่าก่อนมี Auth "หายไป" หลังเพิ่มระบบ login
พอเพิ่ม `Estimation.userId` แล้วเปลี่ยนทุก query ให้ filter ด้วย `userId` ของผู้ใช้ที่ login อยู่ ข้อมูลเก่าที่สร้างไว้ก่อนมี field นี้เลย (ไม่ใช่ `null` แต่ "ไม่มี field" อยู่จริงๆ) จะกลายเป็นข้อมูลกำพร้า มองไม่เห็นจากบัญชีไหนเลย — แต่ยังอยู่ใน MongoDB ครบ ไม่ได้ถูกลบ

**แก้:** เขียนสคริปต์ตรวจ `Estimation` ที่ `userId` เป็น `null`/ไม่มี field แล้ว `updateMany` ผูกกลับเข้ากับบัญชีที่ต้องการได้ทุกเมื่อ — เป็นเหตุผลว่าทำไม schema ถึงออกแบบให้ `userId` เป็น **optional relation** ไม่ใช่ required (กัน migration พังตอนมีข้อมูลเก่าอยู่แล้ว)

---

### 9. แก้โปรไฟล์แล้ว Header ไม่อัปเดตจนกว่าจะ login ใหม่
NextAuth เก็บ session เป็น JWT ฝั่ง client — พอแก้ชื่อ/อีเมลผ่าน `PATCH /api/account` สำเร็จ DB อัปเดตแล้วก็จริง แต่ JWT ที่ browser ถืออยู่ยังเป็นค่าเก่า ทำให้ Header (avatar/อีเมล) ไม่เปลี่ยนจนกว่า token จะหมดอายุหรือ login ใหม่

**แก้:** เพิ่ม `trigger === 'update'` ใน `jwt` callback ของ `authOptions` แล้วเรียก `useSession().update({ name, email })` ฝั่ง client ทันทีหลัง PATCH สำเร็จ — sync session ได้โดยไม่ต้อง re-login

---

## การติดตั้ง

**1. Clone และติดตั้ง**
```bash
git clone https://github.com/YOUR_USERNAME/ai-manday-estimator.git
cd ai-manday-estimator
npm install
```

**2. สร้างไฟล์ `.env.local`**
```env
GROQ_API_KEY="gsk_xxxxxxxxxxxxxxxxxxxx"
DATABASE_URL="mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/aimanday?appName=Cluster0"
NEXTAUTH_SECRET="random-string-here"
NEXTAUTH_URL="http://localhost:3000"
```

> รับ `GROQ_API_KEY` ได้ฟรีที่ [console.groq.com](https://console.groq.com)
> รับ `DATABASE_URL` จาก MongoDB Atlas → Cluster → Connect
> สร้าง `NEXTAUTH_SECRET` ด้วย `openssl rand -base64 32`

**3. Push schema ไป MongoDB**
```bash
npm run prisma:push
```

**4. รัน dev server**
```bash
npm run dev
```

เปิด `http://localhost:3000` — ทดลองใช้เครื่องมือได้ทันทีโดยไม่ต้อง login หรือกด "สมัครสมาชิก" เพื่อเริ่มเก็บประวัติของตัวเอง (หน้า login มีบัญชีทดสอบให้ autofill ได้เลย)

---

## Deploy บน Vercel

```bash
git push origin main
```

จากนั้น: [vercel.com](https://vercel.com) → New Project → Import repo → เพิ่ม env vars (`GROQ_API_KEY`, `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` เป็น production URL) → Deploy

ระบบ auto-deploy ทุกครั้งที่ push ไป `main`

---

## API

| Method | Endpoint | Auth | คำอธิบาย |
|---|---|---|---|
| `POST` | `/api/upload` | ไม่บังคับ | รับไฟล์เสียง → คืน transcript text |
| `POST` | `/api/analyze` | ไม่บังคับ | รับ transcript → stream JSON analysis (บันทึก DB เฉพาะถ้า login) |
| `POST` | `/api/auth/register` | — | สมัครสมาชิก |
| `*` | `/api/auth/[...nextauth]` | — | login / logout / session (NextAuth) |
| `GET` | `/api/account` | ต้อง login | ดูข้อมูลโปรไฟล์ตัวเอง |
| `PATCH` | `/api/account` | ต้อง login | แก้ไขชื่อ/อีเมล |
| `PATCH` | `/api/account/password` | ต้อง login | เปลี่ยนรหัสผ่าน |
| `GET` | `/api/history` | ต้อง login | ดึงประวัติของตัวเอง 200 รายการล่าสุด |
| `GET` | `/api/history/:id` | ต้อง login | ดึง 1 รายการ (เฉพาะของตัวเอง) |
| `DELETE` | `/api/history/:id` | ต้อง login | ลบรายการ (เฉพาะของตัวเอง) |

Rate limit: 10 req/min ต่อ IP ต่อ endpoint (returns `429` + `Retry-After` header)

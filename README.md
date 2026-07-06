# AI Manday Estimator

ระบบ AI ที่แปลงไฟล์เสียง Requirement ให้กลายเป็น Scope of Work + ประมาณการ Manday แบบอัตโนมัติ

---

## ทำไมถึงทำโปรเจกต์นี้

ในการทำงานพัฒนาซอฟต์แวร์ ขั้นตอนที่ใช้เวลาและเสี่ยงต่อความผิดพลาดมากที่สุดขั้นตอนหนึ่งคือการประเมินขอบเขตงานและ Manday หลังจากการประชุม Requirement ทีมมักต้องนั่งถอดเทปเสียง แยกหัวข้อ แล้วค่อย estimate ด้วยมือ ซึ่งกินเวลาและมีโอกาสตกหล่นรายละเอียด

โปรเจกต์นี้จึงสร้างขึ้นเพื่อ **ช่วยให้กระบวนการนั้นเร็วขึ้น** โดยให้ AI ทำหน้าที่ฟัง วิเคราะห์ และสรุปงานออกมาเป็นโครงสร้างที่ใช้งานได้ทันที

---

## โปรเจกต์ทำอะไร

อัปโหลดไฟล์เสียงการประชุมหรือบันทึก Requirement → ระบบถอดเสียงเป็นข้อความ → แก้ไขข้อความได้ → AI วิเคราะห์และสรุปออกมาเป็น:

- **Scope of Work (SOW)** — รายการสิ่งที่ต้องทำ
- **Manday Range** — ช่วงประมาณการวันทำงาน (min–max)
- **Modules Breakdown** — แยกรายโมดูลพร้อม manday ต่อโมดูล
- **Assumptions** — สมมติฐานที่ใช้ในการประเมิน
- **Reliability Score** — คะแนนความน่าเชื่อถือของการประเมิน 0–100

ผลลัพธ์ทั้งหมดแสดงเป็น **2 ภาษา (ไทย + อังกฤษ)** พร้อม export เป็น JSON / Markdown / CSV / PDF

---

## วิธีการทำงาน

```
[อัปโหลดไฟล์เสียง]
        ↓
POST /api/upload  →  Groq Whisper (STT)  →  transcript text
        ↓
[ผู้ใช้ตรวจสอบ / แก้ไข transcript]
        ↓
POST /api/analyze  →  Groq GPT OSS 120B (LLM Streaming)
        ↓
parse JSON  →  บันทึก MongoDB  →  แสดงผล real-time
```

**2 ขั้นตอนแยกกัน เพื่อให้ผู้ใช้แก้ไข transcript ก่อนส่ง AI ได้**

ระบบ stream ผลลัพธ์กลับมาทีละ token แสดงผลแบบ terminal live — ไม่ต้องรอจนครบ

---

## Tech Stack

| ส่วน | เทคโนโลยี | เหตุผลที่เลือก |
|---|---|---|
| Frontend | Next.js 14 App Router + TypeScript | Server/Client components, type-safe ตั้งแต่ต้น |
| Styling | Tailwind CSS + Sarabun Font | จัดการ responsive ได้เร็ว, รองรับ Thai + Latin |
| Database | MongoDB Atlas | เหมาะกับ JSON output ที่โครงสร้างยืดหยุ่น |
| ORM | Prisma 5 | type-safe queries, migrate schema ได้ง่าย |
| STT | Groq Whisper `whisper-large-v3` | เร็ว, แม่นยำ, รองรับภาษาไทย |
| LLM | Groq `openai/gpt-oss-120b` | ฟรี, streaming API, instruction following ดีมาก |

---

## ฟีเจอร์

**หลัก**
- อัปโหลดไฟล์เสียง `.mp3` / `.wav` / `.m4a`
- ถอดเสียงด้วย Groq Whisper
- วิเคราะห์ด้วย AI → SOW + Manday + Modules + Assumptions
- บันทึก + ดูประวัติทั้งหมดผ่าน MongoDB

**เพิ่มเติม**
- **Editable Transcript** — แก้ไขข้อความจาก STT ก่อนส่ง AI (เพราะ STT ไม่แม่น 100%)
- **Streaming Terminal** — แสดงผล AI แบบ real-time ทีละ token
- **Bilingual Output** — SOW / Modules / Assumptions แสดงทั้งไทยและอังกฤษพร้อมกัน
- **Reliability Score** — คะแนน 0–100 พร้อม breakdown ว่าหักจากอะไร
- **Audio Preview Player** — เล่นเสียงย้อนกลับได้ทุกขั้นตอน รวมถึงในหน้าประวัติ
- **History Page** — ค้นหา + แบ่งหน้า, เปิดรายละเอียดต่อ item, ลบได้
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
├── app/
│   ├── page.tsx                   # หน้าหลัก: upload → transcript → analyze → result
│   ├── layout.tsx                 # Root layout + providers + BottomNav
│   ├── guide/page.tsx             # หน้าวิธีใช้งาน
│   ├── history/
│   │   ├── page.tsx               # รายการประวัติ + search + pagination
│   │   └── [id]/page.tsx          # หน้ารายละเอียดต่อ item
│   └── api/
│       ├── upload/route.ts        # STT + rate limit + file validation
│       ├── analyze/route.ts       # LLM streaming + DB save + rate limit
│       └── history/[id]/route.ts  # GET single + DELETE
├── components/
│   ├── Header.tsx / BottomNav.tsx / Footer.tsx
│   ├── UploadZone.tsx             # Drag & drop
│   ├── AudioPreview.tsx           # Custom audio player
│   ├── ResultCard.tsx             # แสดงผล SOW/Manday/Modules + export
│   ├── ExportMenu.tsx             # Dropdown ด้วย React Portal
│   └── Bilingual.tsx              # Render ข้อความ 2 ภาษา
├── contexts/                      # Theme / Language / Toast
├── lib/
│   ├── analyzer.ts                # System prompt + JSON parser
│   ├── whisper.ts                 # Groq Whisper helper
│   ├── reliability.ts             # คำนวณ confidence score
│   ├── rateLimit.ts               # In-memory sliding window
│   ├── bilingual.ts               # pickText / plainText
│   ├── download.ts                # JSON/MD/CSV export
│   └── i18n.ts                    # คำแปล TH/EN ทุก label
└── types/history.ts               # Shared HistoryItem interface
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
```

> รับ `GROQ_API_KEY` ได้ฟรีที่ [console.groq.com](https://console.groq.com)
> รับ `DATABASE_URL` จาก MongoDB Atlas → Cluster → Connect

**3. Push schema ไป MongoDB**
```bash
npm run prisma:push
```

**4. รัน dev server**
```bash
npm run dev
```

เปิด `http://localhost:3000`

---

## Deploy บน Vercel

```bash
git push origin main
```

จากนั้น: [vercel.com](https://vercel.com) → New Project → Import repo → เพิ่ม env vars (`GROQ_API_KEY`, `DATABASE_URL`) → Deploy

ระบบ auto-deploy ทุกครั้งที่ push ไป `main`

---

## API

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| `POST` | `/api/upload` | รับไฟล์เสียง → คืน transcript text |
| `POST` | `/api/analyze` | รับ transcript → stream JSON analysis |
| `GET` | `/api/history` | ดึงประวัติ 200 รายการล่าสุด |
| `GET` | `/api/history/:id` | ดึง 1 รายการ |
| `DELETE` | `/api/history/:id` | ลบรายการ |

Rate limit: 10 req/min ต่อ IP ต่อ endpoint (returns `429` + `Retry-After` header)

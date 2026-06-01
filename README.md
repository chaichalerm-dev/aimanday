# AI Manday Estimator

**ภาษาไทย** | [English](#english-version)

---

## ภาษาไทย

### ภาพรวม

ระบบ AI ช่วยประเมิน Manday จากไฟล์เสียง Requirement โดยอัตโนมัติ อัปโหลดไฟล์เสียง ระบบถอดเสียงเป็นข้อความ วิเคราะห์ด้วย AI แล้วสรุปเป็น Scope of Work (SOW) พร้อมประมาณการจำนวนวันทำงาน (Manday) แยกรายโมดูล

---

### สถาปัตยกรรม (Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                        │
│                                                             │
│  [Audio Preview] → [Transcribe] → [Edit] → [Analyze w/ AI] │
│                                          ↓                  │
│              [SOW] [Manday Range] [Modules] [Assumptions]   │
│              [Copy JSON/MD] [Export CSV] [Print PDF]        │
└──────────────────┬──────────────────────────────────────────┘
                   │
      ┌────────────▼────────────┐
      │   Next.js App Router    │
      │   Rate Limit (IP-based) │
      └──┬──────────────────┬───┘
         │                  │
POST /api/upload      POST /api/analyze
         │                  │
  Groq Whisper        Groq LLM (Streaming)
  whisper-large-v3    llama-3.3-70b-versatile
         │                  │
         │            MongoDB (Prisma)
         └──────────────────┘
```

**Processing Flow:**
1. เลือก/วางไฟล์เสียง → Audio Preview Player
2. กด **ถอดเสียง** → Groq Whisper → transcript
3. แก้ไข transcript ได้ก่อนส่ง AI
4. กด **วิเคราะห์ด้วย AI** → Groq Llama 3.3 (streaming real-time)
5. บันทึกลง MongoDB อัตโนมัติ
6. แสดงผล + Copy/Export/Print

---

### ฟีเจอร์ทั้งหมด

**Core (ตามโจทย์)**
- อัปโหลดไฟล์เสียง .mp3 / .wav / .m4a
- Speech-to-Text ด้วย Groq Whisper
- AI วิเคราะห์ Requirement → SOW + Manday Range + Modules + Assumptions
- บันทึก MongoDB ด้วย Prisma

**Bonus Features**
- **Editable Transcript** — แก้ไข STT ก่อนส่ง AI (STT ไม่ perfect 100%)
- **Streaming Response** — แสดง terminal live ขณะ AI generate (Groq streaming API)
- **Bilingual Content** — SOW/Modules/Assumptions แสดง 2 ภาษาพร้อมกัน (หลัก + แปลตัวเล็ก)
- **Reliability Score** — คะแนนความน่าเชื่อถือ 0–100 พร้อม tooltip breakdown
- **Audio Preview Player** — เล่น/หยุด/seek ไฟล์เสียงก่อนถอดเสียง
- **History Page** — ดูประวัติการประเมินทั้งหมด ค้นหา + แบ่งหน้า (5 รายการ/หน้า)
- **History Detail Page** — คลิกชื่อไฟล์เปิดหน้ารายละเอียดเต็มแยกต่อ item (`/history/[id]`)
- **Delete History** — ลบรายการพร้อม inline confirm
- **Re-analyze** — โหลด transcript กลับมาวิเคราะห์ใหม่
- **Export Menu** — dropdown รวม Copy (JSON/Markdown), Download (JSON/Markdown/CSV), Print/PDF
- **Print / PDF** — พิมพ์หรือ save as PDF
- **Toast Notifications** — แจ้งเตือน copy/export/delete พร้อม animation
- **Dark / Light Mode** — sync กับ system preference + localStorage
- **Thai / English UI** — สลับภาษาได้ทันที ทุก label
- **Guide Page** — หน้าวิธีใช้งานครบ + ติดต่อผู้พัฒนาผ่าน LINE OA
- **Responsive + Bottom Nav** — fixed header + bottom tab bar สไตล์แอปบนมือถือ
- **Rate Limiting** — 10 req/min ต่อ IP (upload + analyze) พร้อม headers

---

### Tech Stack

| ชั้น | เทคโนโลยี | เหตุผล |
|---|---|---|
| Frontend | Next.js 14 App Router + TypeScript | Server/Client components, type-safe |
| Styling | Tailwind CSS + Sarabun Font | Thai+Latin รองรับทั้งสองภาษา |
| Database | MongoDB Atlas | Document DB เหมาะกับ JSON output |
| ORM | Prisma 5 | Type-safe queries, schema validation |
| STT | Groq Whisper `whisper-large-v3` | เร็ว, ฟรี, แม่นยำสูง |
| LLM | Groq `llama-3.3-70b-versatile` | ฟรี, streaming, instruction following ดี |

---

### Prompt Engineering

**System Prompt:**
```
You are a senior software project estimator with 10+ years experience.
Analyze the given project requirement transcript and return ONLY valid JSON
(no markdown, no explanation).
```

**กลยุทธ์ที่ใช้:**
- `temperature: 0.1` — ลด randomness ให้ output สม่ำเสมอ
- JSON schema ระบุในทั้ง system + user prompt (reinforcement)
- Strip markdown code fences ก่อน parse
- **Auto-retry 1 ครั้ง** เมื่อ parse ล้มเหลว
- Shape validation ตรวจ type ทุก field ก่อน return

---

### การติดตั้ง (Setup)

**1. Clone repository**
```bash
git clone https://github.com/YOUR_USERNAME/ai-manday-estimator.git
cd ai-manday-estimator
```

**2. ติดตั้ง dependencies**
```bash
npm install
```

**3. ตั้งค่า Environment Variables**

สร้างไฟล์ `.env.local`:
```env
GROQ_API_KEY="gsk_xxxxxxxxxxxxxxxxxxxx"
DATABASE_URL="mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/aimanday?appName=Cluster0"
```

**4. Push schema ไป MongoDB**
```bash
npm run prisma:push
```

**5. รัน development server**
```bash
npm run dev
```

เปิด `http://localhost:3000`

---

### Environment Variables

| ตัวแปร | คำอธิบาย | รับได้จาก |
|---|---|---|
| `GROQ_API_KEY` | ใช้ทั้ง Whisper STT และ Llama LLM | [console.groq.com](https://console.groq.com) |
| `DATABASE_URL` | MongoDB Atlas connection string | MongoDB Atlas → Connect |

---

### Deployment บน Vercel

```bash
# 1. Push ขึ้น GitHub
git add .
git commit -m "feat: AI Manday Estimator"
git push -u origin main

# 2. Import บน Vercel
# vercel.com → New Project → import repo

# 3. เพิ่ม env vars บน Vercel dashboard
# Settings → Environment Variables → GROQ_API_KEY, DATABASE_URL

# 4. Deploy (auto-deploy ทุกครั้งที่ push)
```

---

### Rate Limiting

| Endpoint | Limit | Window |
|---|---|---|
| `POST /api/upload` | 10 requests | 1 นาที / IP |
| `POST /api/analyze` | 10 requests | 1 นาที / IP |

Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`

---

### API Reference

**`POST /api/upload`**
```
Content-Type: multipart/form-data
Field: audio (.mp3 | .wav | .m4a, max 25 MB)
→ { "transcript": "..." }
```

**`POST /api/analyze`** (Streaming)
```
Content-Type: application/json
Body: { "transcript": "...", "audioName": "meeting.mp3" }
→ text/plain stream → valid JSON when complete
```
Every text field is returned bilingual, e.g.:
```json
{
  "sow": [{ "th": "ระบบล็อกอิน", "en": "Login system" }],
  "manday_estimate": { "min": 20, "max": 30 },
  "modules": [{ "name": { "th": "...", "en": "..." }, "description": { "th": "...", "en": "..." }, "manday": 5 }],
  "assumptions": [{ "th": "...", "en": "..." }]
}
```
(Legacy records may store fields as plain strings — the UI handles both.)

**`GET /api/history`**
```
→ EstimationRecord[] (latest 200, sorted by createdAt desc)
```

**`GET /api/history/:id`**
```
→ single EstimationRecord (404 if not found)
```

**`DELETE /api/history/:id`**
```
→ { "success": true }
```

---

### โครงสร้างโปรเจกต์

```
src/
├── app/
│   ├── page.tsx                   # Main page — upload → transcript → stream → result
│   ├── layout.tsx                 # Root layout + providers + BottomNav
│   ├── globals.css                # Tailwind + print CSS
│   ├── guide/page.tsx             # Usage guide + LINE OA contact
│   ├── history/
│   │   ├── page.tsx               # History list + search + pagination (5/page) + per-item export
│   │   └── [id]/page.tsx          # Full detail page per item (reuses ResultCard)
│   └── api/
│       ├── upload/route.ts        # STT + rate limit + file size validate
│       ├── analyze/route.ts       # LLM streaming + DB save + rate limit
│       └── history/
│           ├── route.ts           # GET history list
│           └── [id]/route.ts      # GET single + DELETE history item
├── components/
│   ├── Header.tsx                 # Fixed header + nav + TH/EN + dark mode + logo→home
│   ├── BottomNav.tsx              # Mobile/tablet bottom tab bar
│   ├── UploadZone.tsx             # Drag & drop upload
│   ├── AudioPreview.tsx           # Custom audio player
│   ├── ResultCard.tsx             # SOW / Manday / Modules + ExportMenu + Reliability
│   ├── ExportMenu.tsx             # Portal dropdown: Copy / Download / Print
│   └── Bilingual.tsx              # Renders text in both languages
├── contexts/
│   ├── ThemeContext.tsx            # Dark/Light mode
│   ├── LanguageContext.tsx         # TH/EN i18n
│   └── ToastContext.tsx            # Toast notifications
└── lib/
    ├── prisma.ts                  # Prisma singleton
    ├── whisper.ts                 # Groq Whisper helper
    ├── analyzer.ts                # Prompt + JSON parser + retry + types
    ├── reliability.ts             # Confidence score calculation
    ├── rateLimit.ts               # In-memory sliding window
    ├── bilingual.ts               # pickText / plainText (bilingual helpers)
    ├── download.ts                # JSON/Markdown/CSV download helpers
    └── i18n.ts                    # Thai + English translations
prisma/
└── schema.prisma
```

---

### Reliability Score Algorithm

คำนวณจาก 3 ปัจจัย:

| ปัจจัย | ผลกระทบ |
|---|---|
| จำนวน Assumptions | -12 ต่อข้อ (max -42) |
| Manday range spread | -10 ถึง -20 ถ้า range > 50% |
| Module/SOW detail | +5 ต่ออย่าง ถ้า ≥ 5 items |

**เกณฑ์:** High ≥ 75 · Medium ≥ 50 · Low < 50

---

### เกณฑ์คะแนน Self-Assessment

| เกณฑ์ | น้ำหนัก | Implementation |
|---|---|---|
| **Functional** | 30% | STT → Edit → LLM Stream → SOW+Manday+Modules+Assumptions ครบ |
| **AI Accuracy** | 35% | Strict JSON prompt + temperature 0.1 + retry + shape validation |
| **Frontend** | 20% | Dark mode, TH/EN, responsive, audio preview, streaming terminal |
| **Code Quality** | 15% | Separation of concerns, TypeScript strict, rate limiting, validation |

---
---

## English Version

### Overview

An AI-powered web application that converts audio project requirement recordings into structured Scope of Work documents with manday estimates. Upload an audio file, the system transcribes it via Speech-to-Text, lets you edit the transcript, then streams an AI analysis in real-time.

---

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                        │
│                                                             │
│  [Audio Preview] → [Transcribe] → [Edit] → [Analyze w/ AI] │
│                                          ↓                  │
│              [SOW] [Manday Range] [Modules] [Assumptions]   │
│              [Copy JSON/MD] [Export CSV] [Print PDF]        │
└──────────────────┬──────────────────────────────────────────┘
                   │
      ┌────────────▼────────────┐
      │   Next.js App Router    │
      │   Rate Limit (IP-based) │
      └──┬──────────────────┬───┘
         │                  │
POST /api/upload      POST /api/analyze
         │                  │
  Groq Whisper        Groq LLM (Streaming)
  whisper-large-v3    llama-3.3-70b-versatile
                            │
                      MongoDB (Prisma)
```

---

### Features

**Core (per spec)**
- Audio upload (.mp3 / .wav / .m4a) with type + size validation
- Speech-to-Text via Groq Whisper
- AI analysis → SOW + Manday Range + Modules breakdown + Assumptions
- Save to MongoDB via Prisma

**Bonus Features**
- **Editable Transcript** — correct STT errors before AI analysis
- **Streaming Response** — live terminal output while AI generates
- **Bilingual Content** — SOW/Modules/Assumptions shown in both languages (primary + small translation)
- **Reliability Score** — 0–100 confidence score with hover breakdown
- **Audio Preview Player** — play/pause/seek before transcribing
- **History Page** — list of past estimations with search & pagination (5 items/page)
- **History Detail Page** — click a filename to open a dedicated full detail page (`/history/[id]`)
- **Delete History** — with inline confirmation
- **Re-analyze** — reload any past transcript back to the editor
- **Export Menu** — dropdown grouping Copy (JSON/Markdown), Download (JSON/Markdown/CSV), Print/PDF
- **Print / PDF** — print or save as PDF
- **Toast Notifications** — animated feedback for all actions
- **Dark / Light Mode** — synced with system preference + localStorage
- **Thai / English UI** — instant language switch, all labels translated
- **Guide Page** — full usage guide + contact developer via LINE OA
- **Responsive + Bottom Nav** — fixed header + app-style bottom tab bar on mobile
- **Rate Limiting** — 10 req/min per IP, standard headers

---

### Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 14 App Router + TypeScript | Type-safe server/client components |
| Styling | Tailwind CSS + Sarabun Font | Thai+Latin bilingual support |
| Database | MongoDB Atlas | Document DB suits JSON output |
| ORM | Prisma 5 | Type-safe queries |
| STT | Groq Whisper `whisper-large-v3` | Fast, free, accurate |
| LLM | Groq `llama-3.3-70b-versatile` | Free, streaming, strong instruction following |

---

### Prompt Engineering

```
System: You are a senior software project estimator with 10+ years experience.
        Analyze the given project requirement transcript and return ONLY valid JSON
        (no markdown, no explanation).

User:   Analyze this requirement and estimate manday:
        """
        {transcript}
        """
        Return ONLY this JSON structure:
        {
          "sow": ["..."],
          "manday_estimate": { "min": number, "max": number },
          "modules": [{ "name": "", "description": "", "manday": number }],
          "assumptions": ["..."]
        }
```

**Reliability strategies:** `temperature: 0.1` · JSON schema in both prompts · markdown strip before parse · auto-retry once · shape validation on all fields

---

### Setup

**1. Clone & install**
```bash
git clone https://github.com/YOUR_USERNAME/ai-manday-estimator.git
cd ai-manday-estimator
npm install
```

**2. Environment variables** — create `.env.local`:
```env
GROQ_API_KEY="gsk_xxxxxxxxxxxxxxxxxxxx"
DATABASE_URL="mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/aimanday?appName=Cluster0"
```

**3. Push schema to MongoDB**
```bash
npm run prisma:push
```

**4. Start dev server**
```bash
npm run dev
```

Open `http://localhost:3000`

---

### Environment Variables

| Variable | Description | Get from |
|---|---|---|
| `GROQ_API_KEY` | Powers both Whisper STT and Llama LLM | [console.groq.com](https://console.groq.com) |
| `DATABASE_URL` | MongoDB Atlas connection string | MongoDB Atlas → Connect |

---

### Deploy on Vercel

```bash
git push origin main
# Then: vercel.com → New Project → import → add env vars → Deploy
```

---

### Rate Limiting

| Endpoint | Limit | Window |
|---|---|---|
| `POST /api/upload` | 10 requests | 1 min / IP |
| `POST /api/analyze` | 10 requests | 1 min / IP |

Returns `429 Too Many Requests` with `Retry-After` header when exceeded.

---

### Evaluation Criteria Self-Assessment

| Criteria | Weight | What was implemented |
|---|---|---|
| **Functional** | 30% | Full end-to-end: audio → STT → edit → LLM stream → SOW+Manday+Modules+Assumptions → DB |
| **AI Accuracy** | 35% | JSON-only prompt + low temperature + retry + shape validation + streaming |
| **Frontend** | 20% | Dark mode, TH/EN bilingual, responsive, audio preview, live streaming terminal, history CRUD |
| **Code Quality** | 15% | Strict TypeScript, separated concerns, rate limiting, file size validation, singleton patterns |

import Groq from 'groq-sdk';
import type { MaybeBilingual } from './bilingual';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Text fields may be a plain string (legacy records) or { th, en } (current).
export interface Module {
  name: MaybeBilingual;
  description: MaybeBilingual;
  manday: number;
}

export interface EstimationResult {
  sow: MaybeBilingual[];
  manday_estimate: { min: number; max: number };
  modules: Module[];
  assumptions: MaybeBilingual[];
}

export const SYSTEM_PROMPT = `You are a senior software project estimator with 10+ years experience.
Analyze the given project requirement transcript and return ONLY valid JSON (no markdown, no explanation).

CRITICAL BILINGUAL RULE: Every human-readable text field MUST be an object with two keys "th" (Thai) and "en" (English).
- "th" must be written in the Thai language (Thai script).
- "en" must be written in the English language.
- These are TRANSLATIONS of each other — never put the same language in both. If the source is Thai, translate it to English for "en", and vice versa.`;

export function buildUserPrompt(transcript: string): string {
  return `Analyze this requirement and estimate manday:
"""
${transcript}
"""

Return ONLY this exact JSON structure. Note how every text field has BOTH a Thai "th" and an English "en" value:

{
  "sow": [
    { "th": "ระบบยืนยันตัวตนผู้ใช้", "en": "User authentication system" },
    { "th": "หน้าจัดการสินค้า", "en": "Product management page" }
  ],
  "manday_estimate": { "min": 20, "max": 30 },
  "modules": [
    {
      "name": { "th": "ระบบล็อกอิน", "en": "Login System" },
      "description": { "th": "เข้าสู่ระบบและสมัครสมาชิกพร้อมสิทธิ์การใช้งาน", "en": "Login and registration with role-based access" },
      "manday": 5
    }
  ],
  "assumptions": [
    { "th": "สมมติว่าเป็นเว็บแอปเท่านั้น ไม่มีแอปมือถือ", "en": "Assuming web application only, no mobile app" }
  ]
}

Follow this format exactly. The "th" value must be Thai text and the "en" value must be the English translation of the same meaning.`;
}

export function tryParseJSON(text: string): EstimationResult | null {
  try {
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    const parsed = JSON.parse(cleaned);
    if (
      Array.isArray(parsed.sow) &&
      typeof parsed.manday_estimate?.min === 'number' &&
      typeof parsed.manday_estimate?.max === 'number' &&
      Array.isArray(parsed.modules) &&
      Array.isArray(parsed.assumptions)
    ) {
      return parsed as EstimationResult;
    }
    return null;
  } catch {
    return null;
  }
}

async function callLLM(transcript: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 4096,
    temperature: 0.1,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(transcript) },
    ],
  });

  return completion.choices[0]?.message?.content ?? '';
}

export async function analyzeTranscript(transcript: string): Promise<EstimationResult> {
  const firstResponse = await callLLM(transcript);
  const firstParsed = tryParseJSON(firstResponse);
  if (firstParsed) return firstParsed;

  // Retry once on parse failure
  const secondResponse = await callLLM(transcript);
  const secondParsed = tryParseJSON(secondResponse);
  if (secondParsed) return secondParsed;

  throw new Error('LLM returned invalid JSON after 2 attempts. Raw output: ' + firstResponse.slice(0, 500));
}

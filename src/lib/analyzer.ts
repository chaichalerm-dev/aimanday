import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface Module {
  name: string;
  description: string;
  manday: number;
}

export interface EstimationResult {
  sow: string[];
  manday_estimate: { min: number; max: number };
  modules: Module[];
  assumptions: string[];
}

export const SYSTEM_PROMPT = `You are a senior software project estimator with 10+ years experience.
Analyze the given project requirement transcript and return ONLY valid JSON (no markdown, no explanation).`;

export function buildUserPrompt(transcript: string): string {
  return `Analyze this requirement and estimate manday:
"""
${transcript}
"""

Return ONLY this JSON structure:
{
  "sow": ["list of deliverables"],
  "manday_estimate": { "min": number, "max": number },
  "modules": [{ "name": "", "description": "", "manday": number }],
  "assumptions": ["if requirement is unclear, list assumptions here"]
}`;
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

import type { EstimationResult } from './analyzer';

export type ReliabilityLevel = 'high' | 'medium' | 'low';

export interface ReliabilityScore {
  score: number;        // 0–100
  level: ReliabilityLevel;
  assumptionPenalty: number;
  rangePenalty: number;
  detailBonus: number;
}

// คำนวณ "คะแนนความน่าเชื่อถือ" ของผลประเมิน (0-100) จากตัวชี้วัด 3 อย่าง
// รับผลลัพธ์การประเมิน (sow/manday_estimate/modules/assumptions) คืนค่า ReliabilityScore
// สูตรคิดคะแนน: เริ่มจาก 100 เต็ม แล้วหักคะแนนตามความไม่แน่นอน + บวกคะแนนตามความละเอียด
export function calculateReliability(result: {
  sow: unknown[];
  manday_estimate: { min: number; max: number };
  modules: { manday: number }[];
  assumptions: unknown[];
}): ReliabilityScore {
  // Penalty: each assumption = an unknown requirement
  // สมมติฐานยิ่งเยอะ ยิ่งแปลว่ามีเรื่องที่ AI ไม่รู้ชัดเจน — หักข้อละ 12 คะแนน สูงสุดไม่เกิน 42
  const assumptionPenalty = Math.min(result.assumptions.length * 12, 42);

  // Penalty: wide manday range = uncertain estimate
  // เทียบ "ส่วนต่างช่วง" กับค่า min เป็นสัดส่วน (spreadRatio) — ช่วงกว้างเทียบกับฐานมาก = ไม่มั่นใจ
  // เช่น 10-30 วัน (spread=20, min=10) → ratio=2.0 (>1.0) หักเต็ม 20; 10-14 วัน → ratio=0.4 ไม่หัก
  const spread = result.manday_estimate.max - result.manday_estimate.min;
  const spreadRatio = result.manday_estimate.min > 0 ? spread / result.manday_estimate.min : 0;
  const rangePenalty = spreadRatio > 1.0 ? 20 : spreadRatio > 0.5 ? 10 : 0;

  // Bonus: detailed breakdown → more thorough analysis
  // แตกโมดูล/scope ได้ละเอียด (≥5 รายการ) แปลว่าวิเคราะห์มาดี ได้โบนัสอย่างละ 5 คะแนน
  const detailBonus = (result.modules.length >= 5 ? 5 : 0) + (result.sow.length >= 5 ? 5 : 0);

  // รวมคะแนนแล้ว clamp ไว้ระหว่าง 5-100 (ไม่ให้ต่ำจนติดลบหรือดูน่ากลัวเกินไป)
  const score = Math.round(
    Math.max(5, Math.min(100, 100 - assumptionPenalty - rangePenalty + detailBonus)),
  );

  const level: ReliabilityLevel = score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low';

  return { score, level, assumptionPenalty, rangePenalty, detailBonus };
}

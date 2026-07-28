export type PasswordStrengthLevel = 'weak' | 'medium' | 'strong';

export interface PasswordStrength {
  score: number; // 0-6
  level: PasswordStrengthLevel;
}

// คำนวณความแข็งแรงของรหัสผ่านแบบให้คะแนนสะสม (0-6) จากเงื่อนไข 6 ข้อ
// รับ password (string ดิบ) คืนค่า { score, level } — ไม่ได้ตรวจสอบกับ dictionary/leak list ใด ๆ แค่ดูรูปแบบตัวอักษร
export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;   // มีตัวพิมพ์เล็ก
  if (/[A-Z]/.test(password)) score++;   // มีตัวพิมพ์ใหญ่
  if (/[0-9]/.test(password)) score++;   // มีตัวเลข
  if (/[^a-zA-Z0-9]/.test(password)) score++; // มีอักขระพิเศษ (ไม่ใช่ a-z, A-Z, 0-9)

  const level: PasswordStrengthLevel = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong';
  return { score, level };
}

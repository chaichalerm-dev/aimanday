export type PasswordStrengthLevel = 'weak' | 'medium' | 'strong';

export interface PasswordStrength {
  score: number; // 0-6
  level: PasswordStrengthLevel;
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const level: PasswordStrengthLevel = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong';
  return { score, level };
}

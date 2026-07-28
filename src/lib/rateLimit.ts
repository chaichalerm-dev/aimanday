// In-memory sliding-window rate limiter
// Note: resets on server restart and is per-instance (not shared across replicas).
// For multi-instance production, replace with a Redis-backed solution.

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Purge stale entries every 5 minutes to prevent memory growth
setInterval(() => {
  const now = Date.now();
  Array.from(store.entries()).forEach(([key, val]) => {
    if (now > val.resetAt) store.delete(key);
  });
}, 5 * 60_000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: number; // unix ms
}

// เช็ค/นับจำนวนครั้งที่ identifier (เช่น "analyze:1.2.3.4") เรียกภายใน window ปัจจุบัน
// รับ identifier, limit (จำนวนครั้งสูงสุด), windowMs (ความยาว window เป็น ms)
// คืนค่า RateLimitResult บอกว่าอนุญาตไหม เหลือกี่ครั้ง และ reset เมื่อไหร่
export function checkRateLimit(
  identifier: string,
  limit = 10,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  // ไม่มี entry เดิม หรือ window เก่าหมดอายุแล้ว → เริ่มนับใหม่
  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, limit, resetAt };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, limit, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, limit, resetAt: entry.resetAt };
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };
  if (!result.allowed) {
    headers['Retry-After'] = String(Math.ceil((result.resetAt - Date.now()) / 1000));
  }
  return headers;
}

// หา IP ของ client จาก request headers เพื่อใช้เป็น key ของ rate limit
// รับ request (Request object) คืนค่าเป็น IP string (fallback '127.0.0.1' ถ้าหาไม่เจอ)
export function getClientIp(request: Request): string {
  // `x-forwarded-for`'s left-most entry is client-supplied and trivially spoofed
  // (an attacker can send a fresh random value per request to dodge the rate
  // limiter entirely). Prefer headers Vercel's edge sets itself from the real
  // socket — `x-real-ip`, then `x-vercel-forwarded-for` — before ever trusting XFF.
  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    '127.0.0.1'
  );
}

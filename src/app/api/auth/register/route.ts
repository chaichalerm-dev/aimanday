import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, rateLimitHeaders, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// รับ POST { email, password, name? } → สร้างบัญชีผู้ใช้ใหม่ (hash password ด้วย bcrypt ก่อนเก็บ)
export async function POST(request: NextRequest) {
  // Rate limit: 10 registration attempts per minute per IP
  const ip = getClientIp(request);
  const rateLimitResult = checkRateLimit(`register:${ip}`, 10, 60_000);
  const headers = rateLimitHeaders(rateLimitResult);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      { status: 429, headers },
    );
  }

  try {
    const body = await request.json();
    const { email, password, name } = body as { email?: string; password?: string; name?: string };

    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400, headers });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400, headers });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 409, headers });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashed,
        name: typeof name === 'string' && name.trim() ? name.trim() : undefined,
      },
    });

    return NextResponse.json({ id: user.id, email: user.email }, { headers });
  } catch (error) {
    console.error('[register] Error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500, headers });
  }
}

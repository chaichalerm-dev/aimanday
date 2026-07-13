import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  if (!user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(user);
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email } = body as { name?: string; email?: string };

    const data: { name?: string | null; email?: string } = {};

    if (name !== undefined) {
      data.name = typeof name === 'string' && name.trim() ? name.trim() : null;
    }

    if (email !== undefined) {
      if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
        return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
      }
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== session.user.email) {
        const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
          return NextResponse.json({ error: 'Email is already registered' }, { status: 409 });
        }
      }
      data.email = normalizedEmail;
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[account/update] Error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

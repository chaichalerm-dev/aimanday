import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Always fetch fresh from DB — never prerender/cache at build time
export const dynamic = 'force-dynamic';

// คืนรายการผลประเมินทั้งหมดของผู้ใช้ที่ login อยู่ (เรียงใหม่สุดก่อน, จำกัด 200 รายการ)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const estimations = await prisma.estimation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return NextResponse.json(estimations);
  } catch (error) {
    console.error('[history] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Always fetch fresh from DB — never prerender/cache at build time
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const estimations = await prisma.estimation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return NextResponse.json(estimations);
  } catch (error) {
    console.error('[history] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

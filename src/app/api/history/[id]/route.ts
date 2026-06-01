import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const estimation = await prisma.estimation.findUnique({ where: { id: params.id } });
    if (!estimation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(estimation);
  } catch (error) {
    console.error('[history/get] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.estimation.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[history/delete] Error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

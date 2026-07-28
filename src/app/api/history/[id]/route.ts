import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// คืนผลประเมิน 1 รายการตาม id — ใช้ findFirst (ไม่ใช่ findUnique) เพราะต้อง filter ด้วย userId ด้วย
// กันไม่ให้ผู้ใช้ A ดู record ของผู้ใช้ B ได้แค่เดา id ถูก
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const estimation = await prisma.estimation.findFirst({
      where: { id: params.id, userId: session.user.id },
    });
    if (!estimation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(estimation);
  } catch (error) {
    console.error('[history/get] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// ลบผลประเมิน 1 รายการ — ใช้ deleteMany (ไม่ใช่ delete ด้วย id เดี่ยว) เพราะ where ต้องมี userId
// ด้วยเสมอ (deleteMany ไม่ throw ถ้าไม่เจอ แค่คืน count=0 ทำให้เช็ค "ไม่ใช่เจ้าของ" ได้ปลอดภัยกว่า)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { count } = await prisma.estimation.deleteMany({
      where: { id: params.id, userId: session.user.id },
    });
    if (count === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[history/delete] Error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

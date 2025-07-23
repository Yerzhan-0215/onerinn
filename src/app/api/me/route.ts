import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // ✅ 使用命名导入

export async function GET() {
  const cookieStore = await cookies(); // ✅ await cookies()
  const userId = cookieStore.get('userId')?.value;

  if (!userId || isNaN(Number(userId))) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true
    }
  });

  return NextResponse.json({ user });
}
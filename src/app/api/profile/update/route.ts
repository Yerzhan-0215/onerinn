import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, phone } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        email: email || null,
        phone: phone || null,
      },
      select: {
        id: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('[PROFILE_UPDATE_ERROR]', error);
    return NextResponse.json({ error: 'Ошибка при обновлении профиля' }, { status: 500 });
  }
}

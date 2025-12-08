// src/app/api/admin/users/unblock/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = body?.userId as string | undefined;

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'MISSING_USER_ID' },
        { status: 400 },
      );
    }

    // TODO：这里可以加 admin 鉴权
    // await requireAdmin(req);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isBlocked: false },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        isBlocked: true,
      },
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (err) {
    console.error('[POST /api/admin/users/unblock] error:', err);
    return NextResponse.json(
      { ok: false, error: 'SERVER_ERROR' },
      { status: 500 },
    );
  }
}

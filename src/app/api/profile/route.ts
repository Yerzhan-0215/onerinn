// src/app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      bio: true,
      locale: true,
      currency: true,
      // ✅ 新增 4 个联系字段
      contactPhone: true,
      contactWhatsApp: true,
      contactTelegram: true,
      contactNote: true,
      // ✅ 新增：是否向买家展示姓名
      showName: true,
    },
  });

  return NextResponse.json({ user });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ✅ 在原有字段基础上“加法式”增加 avatarUrl + 4 个联系字段 + showName
  const {
    username,
    name,
    phone,
    bio,
    locale,
    currency,
    avatarUrl,
    contactPhone,
    contactWhatsApp,
    contactTelegram,
    contactNote,
    showName,
  } = await req.json();

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      username,
      name,
      phone,
      bio,
      locale,
      currency,
      avatarUrl,
      contactPhone,
      contactWhatsApp,
      contactTelegram,
      contactNote,
      // ✅ 新增：写入 showName（布尔值）
      showName,
    },
    select: {
      id: true,
      username: true,
      name: true,
      phone: true,
      bio: true,
      locale: true,
      currency: true,
      avatarUrl: true,
      // ✅ 返回给前端，方便后续使用
      contactPhone: true,
      contactWhatsApp: true,
      contactTelegram: true,
      contactNote: true,
      showName: true,
    },
  });

  return NextResponse.json({ user: updated });
}

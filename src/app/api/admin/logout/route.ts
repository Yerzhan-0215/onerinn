// src/app/api/admin/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { ADMIN_COOKIE_NAME } from '@/lib/adminSession';

export async function POST() {
  // 统一使用 cookieStore 变量名，逻辑和原来完全一致
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  // 如果有 sessionId，就尝试在数据库里删除这条 AdminSession
  if (sessionId) {
    try {
      await prisma.adminSession.delete({
        where: { id: sessionId },
      });
    } catch {
      // 如果记录已经不存在，就忽略错误
    }
  }

  // 无论如何都把浏览器里的管理员 cookie 清空
  cookieStore.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0, // 立即过期
  });

  return NextResponse.json({ ok: true });
}

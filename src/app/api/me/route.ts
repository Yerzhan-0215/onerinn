// src/app/api/me/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

// 与 /api/logout 保持一致
const COOKIE_NAMES = [
  'onerinn_session',
  'session',
  'auth_token',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

// 单例 prisma（避免 dev 热重载创建过多连接）
const prisma = (globalThis as any).__prisma ?? new PrismaClient();
if (!(globalThis as any).__prisma) (globalThis as any).__prisma = prisma;

function json(data: any, init?: number | ResponseInit) {
  const res = NextResponse.json(
    data,
    typeof init === 'number' ? { status: init } : init,
  );
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

export async function GET() {
  const jar = await cookies();

  // 依次尝试读取候选 cookie，取到第一个非空值
  let token: string | undefined;
  for (const name of COOKIE_NAMES) {
    const c = jar.get(name);
    if (c?.value) {
      token = c.value;
      break;
    }
  }

  // 没有会话 Cookie => 明确未登录
  if (!token) return json({ user: null }, { status: 401 });

  const secret = process.env.JWT_SECRET;
  if (!secret) return json({ user: null }, { status: 401 });

  try {
    const payload = jwt.verify(token, secret) as any;

    // ✅ 这里增加对 uid / userId / sub 的兼容
    const uidRaw =
      payload.uid || payload.userId || payload.sub || '';
    const uid = String(uidRaw || '');

    if (!uid) return json({ user: null }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: uid },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        // ✅ 让前端拿到卖家验证状态
        sellerVerificationStatus: true,
      },
    });

    if (!user) return json({ user: null }, { status: 401 });

    return json({ user }, { status: 200 });
  } catch {
    // TokenExpiredError / JsonWebTokenError 等统一视为未登录
    return json({ user: null }, { status: 401 });
  }
}

// src/app/api/login/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma'; // ✅ 仅用共享单例

const COOKIE_NAME = 'onerinn_session';
const isProd = process.env.NODE_ENV === 'production';

// 统一 JSON 返回；允许传 number 或 ResponseInit
function json(data: any, init?: number | ResponseInit) {
  const resInit: ResponseInit | undefined =
    typeof init === 'number' ? { status: init } : init;
  return NextResponse.json(data, resInit);
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function looksLikePhone(v: string) {
  return /^[+()\d\s-]{6,}$/.test(v);
}
function normalizePhone(input: string) {
  const digits = input.replace(/[\s()-]/g, '');
  if (!/^\+?\d{6,}$/.test(digits)) return input;
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('8')) return '+7' + digits.slice(1); // 8XXXXXXXXXX → +7XXXXXXXXXX
  if (digits.startsWith('7')) return '+7' + digits.slice(1); // 7XXXXXXXXXX → +7XXXXXXXXXX
  return '+' + digits;
}

export async function GET() {
  return new NextResponse('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'POST' },
  });
}

export async function POST(req: Request) {
  const debug: Record<string, any> = {};
  try {
    const body = await req.json().catch(() => ({}));
    const identity: string | undefined =
      body.identity ??
      body.emailOrPhoneOrUsername ??
      body.emailOrPhone ??
      body.email ??
      body.username ??
      body.phone;

    const password: string | undefined = body.password;

    if (!identity || !password) {
      return json({ code: 'REQUIRED_FIELDS' }, 400);
    }

    debug.identity = identity;

    // —— 分步查库（email → phone → username）——
    let user: any = null;

    if (isEmail(identity)) {
      user = await prisma.user.findFirst({ where: { email: identity } });
      debug.step = 'email';
    }

    if (!user && looksLikePhone(identity)) {
      const raw = identity;
      const compact = identity.replace(/[\s()-]/g, '');
      const normalized = normalizePhone(identity);
      user = await prisma.user.findFirst({
        where: { OR: [{ phone: normalized }, { phone: compact }, { phone: raw }] },
      });
      debug.step = 'phone';
    }

    if (!user) {
      // 仅当前两种都没命中时再尝试用户名
      try {
        user = await prisma.user.findFirst({
          where: { username: { equals: identity, mode: 'insensitive' } },
        });
        debug.step = 'username';
      } catch (e) {
        // 若模型没有 username 字段，这里不影响整体流程
        debug.usernameQueryError = (e as Error).message;
      }
    }

    if (!user || !user.password) {
      return json({ code: 'INVALID_CREDENTIALS' }, 401);
    }

    // —— 校验密码 —— //
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return json({ code: 'INVALID_CREDENTIALS' }, 401);
    }

    // —— 签发 JWT —— //
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return json({ code: 'SERVER_MISCONFIGURED' }, 500);
    }

    const token = jwt.sign(
      {
        uid: user.id,
        email: user.email ?? null,
        phone: user.phone ?? null,
        username: user.username ?? null,
        avatarUrl: user.avatarUrl ?? null,
      },
      secret,
      { expiresIn: '7d' }
    );

    const res = json({ ok: true, ...(isProd ? {} : { debug }) }, 200);
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 天
    });
    return res;
  } catch (e) {
    console.error('Login error:', e);
    return json(
      isProd ? { code: 'UNKNOWN_ERROR' } : { code: 'UNKNOWN_ERROR', error: String(e) },
      500
    );
  }
}

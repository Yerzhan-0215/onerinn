// src/app/api/login/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma'; // ✅ 共享单例

const COOKIE_NAME = 'onerinn_session';
const isProd = process.env.NODE_ENV === 'production';

// 统一 JSON 返回；允许传 number 或 ResponseInit
function json(data: any, init?: number | ResponseInit) {
  const resInit: ResponseInit | undefined =
    typeof init === 'number' ? { status: init } : init;
  return NextResponse.json(data, resInit);
}

// —— 助手 —— //
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

// 明确只允许 POST 登录
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

    // 登录时：允许用 email / phone / username / login 等任一字段
    const rawIdentity: string | undefined =
      body.identity ??
      body.emailOrPhoneOrUsername ??
      body.emailOrPhone ??
      body.email ??
      body.username ??
      body.phone;

    const password: string | undefined = body.password;

    if (!rawIdentity || !password) {
      return json({ code: 'REQUIRED_FIELDS' }, 400);
    }

    if (password.length < 6) {
      // 保留你原来的限制 & 错误码
      return json({ code: 'PASSWORD_TOO_SHORT' }, 400);
    }

    const identity = rawIdentity.trim();
    debug.identity = identity;

    // —— 1) 按邮箱 / 手机 / 用户名 分步查库 —— //
    let user: any = null;

    // 1. email
    if (isEmail(identity)) {
      const email = identity.toLowerCase(); // ✅ 统一小写
      user = await prisma.user.findFirst({ where: { email } });
      debug.step = 'email';
    }

    // 2. phone
    if (!user && looksLikePhone(identity)) {
      const raw = identity;
      const compact = identity.replace(/[\s()-]/g, '');
      const normalized = normalizePhone(identity);
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: normalized },
            { phone: compact },
            { phone: raw },
          ],
        },
      });
      debug.step = 'phone';
    }

    // 3. username (case-insensitive)
    if (!user) {
      try {
        user = await prisma.user.findFirst({
          where: {
            username: {
              equals: identity,
              mode: 'insensitive',
            },
          },
        });
        debug.step = 'username';
      } catch (e) {
        debug.usernameQueryError = (e as Error).message;
      }
    }

    // ✅ 新增：如果账号存在并且已被管理员封禁，直接拒绝登录
    if (user && user.isBlocked) {
      return json(
        {
          code: 'BLOCKED',
          message:
            'Ваш аккаунт заблокирован администратором Onerinn. Если вы считаете, что это ошибка, свяжитесь со службой поддержки.',
        },
        403,
      );
    }

    if (!user || !user.password) {
      return json({ code: 'INVALID_CREDENTIALS' }, 401);
    }

    // —— 2) 校验密码 —— //
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return json({ code: 'INVALID_CREDENTIALS' }, 401);
    }

    // —— 3) 生成 JWT + 设置 Cookie —— //
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return json({ code: 'SERVER_MISCONFIGURED' }, 500);
    }

    // ✅ payload 里增加 userId，不影响现有 uid
    const payload = {
      uid: user.id,
      userId: user.id,
      email: user.email ?? null,
      phone: user.phone ?? null,
      username: user.username ?? null,
      avatarUrl: user.avatarUrl ?? null,
    };

    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    const res = json(
      { ok: true, ...(isProd ? {} : { debug }) },
      200,
    );

    // 1) 原来的 session token（给 /api/me 使用）
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 天
    });

    // 2) 新增：写入 userId，给 /api/profile/verification 等使用
    res.cookies.set('userId', String(user.id), {
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
      isProd
        ? { code: 'UNKNOWN_ERROR' }
        : { code: 'UNKNOWN_ERROR', error: String(e), debug },
      500,
    );
  }
}

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

const COOKIE_NAME = 'onerinn_session';

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
  const digits = String(input).replace(/[\s()-]/g, '');
  if (!/^\+?\d{6,}$/.test(digits)) return String(input);
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('8')) return '+7' + digits.slice(1);
  if (digits.startsWith('7')) return '+7' + digits.slice(1);
  return '+' + digits;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const username: string | undefined =
      body.username ?? body.name ?? body.login;
    const rawIdentity: string | undefined =
      body.identity ??
      body.email ??
      body.phone ??
      body.emailOrPhone ??
      body.emailOrPhoneOrUsername;
    const password: string | undefined = body.password;

    if (!username?.trim() || !rawIdentity?.trim() || !password) {
      return json({ code: 'REQUIRED_FIELDS' }, 400);
    }
    if (password.length < 6) {
      return json({ code: 'PASSWORD_TOO_SHORT' }, 400);
    }

    const identity = rawIdentity.trim();

    // 去重：邮箱
    if (isEmail(identity)) {
      const email = identity.toLowerCase();
      const exists = await prisma.user.findFirst({ where: { email } });
      if (exists) return json({ code: 'EMAIL_EXISTS' }, 409);
    }
    // 去重：手机号（多种格式）
    if (looksLikePhone(identity)) {
      const raw = identity;
      const compact = identity.replace(/[\s()-]/g, '');
      const normalized = normalizePhone(identity);
      const exists = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: normalized },
            { phone: compact },
            { phone: raw },
          ],
        },
      });
      if (exists) return json({ code: 'PHONE_EXISTS' }, 409);
    }
    // 去重：用户名（不区分大小写）
    try {
      const u = await prisma.user.findFirst({
        where: { username: { equals: username, mode: 'insensitive' } },
      });
      if (u) return json({ code: 'USERNAME_EXISTS' }, 409);
    } catch {}

    // 组装入库数据
    const hashed = await bcrypt.hash(password, 10);
    const data: Prisma.UserCreateInput = {
      username,
      password: hashed,
      email: isEmail(identity) ? identity.toLowerCase() : undefined,
      phone: looksLikePhone(identity) ? normalizePhone(identity) : undefined,
    };

    const user = await prisma.user.create({
      data,
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
      },
    });

    // 是否自动登录（保持你原有逻辑）
    const autoLogin =
      process.env.AUTO_LOGIN_AFTER_REGISTER === '1';
    if (autoLogin) {
      const secret = process.env.JWT_SECRET;
      if (secret) {
        // ✅ 这里补充 uid / userId，兼容 /api/me
        const payload = {
          uid: user.id,
          userId: user.id,
          username: user.username ?? null,
          email: user.email ?? null,
          phone: user.phone ?? null,
        };

        const token = jwt.sign(payload, secret, {
          expiresIn: '7d',
        });

        const res = json({ ok: true, userId: user.id }, 201);

        // JWT cookie（原有功能）
        res.cookies.set(COOKIE_NAME, token, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });

        // ✅ 额外：简单 userId cookie，给 /api/profile/verification 等用
        res.cookies.set('userId', user.id, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });

        return res;
      }
    }

    // 不自动登录时：保持原返回
    return json({ ok: true, userId: user.id }, 201);
  } catch (e) {
    console.error('[register] error:', e);
    return json({ code: 'UNKNOWN_ERROR' }, 500);
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const SESSION_COOKIE_NAME = 'onerinn_session';
const isProd = process.env.NODE_ENV === 'production';

function json(data: any, init?: number | ResponseInit) {
  return NextResponse.json(data, typeof init === 'number' ? { status: init } : init);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let { email = '', phone = '', username = '', password = '' }
      : { email?: string; phone?: string; username?: string; password?: string } = body || {};

    email = (email || '').trim();
    phone = (phone || '').trim();
    username = (username || '').trim();

    if (!email && !phone) return json({ message: 'Введите e-mail или телефон' }, 400);
    if (!password) return json({ message: 'Введите пароль' }, 400);

    const emailOrNull = email || null;
    const phoneOrNull = phone || null;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          emailOrNull ? { email: emailOrNull } : undefined,
          phoneOrNull ? { phone: phoneOrNull } : undefined,
        ].filter(Boolean) as any,
      },
    });

    let user = existingUser;

    if (user) {
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return json({ message: 'Неверный пароль' }, 401);
    } else {
      if (!username) {
        if (emailOrNull) {
          username = emailOrNull.split('@')[0];
        } else if (phoneOrNull) {
          const digits = phoneOrNull.replace(/\D/g, '');
          username = `user_${digits.slice(-4) || Math.random().toString(36).slice(2, 6)}`;
        } else {
          username = `user_${Math.random().toString(36).slice(2, 8)}`;
        }
      }
      const hashed = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: { username, email: emailOrNull, phone: phoneOrNull, password: hashed },
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) return json({ code: 'SERVER_MISCONFIGURED' }, 500);

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

    // ★ Next 15：不要直接 cookies().set；需要先 await
    const jar = await cookies();
    jar.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,   // 仅生产开启
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    const res = json({ ok: true }, 200);
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (err) {
    console.error(err);
    return json({ message: 'Server error' }, 500);
  }
}

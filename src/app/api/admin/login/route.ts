// src/app/api/admin/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs'; // 和用户登录保持一致，用 bcryptjs
import { prisma } from '@/lib/prisma';
import { ADMIN_COOKIE_NAME } from '@/lib/adminSession';

// session 过期时间（30 天）
const SESSION_AGE_MS = 1000 * 60 * 60 * 24 * 30;

export async function POST(req: Request) {
  try {
    // 兼容多种字段名：login / email / username
    const body = await req.json().catch(() => ({}));

    const rawLogin: string | undefined =
      body.login ?? body.email ?? body.username;

    const password: string | undefined = body.password;

    // 和前端保持一致：检查 login / password
    if (!rawLogin?.trim() || !password) {
      return NextResponse.json(
        { message: 'Введите логин и пароль' },
        { status: 400 },
      );
    }

    const login = rawLogin.trim();

    // 可以用 email 或 username 登录；只查激活的管理员
    const admin = await prisma.admin.findFirst({
      where: {
        isActive: true,
        OR: [{ email: login }, { username: login }],
      },
    });

    if (!admin) {
      console.warn('[admin login] Admin not found for login =', login);
      return NextResponse.json(
        { message: 'Администратор не найден' },
        { status: 401 },
      );
    }

    if (!admin.passwordHash) {
      console.error(
        '[admin login] passwordHash is empty for admin id =',
        admin.id,
      );
      return NextResponse.json(
        { message: 'Неверный пароль' },
        { status: 401 },
      );
    }

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      console.warn('[admin login] Wrong password for admin id =', admin.id);
      return NextResponse.json(
        { message: 'Неверный пароль' },
        { status: 401 },
      );
    }

    // 创建 session：30 天有效期
    const expiresAt = new Date(Date.now() + SESSION_AGE_MS);

    const session = await prisma.adminSession.create({
      data: {
        adminId: admin.id,
        expiresAt,
      },
    });

    // 设置管理员 cookie（名字用 ADMIN_COOKIE_NAME，和 getCurrentAdmin / logout 完全一致）
    const jar = await cookies();
    jar.set({
      name: ADMIN_COOKIE_NAME,
      value: session.id,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_AGE_MS / 1000,
    });

    return NextResponse.json({
      ok: true,
      admin: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error('Admin login error', err);
    return NextResponse.json(
      { message: 'Внутренняя ошибка' },
      { status: 500 },
    );
  }
}

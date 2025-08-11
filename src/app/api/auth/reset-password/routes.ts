import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

function json(data: any, init?: number | ResponseInit) {
  const resInit: ResponseInit | undefined =
    typeof init === 'number' ? { status: init } : init;
  return NextResponse.json(data, resInit);
}

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json().catch(() => ({}));
    if (!token || typeof token !== 'string' || !password || typeof password !== 'string') {
      return json({ code: 'REQUIRED_FIELDS' }, 400);
    }
    if (password.length < 6) {
      return json({ code: 'PASSWORD_TOO_SHORT' }, 400);
    }

    // 1) 找 token（你的模型没有 usedAt，所以不检查该字段）
    const rec = await prisma.passwordResetToken.findUnique({
      where: { token }, // 若改为 hash，这里替换为 tokenHash
    });
    if (!rec) return json({ code: 'BAD_TOKEN' }, 400);
    if (rec.expiresAt && rec.expiresAt <= new Date()) {
      return json({ code: 'TOKEN_EXPIRED' }, 400);
    }
    if (!rec.email) {
      return json({ code: 'BAD_TOKEN' }, 400);
    }

    // 2) 找用户
    const user = await prisma.user.findFirst({ where: { email: rec.email } });
    if (!user) return json({ code: 'BAD_TOKEN' }, 400);

    // 3) 更新密码
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    // 4) 一次性使用：直接删除该 token（你的表没有 usedAt）
    await prisma.passwordResetToken.delete({ where: { token: rec.token } });

    return json({ ok: true });
  } catch (e) {
    console.error('[reset-password] error:', e);
    return json({ code: 'UNKNOWN_ERROR' }, 500);
  }
}

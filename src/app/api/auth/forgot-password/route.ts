import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateToken } from '@/lib/tokens';
import { sendResetEmail } from '@/lib/mail';

// —— 工具函数 —— //
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
  if (digits.startsWith('8')) return '+7' + digits.slice(1);
  if (digits.startsWith('7')) return '+7' + digits.slice(1);
  return '+' + digits;
}

// 让第二个参数既可传 400 也可传 {status:400}
function json(data: any, init?: number | ResponseInit) {
  const resInit: ResponseInit | undefined =
    typeof init === 'number' ? { status: init } : init;
  return NextResponse.json(data, resInit);
}

export async function POST(req: Request) {
  try {
    const { identity, locale } = await req.json().catch(() => ({}));
    if (!identity || typeof identity !== 'string') {
      return json({ ok: true });
    }

    // 1) 定位用户（邮箱 → 电话 → 用户名）
    let user: any = null;

    if (isEmail(identity)) {
      user = await prisma.user.findFirst({ where: { email: identity.toLowerCase() } });
    }
    if (!user && looksLikePhone(identity)) {
      const raw = identity;
      const compact = identity.replace(/[\s()-]/g, '');
      const normalized = normalizePhone(identity);
      user = await prisma.user.findFirst({
        where: { OR: [{ phone: normalized }, { phone: compact }, { phone: raw }] },
      });
    }
    if (!user) {
      try {
        user = await prisma.user.findFirst({
          where: { username: { equals: identity, mode: 'insensitive' } },
        });
      } catch {}
    }

    // 2) 找不到或无邮箱 → 仍返回 ok:true
    if (!user || !user.email) {
      await new Promise((r) => setTimeout(r, 300));
      return json({ ok: true });
    }
    const userEmail = String(user.email).toLowerCase();

    // 3) 清理该邮箱下旧的、未过期的 token（注意：你的模型没有 usedAt 字段）
    await prisma.passwordResetToken.deleteMany({
      where: { email: userEmail, expiresAt: { gt: new Date() } },
    });

    // 4) 生成并保存新 token（60 分钟）
    const token = generateToken(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60min
    await prisma.passwordResetToken.create({
      data: {
        token,          // 若你改成存 hash，把字段换成 tokenHash
        email: userEmail,
        expiresAt,
      },
    });

    // 5) 发送邮件（如要多语言页面，可换成 `/${locale || 'ru'}/reset-password`）
    const base = process.env.APP_URL || 'http://localhost:3000';
    const resetUrl = `${base}/reset-password?token=${encodeURIComponent(token)}`;
    await sendResetEmail(userEmail, resetUrl);

    return json({ ok: true });
  } catch (e) {
    console.error('[forgot-password] error:', e);
    return json({ ok: true }); // 生产环境建议仍然 200
  }
}

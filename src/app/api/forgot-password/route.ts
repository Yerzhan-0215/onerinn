// src/app/api/forgot-password/route.ts
import { NextResponse } from 'next/server';
import { createToken } from '@/lib/resetTokens';
import { allow } from '@/lib/rateLimiter';

// 简易判断邮箱
function looksLikeEmail(v: string) {
  return /\S+@\S+\.\S+/.test(v);
}

export async function POST(req: Request) {
  try {
    const { emailOrPhone, locale } = await req.json();

    // —— 频控（内存版）——
    const ip = getIP(req) || 'unknown';
    // 同一 IP：1 分钟最多 10 次
    if (!allow(`ip:${ip}`, 10, 60_000)) {
      return NextResponse.json({ ok: true }); // 仍返回 200，防止探测
    }
    // 同一账号：15 分钟最多 3 次
    if (emailOrPhone && !allow(`acct:${emailOrPhone}`, 3, 15 * 60_000)) {
      return NextResponse.json({ ok: true });
    }

    if (!emailOrPhone || typeof emailOrPhone !== 'string') {
      return NextResponse.json({ ok: true });
    }

    // 1) 这里原本应查库是否存在该用户；为了防探测，继续生成 token 并发送（即使不存在）
    const token = createToken(emailOrPhone, 30 * 60_000); // 30min

    // 2) 组装链接（生产用你的正式域名）
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const link = `${baseUrl}/${(locale || 'en')}/reset-password?token=${token}`;

    // 3) 发送邮件或短信（占位）
    if (looksLikeEmail(emailOrPhone)) {
      console.log('[forgot-password] send email to:', emailOrPhone, 'link:', link);
      // TODO: 发送邮件（nodemailer 或第三方）
    } else {
      console.log('[forgot-password] send sms to:', emailOrPhone, 'link:', link);
      // TODO: 发送短信
    }

    // 统一返回成功
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

function getIP(req: Request) {
  const h = (name: string) => req.headers.get(name) || '';
  return h('x-forwarded-for').split(',')[0].trim() || h('x-real-ip') || '';
}

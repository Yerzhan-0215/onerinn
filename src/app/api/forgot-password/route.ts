import { NextResponse } from 'next/server';
import { createToken } from '@/lib/resetTokens';
import { allow } from '@/lib/rateLimiter';
import nodemailer from 'nodemailer';

/**
 * 简易判断是否为邮箱
 */
function looksLikeEmail(v: string) {
  return /\S+@\S+\.\S+/.test(v);
}

/**
 * 提取客户端 IP（兼容 Vercel/NGINX）
 */
function getIP(req: Request) {
  const h = (name: string) => req.headers.get(name) || '';
  return (
    h('x-forwarded-for').split(',')[0].trim() ||
    h('x-real-ip') ||
    ''
  );
}

export async function POST(req: Request) {
  try {
    const { emailOrPhone, locale } = await req.json();

    if (!emailOrPhone || typeof emailOrPhone !== 'string') {
      return NextResponse.json({ ok: true });
    }

    // —— 🧠 限流防刷（内存版）——
    const ip = getIP(req) || 'unknown';

    // 同一 IP：1 分钟最多 10 次
    if (!allow(`ip:${ip}`, 10, 60_000)) {
      console.warn(`[rate-limit] blocked IP ${ip}`);
      return NextResponse.json({ ok: true });
    }

    // 同一账号：15 分钟最多 3 次
    if (!allow(`acct:${emailOrPhone}`, 3, 15 * 60_000)) {
      console.warn(`[rate-limit] blocked account ${emailOrPhone}`);
      return NextResponse.json({ ok: true });
    }

    // —— 🧩 生成 token —— //
    const token = createToken(emailOrPhone, 30 * 60_000); // 30分钟有效

    // —— 🌍 构造重置链接 —— //
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000');

    const link = `${baseUrl}/${locale || 'ru'}/reset-password?token=${token}`;

    // —— 📧 发送邮件或短信 —— //
    if (looksLikeEmail(emailOrPhone)) {
      // ✅ 使用 nodemailer 发邮件（需要配置 .env）
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"Onerinn Support" <${process.env.SMTP_USER}>`,
          to: emailOrPhone,
          subject: 'Восстановление пароля — Onerinn',
          html: `
            <p>Здравствуйте!</p>
            <p>Чтобы восстановить пароль, перейдите по ссылке ниже:</p>
            <p><a href="${link}" target="_blank">${link}</a></p>
            <p>Ссылка будет действовать 30 минут.</p>
            <p>Если вы не запрашивали восстановление, просто проигнорируйте это письмо.</p>
            <br/>
            <p>С уважением,<br/>Команда Onerinn</p>
          `,
        });

        console.log(`[MAIL] Password reset email sent to ${emailOrPhone}`);
      } catch (mailErr) {
        console.error('[MAIL_ERROR]', mailErr);
      }
    } else {
      // ✅ 预留短信接口位置
      console.log(`[SMS] Password reset link for ${emailOrPhone}: ${link}`);
      // TODO: интеграция с SMS API (Kaspi SMS, Twilio и т.д.)
    }

    // —— ✅ 返回统一成功 —— //
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[FORGOT_PASSWORD_ERROR]', err);
    return NextResponse.json({ ok: true });
  }
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// 环境变量中配置的发件邮箱（需你在 .env 中设置）
const EMAIL_FROM = process.env.EMAIL_FROM || 'your@email.com';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: 'Email обязателен' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
  }

  // 生成随机 token
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 30); // 30分钟有效期

  // 将 token 保存到数据库中（可以扩展你的 user 表结构，或创建单独 token 表）
  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expires,
    },
  });

  // 邮件链接（假设你有 /reset-password 页面）
  const resetLink = `http://localhost:3000/reset-password?token=${token}`;

  // 配置邮件服务（使用你自己的 SMTP 信息）
  const transporter = nodemailer.createTransport({
    service: 'gmail', // 或者"Yandex"、"Mail.ru"等
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  // 发送邮件
  await transporter.sendMail({
    from: EMAIL_FROM,
    to: email,
    subject: 'Сброс пароля',
    html: `
      <p>Здравствуйте, ${user.name || 'пользователь'}!</p>
      <p>Нажмите на ссылку ниже, чтобы сбросить пароль:</p>
      <a href="${resetLink}">Сбросить пароль</a>
      <p>Ссылка действительна 30 минут.</p>
    `,
  });

  return NextResponse.json({ message: 'Ссылка отправлена' });
}

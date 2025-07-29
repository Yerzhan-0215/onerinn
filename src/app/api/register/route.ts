import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email, phone, password } = body;

    if (!username || (!email && !phone) || !password) {
      console.warn('[REGISTER_WARNING] Incomplete data:', body);
      return NextResponse.json({ error: 'Данные не полные' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 检查用户是否已存在（通过邮箱或电话）
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : undefined,
          phone ? { phone } : undefined,
        ].filter(Boolean),
      },
    });

    if (existingUser) {
      console.warn('[REGISTER_WARNING] User already exists:', { email, phone });
      return NextResponse.json(
        { error: 'Пользователь уже существует' },
        { status: 400 }
      );
    }

    // 创建新用户
    const newUser = await prisma.user.create({
      data: {
        username,
        email: email || undefined,
        phone: phone || undefined,
        password: hashedPassword,
      },
    });

    console.log('[REGISTER_SUCCESS]', newUser.id);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[REGISTER_ERROR]', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

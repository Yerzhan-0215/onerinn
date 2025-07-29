import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Недопустимые данные' }, { status: 400 });
    }

    // 查找重置 token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Недействительный или просроченный токен' }, { status: 400 });
    }

    // 哈希新密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 更新用户密码
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // 删除已用 token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return NextResponse.json({ message: 'Пароль успешно обновлен' });
  } catch (error) {
    console.error('Ошибка сброса пароля:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

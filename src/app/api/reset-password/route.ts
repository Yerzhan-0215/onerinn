// src/app/api/reset-password/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    // 1) 基础校验
    if (
      !token ||
      typeof token !== 'string' ||
      !password ||
      typeof password !== 'string'
    ) {
      return NextResponse.json(
        { ok: false, code: 'BAD_REQUEST', error: 'Некорректные данные' },
        { status: 400 }
      );
    }

    // 2) 密码强度简单校验（你要更严格，后面可以加字母+数字混合等）
    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, code: 'PASSWORD_TOO_SHORT', error: 'Пароль слишком короткий' },
        { status: 400 }
      );
    }

    // 3) 在数据库中查找这个 token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      // 没有找到这个 token
      return NextResponse.json(
        { ok: false, code: 'TOKEN_NOT_FOUND', error: 'Ссылка недействительна или уже использована' },
        { status: 400 }
      );
    }

    // 4) 检查是否过期
    if (resetToken.expiresAt < new Date()) {
      // 过期后顺便删掉
      await prisma.passwordResetToken.delete({
        where: { token },
      });

      return NextResponse.json(
        { ok: false, code: 'TOKEN_EXPIRED', error: 'Ссылка для сброса устарела, запросите новую' },
        { status: 400 }
      );
    }

    // 5) 找到对应的用户
    // 我们在表里存的是 email（你之前的 forgot-password 就是按 email 存的）
    // 但也可能你未来把手机号也存在这里，所以这里兼容一下
    const identifier = resetToken.email;

    const user =
      (await prisma.user.findUnique({
        where: { email: identifier },
      })) ||
      (await prisma.user.findUnique({
        where: { phone: identifier },
      }));

    if (!user) {
      // 极少见：有 token 但用户没了
      // 这里我们也可以删掉 token，避免以后重复使用
      await prisma.passwordResetToken.delete({
        where: { token },
      });

      return NextResponse.json(
        { ok: false, code: 'USER_NOT_FOUND', error: 'Пользователь не найден' },
        { status: 400 }
      );
    }

    // 6) 把新密码做 bcrypt 哈希
    const hashed = await bcrypt.hash(password, 10);

    // 7) 更新用户密码
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
      },
    });

    // 8) 用完的 token 删除掉，防止重复用
    await prisma.passwordResetToken.delete({
      where: { token },
    });

    // 9) 返回成功
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[RESET_PASSWORD_ERROR]', e);
    return NextResponse.json(
      { ok: false, code: 'UNKNOWN', error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

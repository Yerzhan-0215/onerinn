// src/app/api/login-register/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, phone, password } = await req.json();

    if (!password || (!email && !phone)) {
      return NextResponse.json({ message: 'Missing credentials.' }, { status: 400 });
    }

    // 1. 查找是否存在用户
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : undefined,
          phone ? { phone } : undefined,
        ].filter(Boolean),
      },
    });

    // 2. 如果存在 → 登录
    if (existingUser) {
      const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
      if (!isPasswordCorrect) {
        return NextResponse.json({ message: 'Incorrect password.' }, { status: 401 });
      }
      return NextResponse.json({ message: 'Login successful', userId: existingUser.id });
    }

    // 3. 不存在 → 注册
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: email || null,
        phone: phone || null,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: 'Registered successfully', userId: newUser.id });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

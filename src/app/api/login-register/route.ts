import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // ✅ 使用命名导入
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  const body = await req.json();
  const { email, phone, name, password } = body;

  let existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: email || undefined },
        { phone: phone || undefined }
      ]
    }
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(password, 10);

    existingUser = await prisma.user.create({
      data: {
        email,
        phone,
        name,
        password: hashedPassword
      }
    });
  }

  const cookieStore = await cookies(); // ✅ await cookies()

  cookieStore.set('userId', String(existingUser.id), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/'
  });

  return NextResponse.json({ message: 'Login/Register successful' });
}
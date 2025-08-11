// src/app/api/reset-password/route.ts
import { NextResponse } from 'next/server';
import { verifyAndUseToken } from '@/lib/resetTokens';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json({ ok: false, code: 'BAD_REQUEST' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ ok: false, code: 'PASSWORD_TOO_SHORT' }, { status: 400 });
    }

    const result = verifyAndUseToken(token);
    if (!result.ok) {
      // NOT_FOUND / USED / EXPIRED
      return NextResponse.json({ ok: false, code: result.reason }, { status: 400 });
    }

    const emailOrPhone = result.emailOrPhone;

    // TODO: 在这里真正重置密码（查用户并设置新密码哈希）
    // if (looksLikeEmail(emailOrPhone)) { find by email } else { find by phone }
    // await db.user.update({ where: ..., data: { passwordHash: hash(password) } });

    console.log('[reset-password] set new password for:', emailOrPhone);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, code: 'UNKNOWN' }, { status: 500 });
  }
}

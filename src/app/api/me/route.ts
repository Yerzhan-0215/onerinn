import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

function json(data: any, init?: number | ResponseInit) {
  return NextResponse.json(data, init);
}

function getBearer(req: Request): string | null {
  const auth = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!auth) return null;
  const [scheme, token] = auth.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

export async function GET(req: Request) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return json({ code: 'SERVER_MISCONFIGURED' }, { status: 500 });

    // 1) 优先 Authorization Bearer；2) 其次 HttpOnly cookie
    let token = getBearer(req);
    if (!token) {
      const cookieHeader = req.headers.get('cookie') || '';
      const m = cookieHeader.match(/(?:^|;\s*)onerinn_session=([^;]+)/);
      token = m ? decodeURIComponent(m[1]) : null;
    }
    if (!token) return json({ code: 'NO_TOKEN' }, { status: 401 });

    const payload = jwt.verify(token, secret) as any; // 会抛错则走 catch
    const uid = String(payload.uid);

    const user = await prisma.user.findUnique({
      where: { id: uid },
      select: { id: true, username: true, email: true, phone: true, avatarUrl: true, createdAt: true, updatedAt: true }
    });
    if (!user) return json({ code: 'USER_NOT_FOUND' }, { status: 401 });

    return json({ user }, { status: 200 });
  } catch (e: any) {
    if (e?.name === 'TokenExpiredError') return json({ code: 'TOKEN_EXPIRED' }, { status: 401 });
    return json({ code: 'UNAUTHORIZED' }, { status: 401 });
  }
}

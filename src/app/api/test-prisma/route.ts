import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  const user = await db.user.findFirst();
  return NextResponse.json({ ok: true, user });
}

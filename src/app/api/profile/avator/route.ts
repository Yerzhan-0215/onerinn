import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const form = await req.formData();
  const url = (form.get('url') as string | null)?.trim();
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

  await prisma.user.update({ where: { id: session.user.id }, data: { avatarUrl: url } });
  return NextResponse.json({ ok: true });
}

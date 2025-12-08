import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: { artwork: { select: { id: true, title: true, status: true } } },
    orderBy: { id: 'desc' },
  });
  return NextResponse.json({ items: rows });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { artworkId } = await req.json();
  if (!artworkId) return NextResponse.json({ error: 'Missing artworkId' }, { status: 400 });

  await prisma.favorite.create({ data: { userId: session.user.id, artworkId } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { artworkId } = await req.json();
  if (!artworkId) return NextResponse.json({ error: 'Missing artworkId' }, { status: 400 });

  await prisma.favorite.delete({ where: { userId_artworkId: { userId: session.user.id, artworkId } } });
  return NextResponse.json({ ok: true });
}

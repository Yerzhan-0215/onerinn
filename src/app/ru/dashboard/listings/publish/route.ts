// src/app/api/dashboard/listings/publish/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // 1) 读取当前登录用户
    const jar = await cookies();
    const userId = jar.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 2) 解析 body，拿到 listing id
    const body = await req.json().catch(() => null);
    const listingId = body?.id as string | undefined;

    if (!listingId) {
      return NextResponse.json(
        { error: 'MISSING_ID' },
        { status: 400 }
      );
    }

    // 3) 检查卖家是否通过 верификация
    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: { sellerVerificationStatus: true },
    });

    if (!me || me.sellerVerificationStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'SELLER_NOT_VERIFIED' },
        { status: 403 }
      );
    }

    // 4) 查找这条公告是否属于当前用户
    // ⚠️ 如果你的模型不是 Artwork，请把 prisma.artwork 改成实际的模型名
    const listing = await prisma.artwork.findFirst({
      where: {
        id: listingId,
        ownerId: userId, // 如果你字段叫 userId / authorId，请相应改这里
      },
      select: { id: true, status: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'LISTING_NOT_FOUND' },
        { status: 404 }
      );
    }

    // 5) 如果已经是 published，就直接返回 ok（幂等）
    if (listing.status === 'published') {
      return NextResponse.json({ ok: true });
    }

    // 6) 更新 статус → published
    await prisma.artwork.update({
      where: { id: listingId },
      data: {
        status: 'published',
        updatedAt: new Date(),
      },
    });

    // 前端 handlePublishClick 里，如果没有 items 字段，会自动重新拉一次列表
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('/api/dashboard/listings/publish error', e);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

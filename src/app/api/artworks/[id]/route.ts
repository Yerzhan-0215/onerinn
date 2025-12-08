// src/app/api/artworks/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import { cookies } from 'next/headers';

/**
 * 统一获取当前用户 ID（用于“卖家本人查看 / 编辑”）
 * - 先从 next-auth session 取
 * - 再从 /api/me 兜底
 *
 * NOTE: 必须 await cookies() 再使用其值，避免 Next.js 报错
 */
async function getCurrentUserId(req: Request) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    const sid = session?.user?.id ?? session?.id;
    if (typeof sid === 'string') return sid;
  } catch {}

  try {
    const origin = new URL(req.url).origin;
    const jar = await cookies();
    const cookieHeader = jar.toString();

    const res = await fetch(`${origin}/api/me`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });

    if (res.ok) {
      const raw = (await res.json().catch(() => ({}))) as any;
      const id = raw?.user?.id ?? raw?.id ?? raw?.data?.id ?? null;
      if (typeof id === 'string') return id;
    }
  } catch {}

  return null;
}

/**
 * GET /api/artworks/:id
 * 返回单个作品详情
 *
 * 使用规则：
 * - 买家 / 访客：只能看到 lifecycleStatus === 'ACTIVE' 的作品
 * - 卖家本人（登录）：即使不是 ACTIVE，也可以在后台编辑页看到详情
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;

    if (!id) {
      return NextResponse.json({ ok: false, error: 'MISSING_ID' }, { status: 400 });
    }

    const currentUserId = await getCurrentUserId(req);

    const art = await prisma.artwork.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        title: true,
        artist: true,
        description: true,
        style: true,
        size: true,
        forSale: true,
        salePriceKzt: true,
        forRent: true,
        rentPerDayKzt: true,
        rentPerWeekKzt: true,
        rentPerMonthKzt: true,
        price: true,
        status: true,
        category: true,
        condition: true,
        quantity: true,
        coverUrl: true,
        location: true,
        district: true,
        location_country: true,
        location_city: true,
        location_district: true,
        specs: true,
        pricing: true,
        acquisition: true,
        lifecycleStatus: true,
        createdAt: true,
        updatedAt: true,
        biz: true,
        owner: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
            contactPhone: true,
            contactWhatsApp: true,
            contactTelegram: true,
            contactNote: true,
            showName: true,
          },
        },
      },
    });

    if (!art) {
      return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
    }

    const isOwner = currentUserId && art.ownerId === currentUserId;

    if (!isOwner && art.lifecycleStatus !== 'ACTIVE') {
      return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
    }

    const serialized = {
      ...art,
      price: art.price ? Number(art.price) : null,
      biz: art.biz ?? 'art',
    };

    return NextResponse.json({ ok: true, item: serialized }, { status: 200 });
  } catch (err) {
    console.error('Error in GET /api/artworks/[id]:', err);
    return NextResponse.json({ ok: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}

/**
 * PUT /api/artworks/:id
 * 卖家在编辑页面保存修改
 * 以及“Мои объявления → Опубликовать”时，仅更新 status
 *
 * 只允许作品所有者本人更新
 */
export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { id } = await ctx.params;

  try {
    const body = (await req.json()) as any;
    const {
      title,
      price,
      status,
      description,
      category,
      condition,
      quantity,
      coverUrl,
      biz,
      salePriceKzt,
      forSale,
      forRent,
      rentPerDayKzt,
      rentPerWeekKzt,
      rentPerMonthKzt,
      location,
      district,
      location_country,
      location_city,
      location_district,
      specs,
      pricing,
      acquisition,
      mediaUrls,
    } = body;

    const isStatusOnlyUpdate =
      status !== undefined &&
      title === undefined &&
      price === undefined &&
      description === undefined &&
      category === undefined &&
      condition === undefined &&
      quantity === undefined &&
      coverUrl === undefined &&
      biz === undefined &&
      salePriceKzt === undefined &&
      forSale === undefined &&
      forRent === undefined &&
      rentPerDayKzt === undefined &&
      rentPerWeekKzt === undefined &&
      rentPerMonthKzt === undefined &&
      location === undefined &&
      district === undefined &&
      location_country === undefined &&
      location_city === undefined &&
      location_district === undefined &&
      specs === undefined &&
      pricing === undefined &&
      acquisition === undefined &&
      mediaUrls === undefined;

    const exists = await prisma.artwork.findFirst({
      where: { id, ownerId: userId },
      select: { id: true },
    });

    if (!exists) {
      return NextResponse.json({ error: 'NOT_FOUND_OR_FORBIDDEN' }, { status: 404 });
    }

    // 仅更新 status
    if (isStatusOnlyUpdate) {
      const safeStatus = status === 'published' ? 'published' : 'draft';
      const updated = await prisma.artwork.update({
        where: { id },
        data: { status: safeStatus },
        select: { id: true, title: true, status: true },
      });
      return NextResponse.json({ ok: true, item: updated }, { status: 200 });
    }

    // 完整编辑
    if (!title || String(title).trim().length < 1) {
      return NextResponse.json({ error: 'TITLE_REQUIRED' }, { status: 400 });
    }

    let priceDecimal: Prisma.Decimal | null = null;
    if (price !== undefined && price !== null && String(price) !== '') {
      const num = Number(price);
      if (!isFinite(num) || num < 0) {
        return NextResponse.json({ error: 'PRICE_INVALID' }, { status: 400 });
      }
      priceDecimal = new Prisma.Decimal(num);
    }

    const safeStatus = status === 'published' ? 'published' : 'draft';
    const bizSafe = biz === 'electronic' ? 'electronic' : 'art';

    const updated = await prisma.artwork.update({
      where: { id },
      data: {
        title: String(title),
        price: priceDecimal ?? undefined,
        status: safeStatus,
        description: description ?? null,
        category: category ?? null,
        condition: condition ?? null,
        quantity: typeof quantity === 'number' ? quantity : undefined,
        coverUrl:
          coverUrl ?? (Array.isArray(mediaUrls) && mediaUrls.length > 0 ? mediaUrls[0] : undefined),
        biz: bizSafe,
        salePriceKzt: typeof salePriceKzt === 'number' ? salePriceKzt : undefined,
        forSale: typeof forSale === 'boolean' ? forSale : undefined,
        forRent: typeof forRent === 'boolean' ? forRent : undefined,
        rentPerDayKzt: typeof rentPerDayKzt === 'number' ? rentPerDayKzt : undefined,
        rentPerWeekKzt: typeof rentPerWeekKzt === 'number' ? rentPerWeekKzt : undefined,
        rentPerMonthKzt: typeof rentPerMonthKzt === 'number' ? rentPerMonthKzt : undefined,
        location: location ?? undefined,
        district: district ?? undefined,
        location_country: location_country ?? undefined,
        location_city: location_city ?? undefined,
        location_district: location_district ?? undefined,
        specs: specs ?? undefined,
        pricing: pricing ?? undefined,
        acquisition: acquisition ?? undefined,
      } as any,
      select: { id: true, title: true },
    });

    return NextResponse.json({ ok: true, item: updated }, { status: 200 });
  } catch (e) {
    console.error('[PUT /api/artworks/[id]]', e);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}

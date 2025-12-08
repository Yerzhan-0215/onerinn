// src/app/api/artworks/list/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/artworks/list
 *
 * 查询参数：
 * - mode: "all" | "sale" | "rent"   → 只看出售 / 只看出租 / 全部
 * - limit: number                   → 返回条数，默认 30，最多 100
 * - city: string                    → 按城市筛选（location 包含该字符串，忽略大小写）
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const mode = searchParams.get('mode') as 'all' | 'sale' | 'rent' | null;
    const limitParam = searchParams.get('limit');
    const limit = Math.min(Math.max(Number(limitParam || 30), 1), 100);

    const city = searchParams.get('city')?.trim() || null;

    // 基础查询条件：只拿“未删除”的、正常生命周期的作品
    const where: any = {
      lifecycleStatus: 'ACTIVE',
    };

    // 根据 mode 限制出售/出租
    if (mode === 'sale') {
      where.forSale = true;
    } else if (mode === 'rent') {
      where.forRent = true;
    }

    // ★ 按城市模糊筛选（location ILIKE '%city%'）
    if (city) {
      where.location = {
        contains: city,
        mode: 'insensitive',
      };
    }

    const artworks = await prisma.artwork.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        ownerId: true,
        title: true,
        artist: true,
        description: true,
        style: true,
        size: true,

        // 出售 / 租赁字段
        forSale: true,
        salePriceKzt: true,
        forRent: true,
        rentPerDayKzt: true,
        rentPerWeekKzt: true,
        rentPerMonthKzt: true,

        // 旧字段（兼容你之前的逻辑）
        price: true,
        status: true,
        category: true,
        condition: true,
        quantity: true,
        coverUrl: true,

        // ★ 新增：城市 + 区
        location: true,
        district: true,

        lifecycleStatus: true,
        createdAt: true,
        updatedAt: true,

        // 🟦 新增：所有者信息（用于列表页 “Продавец” 展示）
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

    // ⚠️ Prisma 的 Decimal 不能直接用在 JSON 里，我们把 price 转成 number 或 null
    const serialized = artworks.map((art) => ({
      ...art,
      price: art.price ? Number(art.price) : null,
    }));

    return NextResponse.json(
      { ok: true, items: serialized },
      { status: 200 },
    );
  } catch (err) {
    console.error('Error in GET /api/artworks/list:', err);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}

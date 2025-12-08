// src/app/api/rentals/list/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/rentals/list
 *
 * 查询参数：
 * - limit: number → 返回条数，默认 30，最多 100
 * - city: string  → 按城市筛选（location 包含该字符串，忽略大小写）
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const limitParam = searchParams.get('limit');
    const limit = Math.min(Math.max(Number(limitParam || 30), 1), 100);

    const city = searchParams.get('city')?.trim() || null;

    const where: any = {
      isActive: true,
      status: 'AVAILABLE',
    };

    // ★ 城市筛选
    if (city) {
      where.location = {
        contains: city,
        mode: 'insensitive',
      };
    }

    const rentals = await prisma.rentalItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        ownerId: true,
        title: true,
        category: true,
        brand: true,
        modelName: true,

        // 描述 / 状态（原来就有的）
        description: true,
        condition: true,

        // 价格
        rentPerDayKzt: true,
        rentPerWeekKzt: true,
        rentPerMonthKzt: true,
        depositKzt: true,

        // 展示
        coverUrl: true,

        // ★ 城市 + 区
        location: true,
        district: true,

        status: true,
        createdAt: true,
        updatedAt: true,

        // ✅ 新增：出租方（卖家）信息（不影响原有字段）
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

    return NextResponse.json(
      { ok: true, items: rentals },
      { status: 200 },
    );
  } catch (err) {
    console.error('Error in GET /api/rentals/list:', err);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}

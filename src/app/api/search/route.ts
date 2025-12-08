// src/app/api/search/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();

    if (!q || q.length < 1) {
      return NextResponse.json({ results: [] });
    }

    // 并行搜索 artwork 和 rentalItem（保留你原有的搜索条件与 take 限制）
    const [artworks, rentals] = await Promise.all([
      prisma.artwork.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { category: { contains: q, mode: 'insensitive' } },
            { artist: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),

      prisma.rentalItem.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { brand: { contains: q, mode: 'insensitive' } },
            { modelName: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
    ]);

    // 保持原有返回结构，但对每条结果做防守式规范化：
    // - 确保有 id, title, coverUrl, category
    // - 为 artwork 提供 biz 字段（默认 'art'）
    // - 为 rentalItem 提供 biz 字段（我们把租赁的电子类视为 'electronic'）
    // - 仍然保留原始 item 的其它字段（不删）
    const normalizedArtworks = artworks.map((item: any) => {
      const bizRaw = item?.biz ?? 'art';
      const biz = typeof bizRaw === 'string' && bizRaw.toLowerCase() === 'electronic' ? 'electronic' : 'art';

      return {
        // 保留原始数据（spread）以兼容现有前端，如果前端只读取某些字段，则这些字段仍然可用
        ...item,
        type: 'artwork' as const,
        biz,
        coverUrl: item?.coverUrl ?? null,
        category: item?.category ?? null,
      };
    });

    const normalizedRentals = rentals.map((item: any) => {
      // rentalItem 属于租赁商品，业务上我们把它视作 electronic 类（如果未来有其它 biz，请再扩展）
      const biz = 'electronic';

      return {
        ...item,
        type: 'rental' as const,
        biz,
        // rentalItem 使用 coverUrl / coverUrl 可能不存在，保持兼容字段 coverUrl 与 category
        coverUrl: item?.coverUrl ?? item?.cover_url ?? null,
        category: item?.category ?? null,
      };
    });

    return NextResponse.json({
      results: [...normalizedArtworks, ...normalizedRentals],
    });
  } catch (error) {
    console.error('Search API error', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

// /src/app/api/artworks/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { cookies } from 'next/headers';

// ✅ 统一：next-auth -> /api/me；对 session 与 json 显式断言为 any，避免 TS 报错
async function getCurrentUserId(req: Request) {
  try {
    const session = (await getServerSession(authOptions as any)) as any; // 👈
    const sid = session?.user?.id ?? session?.id;
    if (typeof sid === 'string') return sid;
  } catch {}
  try {
    const origin = new URL(req.url).origin;
    const res = await fetch(`${origin}/api/me`, {
      headers: { cookie: cookies().toString() },
      cache: 'no-store',
    });
    if (res.ok) {
      const raw = (await res.json().catch(() => ({}))) as any; // 👈
      const id = raw?.user?.id ?? raw?.id ?? raw?.data?.id ?? null;
      if (typeof id === 'string') return id;
    }
  } catch {}
  return null;
}

type MediaInput = { url: string; type?: string } | string;

export async function POST(req: Request) {
  const userId = await getCurrentUserId(req);
  if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  try {
    const body = await req.json();

    // ⭐ 这里把 biz / type 也解构出来
    const {
      title,
      price,
      status,
      description,
      category,
      condition,
      quantity,
      coverUrl,
      mediaUrls,

      // 允许前端直接传 biz，也兼容只传 type=electronic 的情况
      biz,
      type,
    } = body as {
      title?: string;
      price?: number | string;
      status?: string;
      description?: string;
      category?: string;
      condition?: string;
      quantity?: number;
      coverUrl?: string;
      mediaUrls?: MediaInput[];

      biz?: string;
      type?: string;
    };

    if (!title || String(title).trim().length < 1) {
      return NextResponse.json({ error: 'TITLE_REQUIRED' }, { status: 400 });
    }

    let priceDecimal: Prisma.Decimal = new Prisma.Decimal(0);
    if (price !== undefined && price !== null && String(price) !== '') {
      const num = Number(price);
      if (!isFinite(num) || num < 0) {
        return NextResponse.json({ error: 'PRICE_INVALID' }, { status: 400 });
      }
      priceDecimal = new Prisma.Decimal(num);
    }
    const safeStatus = status === 'published' ? 'published' : 'draft';

    const mediaNormalized =
      Array.isArray(mediaUrls)
        ? mediaUrls
            .map((m) =>
              typeof m === 'string'
                ? {
                    url: m,
                    type: m.match(/\.(mp4|mov|webm)$/i) ? 'video' : 'image',
                  }
                : { url: m.url, type: m.type ?? 'image' },
            )
            .filter((x) => !!x.url)
        : [];

    // ⭐ 统一处理业务线：默认 art，如果前端传了 biz/type = electronic，就记为 electronic
    const rawBiz = (biz ?? type ?? 'art') as string;
    const safeBiz =
      typeof rawBiz === 'string' && rawBiz.toLowerCase() === 'electronic'
        ? 'electronic'
        : 'art';

    const created = await prisma.artwork.create({
      // 为避免本地 Prisma 类型缓存未刷新导致的报错，这里做一次 any 断言（运行无影响）
      data: {
        ownerId: userId,
        title: String(title),
        price: priceDecimal,
        status: safeStatus,

        // ⭐ 新增：把 biz 写入数据库
        biz: safeBiz,

        description: description ?? null,
        category: category ?? null,
        condition: condition ?? null,
        quantity: typeof quantity === 'number' ? quantity : 1,
        coverUrl:
          coverUrl ??
          (mediaNormalized.find((m) => m.type === 'image')?.url ?? null),
        media: mediaNormalized.length
          ? {
              createMany: {
                data: mediaNormalized.map((m, i) => ({
                  url: m.url,
                  type: m.type ?? 'image',
                  order: i,
                })),
              },
            }
          : undefined,
      } as any,
      select: { id: true, title: true },
    });

    return NextResponse.json({ ok: true, item: created }, { status: 201 });
  } catch (e) {
    console.error('[POST /api/artworks]', e);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}

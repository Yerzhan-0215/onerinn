// /src/app/api/dashboard/listings/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';

// ✅ 统一且安全的 getCurrentUserId（await cookies()）
async function getCurrentUserId(req: Request) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    const sid = session?.user?.id ?? session?.id;
    if (typeof sid === 'string') return sid;
  } catch {}

  try {
    const origin = new URL(req.url).origin;

    // 必须 await cookies() 再使用
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

// 列表
export async function GET(req: Request) {
  const userId = await getCurrentUserId(req);
  if (!userId) return NextResponse.json({ items: [] }, { status: 200 });

  // 这里 select/返回做了 any 断言以绕开本地 Prisma 类型缓存未刷新
  const artworks = (await prisma.artwork.findMany({
    where: { ownerId: userId },
    select: {
      id: true,
      title: true,
      status: true,
      price: true,
      updatedAt: true,
      coverUrl: true,
      category: true,
      quantity: true,

      // ⭐ 新增：把 biz 从数据库查出来
      biz: true,

      media: {
        select: { url: true, type: true, order: true },
        orderBy: { order: 'asc' },
        take: 1,
      },
    } as any,
    orderBy: { updatedAt: 'desc' },
    take: 50,
  })) as any[];

  const items = artworks.map((a) => {
    // ⭐ 安全处理 biz，兼容 null / undefined / 大写
    const rawBiz = (a.biz ?? 'art') as string;
    const bizSlug =
      typeof rawBiz === 'string' && rawBiz.toLowerCase() === 'electronic'
        ? 'electronic'
        : 'art';

    return {
      id: a.id,
      title: a.title,
      status: a.status,
      pricePerDay: a.price ? Number(a.price) : null,
      updatedAt: a.updatedAt.toISOString(),
      mode: undefined as string | undefined,

      // ⭐ 把真实的 biz 传给前端（列表“Категория бизнеса”和编辑链接都会用到）
      biz: bizSlug as 'art' | 'electronic',

      coverUrl: a.coverUrl ?? a.media?.[0]?.url ?? null,
      category: a.category ?? null,
      quantity: a.quantity ?? null,
    };
  });

  return NextResponse.json({ items }, { status: 200 });
}

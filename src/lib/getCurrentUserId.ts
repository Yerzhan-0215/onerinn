// src/lib/getCurrentUserId.ts
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * 统一的 getCurrentUserId helper
 * - 优先使用 next-auth session
 * - 回退到 /api/me（带 cookie header）
 * - 一定会 await cookies()，避免 Next.js 的同步 API 警告
 */
export async function getCurrentUserId(req: Request): Promise<string | null> {
  // 1) try next-auth session
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    const sid = session?.user?.id ?? session?.id;
    if (typeof sid === 'string') return sid;
  } catch (e) {
    // ignore
  }

  // 2) fallback to /api/me using cookies()
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
  } catch (e) {
    // ignore
  }

  return null;
}

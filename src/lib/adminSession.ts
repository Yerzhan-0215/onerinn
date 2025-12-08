// src/lib/adminSession.ts
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * 获取当前管理员 session（示例 helper）
 * - 优先使用 next-auth session（如果你用 next-auth 管理管理员会话）
 * - 否则回退到 /api/me 或其它管理端点（同样 await cookies() 再使用）
 *
 * 返回示例：{ id: string, email?: string, username?: string } | null
 */
export async function getAdminSession(req: Request): Promise<any | null> {
  // try next-auth session first
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (session?.user) {
      // 你可以根据实际 session shape 调整返回字段
      return {
        id: session.user.id ?? session.id ?? null,
        email: session.user.email ?? null,
        username: session.user.username ?? session.user.name ?? null,
        raw: session,
      };
    }
  } catch (e) {
    // ignore
  }

  // fallback to /api/me (or an admin-specific endpoint) using cookies()
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
      const admin = raw?.user ?? raw?.data ?? raw ?? null;
      if (admin && (admin.id || admin.email)) {
        return {
          id: admin.id ?? null,
          email: admin.email ?? null,
          username: admin.username ?? admin.name ?? null,
          raw: admin,
        };
      }
    }
  } catch (e) {
    // ignore
  }

  return null;
}

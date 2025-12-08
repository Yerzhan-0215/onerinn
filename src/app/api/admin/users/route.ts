// src/app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { ADMIN_COOKIE_NAME } from '@/lib/adminSession';

// 审核动作
type UserAction = 'block' | 'unblock';

// 统一 JSON 返回工具（和别的 API 保持风格一致）
function json(data: any, init?: number | ResponseInit) {
  const resInit: ResponseInit | undefined =
    typeof init === 'number' ? { status: init } : init;
  return NextResponse.json(data, resInit);
}

function forbidden() {
  return json({ ok: false, error: 'FORBIDDEN' }, 403);
}

type AdminContext = {
  id: string;
  email: string | null;
  username: string | null;
  role: string | null;
};

/**
 * 真正的管理员校验：
 * - 读取 ADMIN_COOKIE_NAME
 * - 找到 AdminSession
 * - 检查是否过期 & 管理员是否 active
 */
async function ensureAdmin(): Promise<AdminContext | null> {
  const jar = await cookies();
  const sessionId = jar.get(ADMIN_COOKIE_NAME)?.value;
  if (!sessionId) return null;

  const session = await prisma.adminSession.findUnique({
    where: { id: sessionId },
    include: { admin: true },
  });

  if (!session || !session.admin) return null;

  if (session.expiresAt && session.expiresAt < new Date()) {
    return null;
  }

  const admin = session.admin;
  if (!admin.isActive || admin.role !== 'ADMIN') {
    return null;
  }

  return {
    id: admin.id,
    email: admin.email,
    username: admin.username,
    role: admin.role,
  };
}

/**
 * GET /api/admin/users
 *
 * 兼容原有用法：
 *   /api/admin/users?search=...&role=USER|ADMIN&take=100
 *
 * 新增能力（不破坏原功能）：
 *   - blocked=all|active|blocked  按封禁状态过滤
 *   - page, pageSize               分页（可选）
 *
 * 如果提供 page + pageSize，则使用分页；
 * 否则保持老逻辑：只用 take 参数（默认 100）。
 */
export async function GET(req: Request) {
  const admin = await ensureAdmin();
  if (!admin) return forbidden();

  const url = new URL(req.url);
  const search = url.searchParams.get('search')?.trim() || '';
  const role = url.searchParams.get('role') || 'ALL';

  // ★ 新增：封禁状态过滤（all / active / blocked）
  const blocked = url.searchParams.get('blocked') || 'all';

  // ★ 新增：分页参数（可选）
  const takeParam = url.searchParams.get('take');
  const pageParam = url.searchParams.get('page');
  const pageSizeParam = url.searchParams.get('pageSize');

  let skip = 0;
  let take: number;
  let page: number | undefined;
  let pageSize: number | undefined;

  if (pageParam && pageSizeParam) {
    // 如果提供了 page + pageSize，则启用分页逻辑
    const rawPage = parseInt(pageParam, 10);
    const rawPageSize = parseInt(pageSizeParam, 10);

    page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    let size =
      Number.isFinite(rawPageSize) && rawPageSize > 0 ? rawPageSize : 20;

    // 控制分页大小范围（1 ~ 500）
    size = Math.min(Math.max(size, 1), 500);

    pageSize = size;
    take = size;
    skip = (page - 1) * size;
  } else {
    // 兼容原有：仅用 take 参数，默认 100（不分页）
    const parsedTake = takeParam ? parseInt(takeParam, 10) : NaN;
    const fallback = Number.isFinite(parsedTake) && parsedTake > 0 ? parsedTake : 100;
    take = Math.min(Math.max(fallback, 1), 500);
    // skip 默认为 0
  }

  const where: any = {};

  if (role === 'USER' || role === 'ADMIN') {
    where.role = role;
  }

  // ★ 新增：根据 blocked 参数增加 isBlocked 过滤
  if (blocked === 'blocked') {
    where.isBlocked = true;
  } else if (blocked === 'active') {
    where.isBlocked = false;
  }

  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
          role: true,
          isBlocked: true,
          sellerVerificationStatus: true,
          createdAt: true,
        },
      }),
    ]);

    return json(
      {
        ok: true,
        total,
        users,
        // ★ 额外返回分页信息（旧代码不用它也不会报错）
        page,
        pageSize,
      },
      200,
    );
  } catch (e) {
    console.error('GET /api/admin/users error:', e);
    return json({ ok: false, error: 'INTERNAL_ERROR' }, 500);
  }
}

/**
 * POST /api/admin/users
 * body: { id: string, action: 'block' | 'unblock' }
 */
export async function POST(req: Request) {
  const admin = await ensureAdmin();
  if (!admin) return forbidden();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: 'INVALID_JSON' }, 400);
  }

  const id: string | undefined = body.id;
  const action: UserAction | undefined = body.action;

  if (!id || (action !== 'block' && action !== 'unblock')) {
    return json({ ok: false, error: 'INVALID_INPUT' }, 400);
  }

  const isBlocked = action === 'block';

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { isBlocked },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        isBlocked: true,
        sellerVerificationStatus: true,
        createdAt: true,
      },
    });

    return json(
      {
        ok: true,
        user: updated,
      },
      200,
    );
  } catch (e) {
    console.error('POST /api/admin/users error:', e);
    return json({ ok: false, error: 'INTERNAL_ERROR' }, 500);
  }
}

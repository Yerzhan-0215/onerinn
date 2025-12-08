// src/app/ru/admin/users/page.tsx
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/adminSession';
import { AdminUsersClient } from './AdminUsersClient';

type SearchParams = {
  search?: string;
  role?: string;
  // 封禁状态过滤参数（all / active / blocked）
  blocked?: string;
};

export default async function AdminUsersPage({
  searchParams,
}: {
  // ✅ Next 15: searchParams 是 Promise，需要先 await
  searchParams: Promise<SearchParams>;
}) {
  // 1. 校验管理员是否已登录（保留原有逻辑）
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect('/ru/admin/login');
  }

  // ✅ 先解析 searchParams
  const sp = await searchParams;

  const search = sp?.search?.trim() || '';
  const roleFilter = sp?.role || 'ALL';
  const blockedFilter = sp?.blocked || 'all';

  // 2. 查询用户数量 + 最近 100 个用户（带搜索 / 角色 / 封禁状态过滤）
  const where: any = {};

  if (roleFilter === 'USER' || roleFilter === 'ADMIN') {
    where.role = roleFilter;
  }

  if (blockedFilter === 'blocked') {
    where.isBlocked = true;
  } else if (blockedFilter === 'active') {
    where.isBlocked = false;
  }

  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [totalUsers, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100, // 仍然是最近 100 个
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

  // 3. 把首屏数据和当前过滤条件传给 Client 组件
  return (
    <AdminUsersClient
      initialUsers={users}
      initialTotal={totalUsers}
      initialSearch={search}
      initialRoleFilter={roleFilter}
      initialBlockedFilter={blockedFilter}
    />
  );
}

// src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/getCurrentUserId';

function startOfDayISO(d = new Date()) {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  return s;
}

export async function GET(req: Request) {
  // 权限：只允许登录用户访问（更严格应检查 isAdmin）
  const userId = await getCurrentUserId(req);
  if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  // 可选：检查用户角色是 admin / vip
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });

  // 基础统计
  const totalUsers = await prisma.user.count();
  const blockedUsers = await prisma.user.count({ where: { isBlocked: true } });

  // 活跃用户（今天有任何活动的用户） - 假设你在某处写入 lastActiveAt
  const todayStart = startOfDayISO();
  const activeUsersToday = await prisma.user.count({
    where: { updatedAt: { gte: todayStart } }, // 这里做近似：今天有更新的视为活跃
  });

  // 订单与收入（假设有 Order 模型；若没有，请替换为 payoutRequests 或 rental logs）
  // Order schema assumption: { id, amount, status, createdAt, sellerId }
  const ordersToday = await prisma.order.count({
    where: { createdAt: { gte: todayStart } },
  });

  // 收入聚合（当日/当周/当月）
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const sumDay = await prisma.order.aggregate({
    _sum: { amount: true },
    where: { createdAt: { gte: todayStart }, status: 'PAID' },
  });
  const sumWeek = await prisma.order.aggregate({
    _sum: { amount: true },
    where: { createdAt: { gte: weekStart }, status: 'PAID' },
  });
  const sumMonth = await prisma.order.aggregate({
    _sum: { amount: true },
    where: { createdAt: { gte: monthStart }, status: 'PAID' },
  });

  // 时间序列：近 30 天的收入（每日）
  const days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - (29 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const incomeSeries = await Promise.all(
    days.map(async (d) => {
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const agg = await prisma.order.aggregate({
        _sum: { amount: true },
        where: { createdAt: { gte: d, lt: next }, status: 'PAID' },
      });
      return { date: d.toISOString().slice(0, 10), amount: Number(agg._sum.amount ?? 0) };
    }),
  );

  return NextResponse.json({
    ok: true,
    data: {
      totalUsers,
      blockedUsers,
      activeUsersToday,
      ordersToday,
      revenueDay: Number(sumDay._sum.amount ?? 0),
      revenueWeek: Number(sumWeek._sum.amount ?? 0),
      revenueMonth: Number(sumMonth._sum.amount ?? 0),
      incomeSeries,
      role: user?.role ?? 'USER',
    },
  });
}

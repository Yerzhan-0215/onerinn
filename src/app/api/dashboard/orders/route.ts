// /src/app/api/dashboard/orders/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 先返回空列表，保证页面正常；等你加上 Order 模型后再实现查询
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] }, { status: 200 });
  }

  // TODO: 未来接入 prisma.order.findMany(...)
  return NextResponse.json({ items: [] }, { status: 200 });
}

// /src/app/api/dashboard/messages/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 先返回空对话；等你有 Dialog/Message 模型后再实现
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ dialogs: [] }, { status: 200 });
  }

  // TODO: 未来接入 prisma.dialog.findMany(...)
  return NextResponse.json({ dialogs: [] }, { status: 200 });
}

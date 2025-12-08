// src/app/api/admin/verification/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { ADMIN_COOKIE_NAME } from '@/lib/adminSession';

// 审核动作
type Action = 'approve' | 'reject';
type SellerVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

function forbidden() {
  return NextResponse.json(
    { ok: false, error: 'FORBIDDEN' },
    { status: 403 },
  );
}

// 为了以后可能需要用到 admin 信息，返回一个对象，而不是简单 true/false
type AdminContext = {
  id: string;
  email: string | null;
  username: string | null;
  role: string | null;
};

/**
 * 真正的管理员校验：
 * 1) 读取 ADMIN_COOKIE_NAME（admin_session）
 * 2) 在 AdminSession 表中找到对应记录
 * 3) 检查是否过期
 * 4) 检查 admin.isActive & role === 'ADMIN'
 *
 * 通过则返回 admin 信息，失败返回 null
 */
async function ensureAdmin(): Promise<AdminContext | null> {
  const jar = await cookies();
  const sessionId = jar.get(ADMIN_COOKIE_NAME)?.value;
  if (!sessionId) return null;

  const session = await prisma.adminSession.findUnique({
    where: { id: sessionId },
    include: {
      admin: true,
    },
  });

  if (!session || !session.admin) return null;

  // 过期检查
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
 * GET /api/admin/verification
 * 返回所有卖家验证请求 + 用户信息 + 简要的证件链接
 */
export async function GET() {
  const admin = await ensureAdmin();
  if (!admin) return forbidden();

  try {
    const items = await prisma.sellerVerification.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phone: true,
            name: true,
            // ✅ 带上用户的所有验证文档（包含 filename）
            documents: {
              select: {
                id: true,
                type: true,
                url: true,
                filename: true,
                uploadedAt: true,
              },
              orderBy: { uploadedAt: 'desc' },
            },
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      items,
    });
  } catch (err) {
    console.error('Error loading sellerVerification list:', err);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/verification
 * body: { id: string, action: 'approve' | 'reject', comment?: string }
 */
export async function POST(request: Request) {
  const admin = await ensureAdmin();
  if (!admin) return forbidden();

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'INVALID_JSON' },
      { status: 400 },
    );
  }

  const { id, action, comment } = body as {
    id?: string;
    action?: Action;
    comment?: string | null;
  };

  if (!id || (action !== 'approve' && action !== 'reject')) {
    return NextResponse.json(
      { ok: false, error: 'INVALID_INPUT' },
      { status: 400 },
    );
  }

  const status: SellerVerificationStatus =
    action === 'approve' ? 'APPROVED' : 'REJECTED';

  // 先做一个 trim 处理（这是在你原逻辑上的小增强）
  const cleanComment =
    typeof comment === 'string' && comment.trim()
      ? comment.trim()
      : null;

  try {
    // ✅ 先确认记录是否存在（更友好的 NOT_FOUND 错误）
    const existing = await prisma.sellerVerification.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    // ✅ 更新 SellerVerification
    // ✅ 同时同步 User.sellerVerificationStatus
    const updated = await prisma.sellerVerification.update({
      where: { id },
      data: {
        status,
        adminComment: cleanComment,
        user: {
          update: {
            sellerVerificationStatus: status, // ⬅️ 同步到 user 表
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phone: true,
            name: true,
            // ✅ 和 GET 一样，把 documents 一并返回
            documents: {
              select: {
                id: true,
                type: true,
                url: true,
                filename: true,
                uploadedAt: true,
              },
              orderBy: { uploadedAt: 'desc' },
            },
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      item: updated,
    });
  } catch (err) {
    console.error('Error updating sellerVerification:', err);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

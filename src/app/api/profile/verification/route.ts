// src/app/api/profile/verification/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// 前端使用的类型映射
type VerificationType = 'PERSON' | 'COMPANY';
type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type VerificationInfo = {
  type: VerificationType;
  status: VerificationStatus;
  fullName?: string | null;
  iin?: string | null;
  companyName?: string | null;
  bin?: string | null;
  comment?: string | null;
} | null;

// DB 枚举值
type SellerTypeDb = 'INDIVIDUAL' | 'COMPANY';
type SellerVerificationStatusDb = 'PENDING' | 'APPROVED' | 'REJECTED';

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: 'UNAUTHENTICATED' },
    { status: 401 },
  );
}

// 从 cookie 里拿当前 userId（与你其他 API 保持一致）
async function getCurrentUserId() {
  const jar = await cookies();
  const userId = jar.get('userId')?.value;
  return userId || null;
}

// DB → 前端类型映射
function mapDbToVerificationInfo(
  record: {
    type: SellerTypeDb | null;
    status: SellerVerificationStatusDb;
    fullName: string | null;
    companyName: string | null;
    iinOrBin: string | null;
    adminComment: string | null;
  } | null,
): VerificationInfo {
  if (!record) return null;

  const type: VerificationType =
    record.type === 'COMPANY' ? 'COMPANY' : 'PERSON';

  const isPerson = type === 'PERSON';
  const isCompany = type === 'COMPANY';

  return {
    type,
    status: record.status,
    fullName: isPerson ? record.fullName : null,
    iin: isPerson ? record.iinOrBin : null,
    companyName: isCompany ? record.companyName : null,
    bin: isCompany ? record.iinOrBin : null,
    comment: record.adminComment,
  };
}

/**
 * GET /api/profile/verification
 * - 有记录 → 200 + { ok: true, verification }
 * - 无记录 → 404 + { ok: false, error: 'NOT_FOUND' }
 */
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const record = await prisma.sellerVerification.findUnique({
    where: { userId },
  });

  if (!record) {
    return NextResponse.json(
      { ok: false, error: 'NOT_FOUND' },
      { status: 404 },
    );
  }

  const verification = mapDbToVerificationInfo(record);

  return NextResponse.json({
    ok: true,
    verification,
  });
}

/**
 * POST /api/profile/verification
 * - 前端 payload 来自你现有的 page.tsx：
 *   { type: 'PERSON' | 'COMPANY', fullName?, iin?, companyName?, bin?, comment? }
 * - 返回值符合 SaveResponse：
 *   { ok: true, verification } | { ok: false, error }
 */
export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'INVALID_JSON' },
      { status: 400 },
    );
  }

  const {
    type,
    fullName,
    iin,
    companyName,
    bin,
    comment,
  } = body as {
    type?: VerificationType;
    fullName?: string | null;
    iin?: string | null;
    companyName?: string | null;
    bin?: string | null;
    comment?: string | null;
  };

  // 简单校验：type 必须有值
  if (type !== 'PERSON' && type !== 'COMPANY') {
    return NextResponse.json(
      { ok: false, error: 'INVALID_TYPE' },
      { status: 400 },
    );
  }

  const sellerTypeDb: SellerTypeDb =
    type === 'COMPANY' ? 'COMPANY' : 'INDIVIDUAL';

  // 统一处理字符串：trim 后空串 → null
  const trimOrNull = (v: string | null | undefined) => {
    if (typeof v !== 'string') return null;
    const t = v.trim();
    return t.length ? t : null;
  };

  const fullNameClean = trimOrNull(fullName);
  const iinClean = trimOrNull(iin);
  const companyNameClean = trimOrNull(companyName);
  const binClean = trimOrNull(bin);
  const commentClean = trimOrNull(comment);

  // upsert：一个 userId 对应一条记录
  try {
    const record = await prisma.sellerVerification.upsert({
      where: { userId },
      create: {
        userId,
        type: sellerTypeDb,
        fullName: sellerTypeDb === 'INDIVIDUAL' ? fullNameClean : null,
        companyName: sellerTypeDb === 'COMPANY' ? companyNameClean : null,
        iinOrBin: sellerTypeDb === 'INDIVIDUAL' ? iinClean : binClean,
        // 每次提交都视为重新审核
        status: 'PENDING',
        // 暂时把用户备注塞在 adminComment 里（以后需要时可再拆分字段）
        adminComment: commentClean,
      },
      update: {
        type: sellerTypeDb,
        fullName: sellerTypeDb === 'INDIVIDUAL' ? fullNameClean : null,
        companyName: sellerTypeDb === 'COMPANY' ? companyNameClean : null,
        iinOrBin: sellerTypeDb === 'INDIVIDUAL' ? iinClean : binClean,
        status: 'PENDING',
        adminComment: commentClean,
      },
    });

    const verification = mapDbToVerificationInfo(record);

    return NextResponse.json({
      ok: true,
      verification,
    });
  } catch (err) {
    console.error('Error upserting sellerVerification:', err);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

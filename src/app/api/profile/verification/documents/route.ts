// src/app/api/profile/verification/documents/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

type DocType =
  | 'passport'        // Удостоверение личности / паспорт
  | 'id_card'         // Альтернативный документ личности
  | 'registration'    // Свидетельство о регистрации ТОО / ИП
  | 'address'         // Подтверждение адреса
  | 'other';          // Дополнительный документ

async function getCurrentUserId() {
  const jar = await cookies();
  const userId = jar.get('userId')?.value;
  return userId || null;
}

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: 'UNAUTHENTICATED' },
    { status: 401 },
  );
}

/**
 * GET /api/profile/verification/documents
 * 返回当前用户的所有证件（按上传时间倒序）
 */
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const docs = await prisma.verificationDocument.findMany({
    where: { userId },
    orderBy: { uploadedAt: 'desc' },
    select: {
      id: true,
      type: true,
      url: true,
      filename: true,
      uploadedAt: true,
    },
  });

  return NextResponse.json({
    ok: true,
    documents: docs,
  });
}

/**
 * POST /api/profile/verification/documents
 * 模拟“上传”一个证件：
 * body: { type: DocType, url: string, filename?: string }
 * 逻辑：
 *   - 同一 userId + type 先 deleteMany，再 create 1 条新的
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

  const { type, url, filename } = body as {
    type?: DocType;
    url?: string;
    filename?: string | null;
  };

  const allowedTypes: DocType[] = [
    'passport',
    'id_card',
    'registration',
    'address',
    'other',
  ];

  if (!type || !allowedTypes.includes(type)) {
    return NextResponse.json(
      { ok: false, error: 'INVALID_TYPE' },
      { status: 400 },
    );
  }

  if (!url || typeof url !== 'string' || !url.trim()) {
    return NextResponse.json(
      { ok: false, error: 'URL_REQUIRED' },
      { status: 400 },
    );
  }

  const cleanUrl = url.trim();
  const cleanFilename =
    typeof filename === 'string' && filename.trim()
      ? filename.trim()
      : null;

  try {
    // 同一 type 只保留一条最新的
    await prisma.verificationDocument.deleteMany({
      where: { userId, type },
    });

    const doc = await prisma.verificationDocument.create({
      data: {
        userId,
        type,
        url: cleanUrl,
        filename: cleanFilename,
      },
      select: {
        id: true,
        type: true,
        url: true,
        filename: true,
        uploadedAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      document: doc,
    });
  } catch (err) {
    console.error('Error saving verification document:', err);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

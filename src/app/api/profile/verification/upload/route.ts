// src/app/api/profile/verification/upload/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '@/lib/prisma';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_BASE_URL } from '@/lib/r2';

export const runtime = 'nodejs'; // 需要 Node 环境来处理文件

type DocType =
  | 'passport'
  | 'id_card'
  | 'registration'
  | 'address'
  | 'other';

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

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  if (!R2_BUCKET_NAME || !R2_PUBLIC_BASE_URL) {
    return NextResponse.json(
      {
        ok: false,
        error: 'R2_NOT_CONFIGURED',
      },
      { status: 500 },
    );
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json(
      { ok: false, error: 'INVALID_FORMDATA' },
      { status: 400 },
    );
  }

  const type = formData.get('type');
  const file = formData.get('file');

  const allowedTypes: DocType[] = [
    'passport',
    'id_card',
    'registration',
    'address',
    'other',
  ];

  if (!type || typeof type !== 'string' || !allowedTypes.includes(type as DocType)) {
    return NextResponse.json(
      { ok: false, error: 'INVALID_TYPE' },
      { status: 400 },
    );
  }

  if (!(file instanceof Blob)) {
    return NextResponse.json(
      { ok: false, error: 'FILE_REQUIRED' },
      { status: 400 },
    );
  }

  const docType = type as DocType;
  const fileName =
    (formData.get('filename') as string | null) ||
    (file as any).name ||
    'document';

  // 限制大小（例如 10MB）
  const fileSize = file.size;
  const MAX_SIZE = 10 * 1024 * 1024;
  if (fileSize > MAX_SIZE) {
    return NextResponse.json(
      { ok: false, error: 'FILE_TOO_LARGE' },
      { status: 400 },
    );
  }

  // 构造 R2 key
  const extMatch = fileName.match(/\.[a-zA-Z0-9]+$/);
  const ext = extMatch ? extMatch[0] : '';
  const key = `verification/${userId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}${ext}`;

  // 转为 Buffer
  const arrayBuffer = await file.arrayBuffer();
  const body = Buffer.from(arrayBuffer);

  try {
    // 上传到 R2
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: file.type || 'application/octet-stream',
      }),
    );

    const publicUrl = `${R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}`;

    // 同一 type 只保留一条最新的
    await prisma.verificationDocument.deleteMany({
      where: { userId, type: docType },
    });

    const doc = await prisma.verificationDocument.create({
      data: {
        userId,
        type: docType,
        url: publicUrl,
        filename: fileName,
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
    console.error('Error uploading to R2 or saving document:', err);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

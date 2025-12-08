// /src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ urls: [] }, { status: 200 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];
    for (const f of files) {
      if (!(f instanceof File)) continue;
      const bytes = Buffer.from(await f.arrayBuffer());
      const ext = (f.name?.match(/\.[a-z0-9]+$/i)?.[0] ?? '').toLowerCase();
      const fname = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext || ''}`;
      const target = path.join(uploadDir, fname);
      await writeFile(target, bytes);
      urls.push(`/uploads/${fname}`);
    }

    return NextResponse.json({ urls }, { status: 200 });
  } catch (e) {
    console.error('[POST /api/upload]', e);
    return NextResponse.json({ error: 'UPLOAD_FAILED' }, { status: 500 });
  }
}

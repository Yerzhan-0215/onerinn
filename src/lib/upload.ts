// /src/lib/upload.ts
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

export async function saveUploadedFile(file: File, destDir: string) {
  // 将 Next 的 File 转成 Buffer
  const arrayBuf = await file.arrayBuffer();
  const buf = Buffer.from(arrayBuf);

  // 生成安全文件名
  const ext = file.name.includes('.') ? file.name.split('.').pop() : '';
  const safeExt = ext ? `.${ext.toLowerCase()}` : '';
  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${safeExt}`;

  await ensureDir(destDir);
  const full = path.join(destDir, name);
  await fs.writeFile(full, buf);

  return { filename: name, fullPath: full };
}

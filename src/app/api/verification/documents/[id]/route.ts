// /src/app/api/verification/documents/[id]/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

function json(data: any, init?: number | ResponseInit) {
  const base = typeof init === "number" ? { status: init } : init ?? {};
  const headers = new Headers((base as ResponseInit).headers);
  if (!headers.has("Cache-Control")) headers.set("Cache-Control", "no-store");
  return NextResponse.json(data, { ...(base as ResponseInit), headers });
}

async function getUserId(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return token?.sub ?? null;
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserId(req);
  if (!userId) return json({ error: "Unauthorized" }, 401);

  const doc = await db.verificationDocument.findUnique({ where: { id: params.id } });
  if (!doc || doc.userId !== userId) return json({ error: "Not found" }, 404);

  // 删除文件
  if (doc.url?.startsWith("/uploads/verification/")) {
    const filePath = path.join(process.cwd(), "public", doc.url);
    try { await fs.unlink(filePath); } catch {}
  }

  await db.verificationDocument.delete({ where: { id: params.id } });
  return json({ ok: true });
}

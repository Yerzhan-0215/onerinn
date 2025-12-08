// /src/app/api/verification/documents/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "verification");
const ALLOWED = ["image/jpeg", "image/png", "application/pdf"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

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

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return json({ error: "Unauthorized" }, 401);
  const rows = await db.verificationDocument.findMany({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
  });
  return json({ data: rows });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return json({ error: "Unauthorized" }, 401);

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const type = (form.get("type") as string) || "other";
  if (!file) return json({ error: "No file" }, 400);
  if (file.size > MAX_SIZE) return json({ error: "File too large (10MB max)" }, 400);
  if (!ALLOWED.includes(file.type)) return json({ error: "Unsupported type" }, 400);

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const arr = new Uint8Array(await file.arrayBuffer());
  const ext =
    file.type === "image/jpeg" ? "jpg" :
    file.type === "image/png"  ? "png" :
    file.type === "application/pdf" ? "pdf" : "bin";
  const hash = crypto.createHash("sha1").update(arr).digest("hex").slice(0, 10);
  const filename = `${Date.now()}_${hash}.${ext}`;
  const dest = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(dest, arr);

  const url = `/uploads/verification/${filename}`;
  const saved = await db.verificationDocument.create({
    data: {
      userId,
      type,
      url,
      filename: file.name || filename,
      size: file.size,
      mimeType: file.type,
    },
  });

  return json({ ok: true, data: saved }, 201);
}

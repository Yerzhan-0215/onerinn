// /src/app/api/verification/seller/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import { z } from "zod";

/** 统一预处理：字符串 -> trim；空串 -> null */
const toNullableTrimmed = (v: unknown) => {
  if (typeof v === "string") {
    const t = v.trim();
    return t.length ? t : null;
  }
  return v;
};

const schema = z.object({
  iinBin: z
    .preprocess(toNullableTrimmed, z.string().min(8, "Введите ИИН/БИН"))
    .transform((s) => s.trim()),
  companyName: z.preprocess(toNullableTrimmed, z.string().nullable().optional()),
  country: z.preprocess(toNullableTrimmed, z.string().nullable().optional()),
  region: z.preprocess(toNullableTrimmed, z.string().nullable().optional()),
  city: z.preprocess(toNullableTrimmed, z.string().nullable().optional()),
  address: z.preprocess(toNullableTrimmed, z.string().nullable().optional()),
  postalCode: z.preprocess(toNullableTrimmed, z.string().nullable().optional()),
  contactName: z.preprocess(toNullableTrimmed, z.string().nullable().optional()),
  phone: z.preprocess(toNullableTrimmed, z.string().nullable().optional()),
  email: z.preprocess(
    toNullableTrimmed,
    z.string().email("Неверный email").nullable().optional()
  ),
});

/** 统一 JSON 响应（默认 no-store） */
function json(data: any, init?: number | ResponseInit) {
  const base: ResponseInit =
    typeof init === "number" ? { status: init } : init ?? {};
  const headers = new Headers(base.headers);
  if (!headers.has("Cache-Control")) headers.set("Cache-Control", "no-store");
  return NextResponse.json(data, { ...base, headers });
}

async function getUserId(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.sub) return null;
  return token.sub as string;
}

/** 读取当前用户的卖家信息 */
export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return json({ error: "Unauthorized" }, 401);

  const record = await db.userVerification.findUnique({ where: { userId } });
  return json({ data: record ?? null });
}

/** 新建或更新当前用户的卖家信息 */
export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return json({ error: "Unauthorized" }, 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const { fieldErrors, formErrors } = parsed.error.flatten();
    return json(
      {
        error: "Validation failed",
        details: { fieldErrors, formErrors },
      },
      400
    );
  }
  const d = parsed.data;

  const upserted = await db.userVerification.upsert({
    where: { userId },
    create: {
      userId,
      iinBin: d.iinBin,
      companyName: d.companyName ?? null,
      country: d.country ?? null,
      region: d.region ?? null,
      city: d.city ?? null,
      address: d.address ?? null,
      postalCode: d.postalCode ?? null,
      contactName: d.contactName ?? null,
      phone: d.phone ?? null,
      email: d.email ?? null,
      status: "PENDING",
    },
    update: {
      iinBin: d.iinBin,
      companyName: d.companyName ?? null,
      country: d.country ?? null,
      region: d.region ?? null,
      city: d.city ?? null,
      address: d.address ?? null,
      postalCode: d.postalCode ?? null,
      contactName: d.contactName ?? null,
      phone: d.phone ?? null,
      email: d.email ?? null,
      status: "PENDING",
    },
  });

  return json({ ok: true, data: upserted });
}

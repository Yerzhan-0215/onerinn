// /src/app/api/verification/seller/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { z } from "zod";

export const runtime = "nodejs";

const SellerType = z.enum(["INDIVIDUAL", "COMPANY"]);

const toNullable = (v: unknown) => {
  if (typeof v !== "string") return v;
  const t = v.trim();
  return t.length ? t : null;
};

const baseSchema = z.object({
  sellerType: SellerType,
  iinBin: z.preprocess(toNullable, z.string().min(8, "Введите ИИН/БИН")),
  // 个人
  fullName: z.preprocess(toNullable, z.string().nullable().optional()),
  // 公司
  companyName: z.preprocess(toNullable, z.string().nullable().optional()),
  legalAddress: z.preprocess(toNullable, z.string().nullable().optional()),
  actualAddress: z.preprocess(toNullable, z.string().nullable().optional()),
  // 通用非敏感地理
  country: z.preprocess(toNullable, z.string().nullable().optional()),
  region: z.preprocess(toNullable, z.string().nullable().optional()),
  city: z.preprocess(toNullable, z.string().nullable().optional()),
  district: z.preprocess(toNullable, z.string().nullable().optional()),
  // 联系方式
  contactName: z.preprocess(toNullable, z.string().nullable().optional()),
  phone: z.preprocess(toNullable, z.string().nullable().optional()),
  email: z.preprocess(toNullable, z.string().email("Неверный email").nullable().optional()),
});

const schema = baseSchema.superRefine((d, ctx) => {
  if (d.sellerType === "COMPANY") {
    if (!d.companyName) ctx.addIssue({ code: "custom", path: ["companyName"], message: "Укажите название компании" });
    if (!d.legalAddress) ctx.addIssue({ code: "custom", path: ["legalAddress"], message: "Укажите юридический адрес" });
    if (!d.actualAddress) ctx.addIssue({ code: "custom", path: ["actualAddress"], message: "Укажите фактический адрес" });
  } else {
    if (!d.fullName) ctx.addIssue({ code: "custom", path: ["fullName"], message: "Укажите ФИО" });
  }
});

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
  const record = await db.userVerification.findUnique({ where: { userId } });
  return json({ data: record ?? null });
}

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
    return json({ error: "Validation failed", details: { fieldErrors, formErrors } }, 400);
  }
  const d = parsed.data;

  const saved = await db.userVerification.upsert({
    where: { userId },
    create: {
      userId,
      sellerType: d.sellerType,
      iinBin: d.iinBin,
      fullName: d.fullName ?? null,
      companyName: d.companyName ?? null,
      legalAddress: d.legalAddress ?? null,
      actualAddress: d.actualAddress ?? null,
      country: d.country ?? null,
      region: d.region ?? null,
      city: d.city ?? null,
      district: d.district ?? null,
      contactName: d.contactName ?? null,
      phone: d.phone ?? null,
      email: d.email ?? null,
      status: "PENDING",
    },
    update: {
      sellerType: d.sellerType,
      iinBin: d.iinBin,
      fullName: d.fullName ?? null,
      companyName: d.companyName ?? null,
      legalAddress: d.legalAddress ?? null,
      actualAddress: d.actualAddress ?? null,
      country: d.country ?? null,
      region: d.region ?? null,
      city: d.city ?? null,
      district: d.district ?? null,
      contactName: d.contactName ?? null,
      phone: d.phone ?? null,
      email: d.email ?? null,
      status: "PENDING",
    },
  });

  return json({ ok: true, data: saved });
}

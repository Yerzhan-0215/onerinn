// /src/app/api/verification/bank/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { db } from "@/lib/prisma";

async function getUserId(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return token?.sub ?? null;
}

const payloadSchema = z
  .object({
    accountType: z.enum(["IBAN", "CARD"]),
    beneficiaryName: z.string().min(1, "Введите имя получателя"),
    iban: z.string().optional().nullable(),
    bankName: z.string().optional().nullable(),
    bic: z.string().optional().nullable(),
    cardNumber: z.string().optional().nullable(),
  })
  .superRefine((val, ctx) => {
    if (val.accountType === "IBAN") {
      const iban = (val.iban ?? "").trim();
      if (!iban) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["iban"], message: "Укажите IBAN" });
      } else if (!/^KZ[A-Z0-9]{18}$/i.test(iban.replace(/\s+/g, ""))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["iban"],
          message: "Некорректный IBAN (пример: KZ12 3456 7890 1234 5678)",
        });
      }
    } else {
      const card = (val.cardNumber ?? "").replace(/\s+/g, "");
      if (!/^\d{16}$/.test(card)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cardNumber"],
          message: "Введите 16-значный номер карты",
        });
      }
    }
  });

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await db.payoutAccount.findUnique({ where: { userId } });

  // 推断类型（用于前端回显）
  let accountType: "IBAN" | "CARD" | null = null;
  if (data?.accountNumber) {
    accountType = /^KZ/i.test(data.accountNumber) ? "IBAN" : "CARD";
  }

  return NextResponse.json({
    data: data
      ? {
          ...data,
          accountType,
          iban: accountType === "IBAN" ? data.accountNumber : null,
          cardNumber: accountType === "CARD" ? data.accountNumber : null,
        }
      : null,
  });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = payloadSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const d = parsed.data;

  const accountNumber =
    d.accountType === "IBAN"
      ? (d.iban ?? "").replace(/\s+/g, "").toUpperCase()
      : (d.cardNumber ?? "").replace(/\s+/g, "");

  const bankName = d.accountType === "IBAN" ? d.bankName ?? null : null;
  const bic = d.accountType === "IBAN" ? d.bic ?? null : null;

  const payloadToSave: any = {
    beneficiaryName: d.beneficiaryName,
    accountNumber,
    bankName,
    bic,
  };

  // ✅ 如果你的 schema 有 accountType 字段（enum AccountType），会被保存；
  // 如果暂时没有，加这一行会报错，就先删掉这两行。
  payloadToSave.accountType = d.accountType;

  const upserted = await db.payoutAccount.upsert({
    where: { userId },
    create: { userId, ...payloadToSave },
    update: payloadToSave,
  });

  return NextResponse.json({ ok: true, data: upserted });
}

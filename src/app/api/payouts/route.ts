import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/prisma";
import { z } from "zod";

// 获取当前登录用户 ID
async function getUserId(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return token?.sub ?? null;
}

// --- GET /api/payouts ---
// 我们给前端：
// {
//   balance: "0.00",
//   account: { beneficiaryName, accountNumber, bankName, bic } | null,
//   history: [ { id, amount, status, createdAt }, ... ]
// }
export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: 你以后可以算真实余额，比如根据订单/комиссия
  const balance = "0.00";

  // 取绑定的收款账号
  const account = await db.payoutAccount.findUnique({
    where: { userId },
    select: {
      beneficiaryName: true,
      accountNumber: true,
      bankName: true,
      bic: true,
    },
  });

  // 取最近的提现申请
  const history = await db.payoutRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      amount: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    balance,
    account,
    history,
  });
}

// --- POST /api/payouts ---
// 创建提现申请
// body: { amount: string }
const createSchema = z.object({
  amount: z
    .string()
    .min(1, "Укажите сумму")
    .refine((val) => {
      // валидируем что это положительное число
      const n = Number(val.replace(",", "."));
      return !isNaN(n) && n > 0;
    }, "Сумма должна быть больше 0"),
});

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { amount } = parsed.data;
  const amountNum = Number(amount.replace(",", "."));

  // 取 payoutAccount，快照写进申请，方便财务后面打款
  const account = await db.payoutAccount.findUnique({
    where: { userId },
  });

  if (!account || !account.accountNumber || !account.beneficiaryName) {
    return NextResponse.json(
      { error: "Сначала добавьте способ вывода (банковские реквизиты)" },
      { status: 400 }
    );
  }

  // 这里你可以做余额校验（balance >= amountNum），我们暂时不扣
  // TODO: реально сравнивать доступный баланс

  const created = await db.payoutRequest.create({
    data: {
      userId,
      amount: amountNum.toFixed(2),
      status: "PENDING",
      beneficiaryName: account.beneficiaryName ?? null,
      accountNumber: account.accountNumber ?? null,
      bankName: account.bankName ?? null,
      bic: account.bic ?? null,
    },
  });

  return NextResponse.json({ ok: true, requestId: created.id });
}

// /src/lib/db.ts
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const db =
  globalThis.prisma ||
  new PrismaClient({
    log: ["warn", "error"], // 开发期需要也可以加 "query","info"
  });

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;

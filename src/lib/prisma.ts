import { PrismaClient } from '@prisma/client';

// 声明全局变量以避免开发模式中多次创建 Prisma 实例
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 创建 PrismaClient 实例，添加日志选项以便调试（可根据需要调整）
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

// 在开发环境中缓存 Prisma 实例，避免热重载时多次连接数据库
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

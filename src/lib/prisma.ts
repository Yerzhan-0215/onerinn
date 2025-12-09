// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

/**
 * Prisma 单例（兼容 Next.js dev 热重载）
 */

declare global {
  // 在 dev 模式下把实例挂到 global，避免 HMR 创建多个连接
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const createPrisma = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

// 如果 global.__prisma 已经存在，直接复用；否则创建新的
const prisma = global.__prisma ?? createPrisma();

if (process.env.NODE_ENV === 'development') {
  global.__prisma = prisma;
}

export default prisma;

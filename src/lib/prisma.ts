// /src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const create = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

export const prisma = globalThis.prisma ?? create();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export const db = prisma;
export default prisma;

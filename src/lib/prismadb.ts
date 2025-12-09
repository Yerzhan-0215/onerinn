// src/lib/prismadb.ts
// 仅作为兼容层：把以前直接 new PrismaClient 的文件改为导出同一个实例
import prisma from './prisma';

export default prisma;

// （如果你的代码引用的是 prismadb.ts，保留导出名以兼容）

// src/lib/db.ts
// 兼容旧代码：将原来 new PrismaClient 的位置替换为单例导出
import prisma from './prisma';

export default prisma;

// 如果你之前在 db.ts 里导出了 helper 函数，也可以在这里继续定义并导出，例如：
// export async function getUserById(id: string) {
//   return prisma.user.findUnique({ where: { id } });
// }

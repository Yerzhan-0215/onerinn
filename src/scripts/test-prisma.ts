// /src/scripts/test-prisma.ts
import { db } from '@/lib/prisma';

async function main() {
  const user = await db.user.findFirst();
  console.log('✅ Prisma is working. First user:', user);
}

main()
  .catch((e) => {
    console.error('❌ Error running Prisma test:', e);
  })
  .finally(async () => {
    await db.$disconnect();
  });

// scripts/create-admin.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import readline from 'readline';

const prisma = new PrismaClient();

// 小工具：在命令行里提问
function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('=== Onerinn 管理员创建脚本 ===');

  const email = await ask('请输入管理员邮箱: ');
  const usernameInput = await ask('请输入管理员用户名（默认 Admin）: ');
  const username = usernameInput || 'Admin';
  const password = await ask('请输入登录密码: ');

  if (!email || !password) {
    console.log('❌ 邮箱和密码不能为空');
    process.exit(1);
  }

  // 检查是否已存在同邮箱或同用户名的管理员
  const existing = await prisma.admin.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existing) {
    console.log('❌ 已存在使用该邮箱或用户名的管理员:');
    console.log(`   email: ${existing.email}`);
    console.log(`   username: ${existing.username}`);
    process.exit(1);
  }

  console.log('正在生成密码哈希...');
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.create({
    data: {
      email,
      username,
      passwordHash,
      // role 和 isActive 在 schema 里已经有默认值：ADMIN / true
    },
  });

  console.log('\n✅ 管理员创建成功！');
  console.log('---------------------------------');
  console.log(`ID:       ${admin.id}`);
  console.log(`邮箱:     ${admin.email}`);
  console.log(`用户名:   ${admin.username}`);
  console.log('---------------------------------\n');

  await prisma.$disconnect();
}

main()
  .catch(async (err) => {
    console.error('❌ 创建管理员失败:', err);
    await prisma.$disconnect();
    process.exit(1);
  });

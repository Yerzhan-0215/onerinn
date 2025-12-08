// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/prisma";

// 说明：我们用 CredentialsProvider 来做“用户名/邮箱 + 密码” 登录。
// 这样登录成功以后，NextAuth 会给浏览器种 session token，之后
// getToken({ req }) 就能拿到 token.sub = user.id。

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt", // 我们保留 JWT 模式
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        login: { label: "Логин", type: "text" }, // 用户名或邮箱
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) {
          return null;
        }

        // 允许用户用 username 或 email 登录
        const user = await db.user.findFirst({
          where: {
            OR: [
              { username: credentials.login },
              { email: credentials.login },
            ],
          },
        });

        if (!user) {
          // 没有这个用户
          return null;
        }

        // 校验密码（bcrypt）
        const ok = await compare(credentials.password, user.password);
        if (!ok) {
          return null;
        }

        // 返回给 next-auth 的 user 对象会进入 jwt() 回调的 user 参数
        return {
          id: user.id,
          name: user.name || user.username || "",
          email: user.email || "",
        };
      },
    }),
  ],

  callbacks: {
    // 当用户登录成功或后续请求时，这里构造/更新 JWT token
    async jwt({ token, user }) {
      // 首次登录时 user 有值
      if (user) {
        token.sub = (user as any).id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },

    // 每次在前端用 useSession() 或 getServerSession() 时会跑这里
    async session({ session, token }) {
      // 把 token 里的 id 挂到 session.user.id 上，方便前端 / API 使用
      if (session.user && token?.sub) {
        (session.user as any).id = token.sub;
      }
      // 兜底 name / email
      if (session.user) {
        if (!session.user.name && token?.name) {
          session.user.name = token.name as string;
        }
        if (!session.user.email && token?.email) {
          session.user.email = token.email as string;
        }
      }
      return session;
    },
  },
};

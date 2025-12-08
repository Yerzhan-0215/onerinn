// src/app/api/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * 退出登录接口：
 * - 彻底清除所有可能存在的登录 Cookie
 * - 兼容 Next.js 15（需要 await cookies()）
 * - 返回 { ok: true } 响应，前端跳转回主页或登录页
 */

// ✅ 集中列出所有可能的 Cookie 名称（通用 + 旧版 + NextAuth）
const COOKIE_NAMES = [
  'userId',
  'onerinn_token',                     // 自定义 JWT
  'onerinn_session',                   // 自定义 Session
  'session',
  'auth_token',
  'next-auth.session-token',           // NextAuth 普通 token
  '__Secure-next-auth.session-token',  // NextAuth 安全 token
];

export async function POST() {
  const jar = await cookies(); // ★ Next.js 15 必须 await 调用
  const res = NextResponse.json({ ok: true });

  // ✅ 循环清除所有 Cookie（跨兼容逻辑）
  for (const name of COOKIE_NAMES) {
    try {
      // 一种兼容清除方式：set 空值 + maxAge:0
      jar.set({
        name,
        value: '',
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 0,
      });

      // 再确保响应中也删除对应 cookie
      res.cookies.delete(name);
    } catch (err) {
      console.warn(`[logout] Failed to clear cookie: ${name}`, err);
    }
  }

  // 防止缓存任何响应
  res.headers.set('Cache-Control', 'no-store');

  return res;
}

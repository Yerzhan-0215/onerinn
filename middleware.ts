// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME } from '@/lib/adminSession';

// 你的受支持语言
const SUPPORTED_LOCALES = ['en', 'ru', 'kk', 'zh'] as const;
const DEFAULT_LOCALE = 'ru'; // 自己改成你希望的默认语言

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ============================
  // ① Admin 区域保护 (/ru/admin/**)
  // ============================
  // /ru/admin/login 需要对外开放（用于登录），其它 /ru/admin/** 必须有管理员 session
  if (pathname.startsWith('/ru/admin') && pathname !== '/ru/admin/login') {
    const sessionId = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

    if (!sessionId) {
      // 没有管理员 cookie → 强制跳到 /ru/admin/login
      return NextResponse.redirect(new URL('/ru/admin/login', req.url));
    }
    // 有 cookie 就先放行，真正的有效性校验由 getCurrentAdmin 在服务端完成
  }

  // =========================================
  // ② 原有的多语言前缀逻辑（保留你的全部行为）
  // =========================================

  // 排除 API 与 Next 静态资源
  if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // 排除所有带扩展名的静态资源，例如 /logo.png、/images/a.webp、/robots.txt ...
  const hasExtension = /\.[a-z0-9]+$/i.test(pathname);
  if (hasExtension) {
    return NextResponse.next();
  }

  // 已包含合法 locale 的路径直接放行（如 /ru/... /en/...）
  const segments = pathname.split('/').filter(Boolean);
  const maybeLocale = segments[0];
  if (SUPPORTED_LOCALES.includes(maybeLocale as any)) {
    return NextResponse.next();
  }

  // 其它路径一律加上默认语言前缀
  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
  return NextResponse.redirect(url);
}

// 只匹配除去下列路径以外的所有路由：
// - /api
// - /_next
// - 任何带文件扩展名的路径（静态资源）
export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};

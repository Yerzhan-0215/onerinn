// src/middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ru', 'kk', 'en', 'zh'],
  defaultLocale: 'ru',
  localePrefix: 'always' // 访问 / 会跳到 /ru
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'] // 让除静态资源外的路径都经过中间件
};

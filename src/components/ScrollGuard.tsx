// src/components/ScrollGuard.tsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * 判断当前路径是否需要强制隐藏右侧纵向滚动条
 * - 覆盖：loading 页面期间（由布局挂载生效）、首页(/、/ru、/kk、/zh)、
 *         注册、登录、忘记密码、重置密码、修改密码 等常见认证页。
 * - 后续如需扩展，只需在此处添加匹配规则。
 */
function isNoScrollRoute(rawPathname: string | null): boolean {
  const pathname = (rawPathname ?? '/').split(/[?#]/)[0] || '/';

  // 首页（多语言）
  const isHome = /^\/($|ru$|kk$|zh$)/.test(pathname);

  // Auth 系列（多语言）
  const isAuth =
    /^\/(ru|kk|zh)?\/?(login|register|forgot-password|reset-password|change-password)\/?$/.test(
      pathname,
    );

  return isHome || isAuth;
}

/**
 * ScrollGuard：
 * 在满足 isNoScrollRoute 的页面里：
 *  - 给 <html> 与 <body> 添加 .no-scroll 类
 *  - 以内联样式隐藏纵向滚动条，稳定 scrollbar 占位
 * 离开页面后自动恢复原始样式，避免副作用。
 */
export default function ScrollGuard() {
  const pathname = usePathname();

  const prevHtmlOverflow = useRef<string | null>(null);
  const prevBodyOverflow = useRef<string | null>(null);
  const prevHtmlScrollbarGutter = useRef<string | null>(null);
  const prevBodyScrollbarGutter = useRef<string | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const html = document.documentElement;
    const body = document.body;
    const needLock = isNoScrollRoute(pathname);

    if (needLock) {
      // 记录原始 style，仅记录一次，避免覆盖
      if (prevHtmlOverflow.current === null) prevHtmlOverflow.current = html.style.overflowY || '';
      if (prevBodyOverflow.current === null) prevBodyOverflow.current = body.style.overflowY || '';
      if (prevHtmlScrollbarGutter.current === null)
        prevHtmlScrollbarGutter.current = (html.style as any).scrollbarGutter || '';
      if (prevBodyScrollbarGutter.current === null)
        prevBodyScrollbarGutter.current = (body.style as any).scrollbarGutter || '';

      // 添加类名（建议在 globals.css 中定义 .no-scroll 覆盖）
      html.classList.add('no-scroll');
      body.classList.add('no-scroll');

      // 保险：用内联样式强制隐藏纵向滚动条
      html.style.overflowY = 'hidden';
      body.style.overflowY = 'hidden';

      // 稳定滚动条占位，避免出现/消失导致的布局抖动
      (html.style as any).scrollbarGutter = 'stable both-edges';
      (body.style as any).scrollbarGutter = 'stable both-edges';
    } else {
      // 退出锁定：移除类名 & 恢复先前样式
      html.classList.remove('no-scroll');
      body.classList.remove('no-scroll');

      if (prevHtmlOverflow.current !== null) {
        html.style.overflowY = prevHtmlOverflow.current ?? '';
        prevHtmlOverflow.current = null;
      }
      if (prevBodyOverflow.current !== null) {
        body.style.overflowY = prevBodyOverflow.current ?? '';
        prevBodyOverflow.current = null;
      }
      if (prevHtmlScrollbarGutter.current !== null) {
        (html.style as any).scrollbarGutter = prevHtmlScrollbarGutter.current ?? '';
        prevHtmlScrollbarGutter.current = null;
      }
      if (prevBodyScrollbarGutter.current !== null) {
        (body.style as any).scrollbarGutter = prevBodyScrollbarGutter.current ?? '';
        prevBodyScrollbarGutter.current = null;
      }
    }

    // 清理函数：组件卸载或路径变化时，确保恢复
    return () => {
      html.classList.remove('no-scroll');
      body.classList.remove('no-scroll');

      if (prevHtmlOverflow.current !== null) {
        html.style.overflowY = prevHtmlOverflow.current ?? '';
        prevHtmlOverflow.current = null;
      }
      if (prevBodyOverflow.current !== null) {
        body.style.overflowY = prevBodyOverflow.current ?? '';
        prevBodyOverflow.current = null;
      }
      if (prevHtmlScrollbarGutter.current !== null) {
        (html.style as any).scrollbarGutter = prevHtmlScrollbarGutter.current ?? '';
        prevHtmlScrollbarGutter.current = null;
      }
      if (prevBodyScrollbarGutter.current !== null) {
        (body.style as any).scrollbarGutter = prevBodyScrollbarGutter.current ?? '';
        prevBodyScrollbarGutter.current = null;
      }
    };
  }, [pathname]);

  return null;
}

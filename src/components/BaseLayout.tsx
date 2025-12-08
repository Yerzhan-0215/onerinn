// src/components/BaseLayout.tsx
'use client';

import React from 'react';
import BackgroundLogo from './BackgroundLogo';
import ScrollGuard from '@/components/ScrollGuard';
import RouteFlagger from '@/components/RouteFlagger';

/* ✅ 新增：引入 ChatWidget */
import ChatWidget from '@/components/ChatWidget';

type LayoutVariant = 'default' | 'home' | 'auth' | 'dashboard' | 'admin';

type Props = {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
  padding?: string;
  /** 用来标记页面类型，不再在组件内部用 usePathname 判断 */
  variant?: LayoutVariant;
  /** 是否显示首页那种淡水印背景 */
  showBackground?: boolean;
  /** 是否完全关闭 ScrollGuard（比如 Admin/Dashboard 自己控制滚动） */
  disableScrollGuard?: boolean;
};

export default function BaseLayout({
  children,
  className = '',
  maxWidth = 'max-w-6xl',
  padding = 'px-4 md:px-6',
  variant = 'default',
  showBackground = false,
  disableScrollGuard = false,
}: Props) {
  const isDashboard = variant === 'dashboard';
  const isAdmin = variant === 'admin';
  const isHomeOrAuth = variant === 'home' || variant === 'auth';

  // 首页/登录页使用“视口高度减去 header/footer”保证最小高度
  const pageMinH =
    'min-h-[calc(100dvh-var(--site-header-h,64px)-var(--site-footer-h,56px))]';

  return (
    <div className="relative w-full overflow-x-hidden">
      {/* 把当前路由写到 <html data-route="..."> */}
      <RouteFlagger />

      {/* 普通页面启用 ScrollGuard，Dashboard / Admin 默认关闭 */}
      {!disableScrollGuard && !(isDashboard || isAdmin) && <ScrollGuard />}

      {/* 首页淡水印背景 */}
      {showBackground && (
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <BackgroundLogo />
        </div>
      )}

      <div
        className={[
          'base-layout-shell',
          'mx-auto w-full',
          isHomeOrAuth ? pageMinH : '',
          (isDashboard || isAdmin) ? 'overflow-visible' : '',
          maxWidth,
          padding,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>

      {/* 🔥🔥🔥 精准新增：右下角聊天小按钮（不会影响现有布局） */}
      <ChatWidget />
    </div>
  );
}

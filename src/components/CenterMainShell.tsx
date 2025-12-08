'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

/**
 * 仅负责复用你原来的“特定路由内容居中”规则。
 * 重要：不设置 overflow，让根(body)滚动，避免影响固定导航。
 */
export default function CenterMainShell({ children }: { children: React.ReactNode }) {
  const pathname = (usePathname() || '').replace(/\/+$/, '');

  // 与你旧版 /ru/layout.tsx 完全一致的匹配规则：
  const isCenter =
    /^\/ru(?:\/(login|register|forgot-password|reset-password|profile(?:\/edit)?))?$/.test(
      pathname
    );

  if (isCenter) {
    // 居中场景：撑满视口（减去 header 已在 pt- 让位），靠近 Footer 的距离由页面自身决定
    return (
      <main
        role="main"
        className="flex min-h-[calc(100dvh-var(--site-header-h))] items-center justify-center"
      >
        {children}
      </main>
    );
  }

  // 非居中页面：不额外设置 overflow，让 body 接管滚动，避免影响 fixed 导航
  return <main role="main">{children}</main>;
}

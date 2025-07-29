'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 判断是否是首页（支持多语言路径）
  const isHomePage =
    pathname === '/' ||
    pathname === '/ru' ||
    pathname === '/kk' ||
    pathname === '/en' ||
    pathname === '/zh';

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden">
      {/* 全站统一导航栏 */}
      <Navbar />

      {/* 页面主体内容（首页无内边距，其它页有 pt+pb） */}
      <main className={`flex-grow ${isHomePage ? '' : 'pt-6 pb-10 px-4'}`}>
        {children}
      </main>

      {/* 页面底部版权信息 */}
      <Footer />
    </div>
  );
}

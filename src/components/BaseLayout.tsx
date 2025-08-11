'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import BackgroundLogo from './BackgroundLogo'; // 添加背景图

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ✅ 路径判断，避免 pathname 为 null 报错
  const homePaths = ['/', '/ru', '/kk', '/en', '/zh'];
  const isHomePage = pathname !== null && homePaths.includes(pathname);

  return (
    <div className="relative flex flex-col min-h-screen overflow-x-hidden">
      {/* 背景图层（仅主页显示） */}
      {isHomePage && (
        <div className="absolute inset-0 z-0">
          <BackgroundLogo />
        </div>
      )}

      {/* 导航栏 */}
      <div className="relative z-10">
        <Navbar />
      </div>

      {/* 主体内容 */}
      <main className={`relative z-10 flex-grow flex justify-center ${isHomePage ? '' : 'pt-6 pb-10 px-4'}`}>
        <div className="w-full max-w-5xl">{children}</div>
      </main>

      {/* 页脚 */}
      <Footer />
    </div>
  );
}

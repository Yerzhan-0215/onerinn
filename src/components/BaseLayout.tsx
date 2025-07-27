'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 判断是否是主页（多语言支持）
  const isHomePage =
    pathname === '/' ||
    pathname === '/ru' ||
    pathname === '/kk' ||
    pathname === '/en' ||
    pathname === '/zh';

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <Navbar />

      <main className={`flex-grow ${isHomePage ? '' : 'pt-4 pb-10'}`}>
        {children}
      </main>

      <Footer />
    </div>
  );
}
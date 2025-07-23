'use client';

import React from 'react';
import Navbar from './Navbar'; // 或者你的导航栏组件路径
import Footer from './Footer'; // 同上

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
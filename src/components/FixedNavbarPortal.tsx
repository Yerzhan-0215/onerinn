// src/components/FixedNavbarPortal.tsx
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar'; // ✅ 改成实际位置：src/components/Navbar.tsx

export default function FixedNavbarPortal() {
  // 用容器来保证只在浏览器端挂载到 document.body
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // 只在客户端执行，SSR 阶段不会触发
    setContainer(document.body);
  }, []);

  // 首次渲染还没拿到 body 时不渲染，避免 hydration 问题
  if (!container) return null;

  // ✅ 只在 /ru 首页使用淡入效果，其它路由立即显示
  const isRuHome = pathname === '/ru' || pathname === '/ru/';
  const extraClass = isRuHome ? 'fade-in-nav-soft' : '';

  return createPortal(
    <header className={`fixed inset-x-0 top-0 z-40 ${extraClass}`}>
      <Navbar />
    </header>,
    container
  );
}

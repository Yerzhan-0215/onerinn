// src/components/FixedFooterPortal.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import Footer from '@/components/layout/Footer';

const HOST_ID = 'footer-fixed-overlay';

/**
 * FixedFooterPortal（增强版 + 首页淡入动画）
 * - 将 Footer 固定在视口底部（z-[70] 高于 Navbar）
 * - 动态测量高度，写入 --site-footer-h，并给 body 添加同等 padding-bottom（内容不被遮挡）
 * - 防重：全局仅创建一个 HOST 节点，即使被多次渲染也只会出现一个 Footer
 * - 仅在 /ru 首页使用 fade-in-footer-soft 动画，其它页面行为与原版完全一致
 */
export default function FixedFooterPortal() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // 全局唯一 host 容器
  const host = useMemo(() => {
    if (typeof document === 'undefined') return null;
    let el = document.getElementById(HOST_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = HOST_ID;
      document.body.appendChild(el);
    }
    return el;
  }, []);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // 动态测量 footer 高度，避免遮挡内容
  useEffect(() => {
    if (!mounted) return;

    const html = document.documentElement;
    const body = document.body;

    const measure = () => {
      const inner = document.getElementById(`${HOST_ID}-inner`);
      if (!inner) return;
      const h = inner.offsetHeight || 0;
      html.style.setProperty('--site-footer-h', `${h}px`);
      body.style.paddingBottom = `${h}px`;
    };

    measure();

    const inner = document.getElementById(`${HOST_ID}-inner`);
    const ro =
      typeof ResizeObserver !== 'undefined' && inner
        ? new ResizeObserver(measure)
        : null;

    if (ro && inner) ro.observe(inner);
    window.addEventListener('resize', measure);

    return () => {
      window.removeEventListener('resize', measure);
      ro?.disconnect();
      body.style.paddingBottom = '';
    };
  }, [mounted]);

  if (!mounted || !host) return null;

  // ✅ 只在 /ru 首页使用淡入效果，其它路由保持原样
  const isRuHome = pathname === '/ru' || pathname === '/ru/';
  const extraClass = isRuHome ? 'fade-in-footer-soft' : '';

  return createPortal(
    <div
      id={`${HOST_ID}-inner`}
      // z-[70] 高于 Navbar 的 z-[60]；fixed 贴底，任何层都盖不住它
      className={`fixed inset-x-0 bottom-0 z-[70] ${extraClass}`}
      style={{ pointerEvents: 'auto' }}
    >
      <Footer />
    </div>,
    host
  );
}

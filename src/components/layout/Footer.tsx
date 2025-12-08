'use client';

import { useEffect, useRef } from 'react';

export default function Footer() {
  const ref = useRef<HTMLDivElement>(null);

  // 把 Footer 实际高度写入 --site-footer-h（首页/认证页 min-height 用）
  useEffect(() => {
    const el = ref.current;
    const update = () => {
      if (el) {
        document.documentElement.style.setProperty('--site-footer-h', `${el.offsetHeight}px`);
      }
    };
    update();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    if (ro && el) ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      ro?.disconnect();
    };
  }, []);

  return (
    <footer
      ref={ref}
      role="contentinfo"
      data-footer="mounted"
      // 关键点：
      // 1) -mt-px 轻微上移 1px，盖住可能来自上方容器的分隔线
      // 2) border-0 强制无边；shadow-none 防止任何阴影像“线”
      // 3) bg-white/80 + backdrop-blur 维持你的视觉风格
      className="relative z-10 w-full shrink-0 -mt-px border-0 shadow-none bg-white/80 py-6 text-center text-sm text-gray-600 backdrop-blur"
      style={{ borderTop: '0' }}
    >
      © {new Date().getFullYear()} Onerinn. All rights reserved.
    </footer>
  );
}

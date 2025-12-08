// src/components/AuthCard.tsx
'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * 在登录成功后跳到“当前语言”的 Dashboard。
 * 用法（在登录成功处调用 go()）：
 *
 *   const { go } = useDashboardRedirect();
 *   const onSubmit = async () => {
 *     const res = await fetch('/api/login', { ... });
 *     if (res.ok) go(); // ← 登陆成功，跳转到 /{lang}/dashboard 或 /dashboard
 *   };
 */
export function useDashboardRedirect() {
  const router = useRouter();
  const pathname = usePathname() || '';

  const lang =
    pathname.startsWith('/ru') ? 'ru' :
    pathname.startsWith('/kk') ? 'kk' :
    pathname.startsWith('/zh') ? 'zh' : 'en';

  const prefix = lang === 'en' ? '' : `/${lang}`;

  const go = () => {
    router.replace(`${prefix}/dashboard`);
  };

  return { go, lang, prefix };
}

export default function AuthCard({
  children,
  className = '',
  panelClassName = '',
}: {
  children: React.ReactNode;
  /** 作用于最外层容器（用于个别页面额外控制间距） */
  className?: string;
  /** 作用于卡片本体（用于页面局部样式微调） */
  panelClassName?: string;
}) {
  // 过滤 panelClassName 中可能加深边框/阴影/环的类，避免覆盖卡片统一样式
  const sanitizedPanel = String(panelClassName || '')
    .split(/\s+/)
    .filter(
      (t) =>
        t &&
        !/^(?:border(?:-[\w/.[\]!:-]+)?)$/.test(t) && // border / border-*
        !/^(?:ring(?:-[\w/.[\]!:-]+)?)$/.test(t) &&   // ring / ring-*
        !/^(?:shadow(?:-[\w/.[\]!:-]+)?)$/.test(t)    // shadow / shadow-*
    )
    .join(' ');

  return (
    <div
      className={[
        // 只负责把卡片容器居中；垂直中心由上层 <main> (Nav 与 Footer 之间) 控制
        'flex items-center justify-center',
        'px-3 py-6',
        className,
      ].join(' ')}
    >
      <div
        className={[
          'w-full max-w-sm rounded-xl',
          // —— 强制统一浅灰边框，与输入框一致 ——
          '!border !border-gray-300',
          // —— 移除任何环与重阴影的影响 ——
          '!ring-0 !outline-none !shadow-none',
          'bg-white p-6',
          sanitizedPanel, // 仅保留与边框无关的细微样式
        ].join(' ')}
        // 保险：再用行内样式钉死边框颜色和宽度，防止高特异性选择器干扰
        style={{ borderColor: 'rgb(209 213 219)', borderWidth: 1 }}
      >
        {children}
      </div>
    </div>
  );
}

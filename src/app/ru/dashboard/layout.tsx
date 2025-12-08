// src/app/ru/dashboard/layout.tsx
'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav'; // ✅ 顶部导航栏

type Tab = { href: string; label: string; exact?: boolean };

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // 统一去掉尾部斜杠，便于匹配
  const pathname = (usePathname() || '').replace(/\/+$/, '');

  // 顶部子导航
  const tabs: Tab[] = useMemo(
    () => [
      { href: '/ru/dashboard', label: 'Обзор', exact: true },
      { href: '/ru/dashboard/listings', label: 'Мои объявления' },
      { href: '/ru/dashboard/orders', label: 'Заказы' },
      { href: '/ru/dashboard/rentals', label: 'Аренды' },
      { href: '/ru/dashboard/messages', label: 'Сообщения' },
      { href: '/ru/dashboard/payouts', label: 'Выплаты' },
      { href: '/ru/dashboard/calendar', label: 'Календарь' },
      { href: '/ru/dashboard/settings', label: 'Настройки' },
      { href: '/ru/dashboard/verification', label: 'Верификация' },
      // ✅ 入口：仪表盘工具
      { href: '/ru/dashboard/tools/reset-link', label: 'Инструменты' },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ 全局顶部导航栏 */}
      <DashboardNav />

      <div id="__dashboard_root" className="mx-auto w-full max-w-6xl px-4 py-4 md:px-6">
        {/* 清理潜在的局部 overflow 造成的滚动条问题 */}
        <style jsx global>{`
          #__dashboard_root .overflow-y-auto,
          #__dashboard_root .overflow-y-scroll {
            overflow-y: visible !important;
          }
        `}</style>

        {/* 顶部 Tabs：居中对称、可横向滚动 */}
        <nav className="mb-5 overflow-x-auto">
          <ul className="mx-auto flex min-w-max justify-start gap-2 md:justify-center">
            {tabs.map((t) => {
              const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
              return (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition-colors',
                      active
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    {t.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 主体内容区域 */}
        <main>{children}</main>
      </div>
    </div>
  );
}

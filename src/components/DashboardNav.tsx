// src/components/DashboardNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Tab = {
  href: string;
  label: string;
  exact?: boolean;
};

interface DashboardNavProps {
  tabs?: Tab[];
  title?: string;
}

export default function DashboardNav({
  tabs,
  title = 'Личный кабинет · Onerinn',
}: DashboardNavProps) {
  const pathname = usePathname();

  // 如果外部没有传 tabs，就给默认的
  const effectiveTabs: Tab[] =
    tabs && tabs.length > 0
      ? tabs
      : [
          { href: '/ru/dashboard', label: 'Обзор', exact: true },
          { href: '/ru/dashboard/listings', label: 'Мои объявления' },
          { href: '/ru/dashboard/messages', label: 'Сообщения' },
          { href: '/ru/dashboard/settings', label: 'Настройки' },
        ];

  const isActive = (tab: Tab) => {
    if (!pathname) return false; // ⭐ 防止 TS 报错，但运行中永远不会出现

    if (tab.exact) return pathname === tab.href;
    return pathname === tab.href || pathname.startsWith(tab.href + '/');
  };

  return (
    <div className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
        {/* 左侧：标题 */}
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {title}
        </div>

        {/* 右侧：Tab 导航 */}
        <div className="flex flex-wrap items-center gap-3">
          {effectiveTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`text-sm transition ${
                isActive(tab)
                  ? 'font-semibold text-slate-900 border-b-2 border-blue-500 pb-0.5'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

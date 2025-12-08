// src/app/ru/admin/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: '/ru/admin', label: 'Главная' },
    { href: '/ru/admin/tools/reset-link', label: 'Сброс пароля' },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // 忽略错误
    } finally {
      router.push('/ru');
    }
  };

  return (
    <div className="bg-slate-50">
      {/* 后台顶部导航条（位于 Onerinn 主导航下面） */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-2.5">
          {/* 左侧：后台入口标记 */}
          <Link
            href="/ru/admin"
            className="
              inline-flex items-center gap-1.5
              rounded-full px-3 py-1
              text-sm font-semibold
              text-slate-700
              hover:text-slate-900
              hover:bg-slate-100
              transition
            "
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Onerinn Admin</span>
          </Link>

          {/* 中间：后台导航 */}
          <div className="flex items-center gap-4">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    text-sm transition
                    ${
                      active
                        ? 'text-slate-900 font-medium border-b-2 border-blue-500 pb-0.5'
                        : 'text-slate-600 hover:text-slate-900'
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* 右侧：退出按钮 */}
          <button
            onClick={handleLogout}
            className="
              rounded-full bg-red-500
              px-3 py-1.5
              text-xs font-semibold text-white
              hover:bg-red-600
              shadow-sm
            "
          >
            Выйти
          </button>
        </div>
      </nav>

      {/* 后台主体内容 */}
      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}

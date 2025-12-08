'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';

const items = [
  { href: '/profile', label: 'Обзор' },
  { href: '/profile/edit', label: 'Редактировать профиль' },
  { href: '/profile/security', label: 'Безопасность' },
  { href: '/profile/artworks', label: 'Мои произведения' },
  { href: '/profile/favorites', label: 'Избранное' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const params = useParams() as { locale?: string | string[] };

  // 兼容 string | string[] | undefined
  const currentLocale =
    (Array.isArray(params?.locale) ? params.locale[0] : params?.locale) ?? 'ru';

  const prefix = `/${currentLocale}`;

  return (
    <aside className="sticky top-[72px] h-[calc(100vh-80px)] overflow-auto pr-3">
      <nav className="space-y-1">
        {items.map(i => {
          const href = `${prefix}${i.href}`;
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`block rounded-lg px-3 py-2 text-sm transition
                ${active ? 'bg-black/80 text-white' : 'hover:bg-black/5'}`}
            >
              {i.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

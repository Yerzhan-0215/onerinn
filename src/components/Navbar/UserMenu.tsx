// src/components/Navbar/UserMenu.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Avatar from '@/components/Avatar';

type Props = {
  user: { name: string; avatarUrl?: string };
  prefix: string; // '' | '/ru' | '/kk' | '/zh'
  labels: { profile: string; edit: string; logout: string };
  onLogout: () => Promise<void> | void;
};

export default function UserMenu({ user, prefix, labels, onLogout }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // 点击外部关闭
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  // Esc 关闭
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    // 外层容器成为定位参考 & hover 触发者
    <div className="relative group" ref={ref}>
      {/* 头像按钮（强制指针样式） */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
        aria-label="Открыть меню пользователя"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar
          name={user.name}
          src={user.avatarUrl}
          size={36}
          className="transition hover:opacity-90 cursor-pointer"
        />
      </button>

      {/* 悬停昵称浮标：白底灰字 + 丝滑动画（与“Главная”一致） */}
      <span
        className="
          pointer-events-none absolute right-0 top-full mt-1 z-20
          rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-700
          shadow-lg ring-1 ring-black/10 whitespace-nowrap
          opacity-0 translate-y-1 transition duration-150 ease-out
          group-hover:opacity-100 group-hover:translate-y-0
        "
      >
        {user.name}
      </span>

      {/* 下拉菜单：常驻 DOM，用过渡控制显隐，手感丝滑 */}
      <div
        role="menu"
        aria-label="User menu"
        aria-hidden={!open}
        className={`
          absolute right-0 z-50 mt-2 w-fit min-w-[9rem]
          rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5
          transform transition duration-150 ease-out
          ${open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'}
        `}
      >
        <div className="px-2 py-1 text-center text-sm font-medium whitespace-nowrap">
          {user.name}
        </div>
        <div className="my-1 h-px bg-gray-100" />

        <button
          onClick={() => {
            setOpen(false);
            router.push(`${prefix}/profile`);
          }}
          className="block w-full rounded-lg px-3 py-2 text-center text-sm whitespace-nowrap hover:bg-gray-100 cursor-pointer"
          role="menuitem"
          type="button"
        >
          {labels.profile}
        </button>

        <button
          onClick={() => {
            setOpen(false);
            router.push(`${prefix}/profile/edit`);
          }}
          className="mt-1 block w-full rounded-lg px-3 py-2 text-center text-sm whitespace-nowrap hover:bg-gray-100 cursor-pointer"
          role="menuitem"
          type="button"
        >
          {labels.edit}
        </button>

        <div className="my-1 h-px bg-gray-100" />

        <button
          onClick={async () => {
            setOpen(false);
            await onLogout();
          }}
          className="mt-1 block w-full rounded-lg px-3 py-2 text-center text-sm whitespace-nowrap hover:bg-red-50 cursor-pointer"
          role="menuitem"
          type="button"
        >
          {labels.logout}
        </button>
      </div>
    </div>
  );
}

// src/app/ru/admin/users/UserBlockToggle.tsx
'use client';

import { useState } from 'react';

type Props = {
  userId: string;
  initialBlocked: boolean;
};

export function UserBlockToggle({ userId, initialBlocked }: Props) {
  const [isBlocked, setIsBlocked] = useState<boolean>(initialBlocked);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      const action = isBlocked ? 'unblock' : 'block';

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, action }),
      });

      if (!res.ok) {
        throw new Error('FAILED');
      }

      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error ?? 'FAILED');
      }

      setIsBlocked(data.user?.isBlocked ?? !isBlocked);
    } catch (e) {
      console.error(e);
      setError('Не удалось изменить статус пользователя.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className={
          isBlocked
            ? // ✅ 已封禁 → 绿色 “Разблокировать”，尺寸与 “Применить” 一致
              'inline-flex items-center rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer'
            : // ✅ 未封禁 → 红色 “Заблокировать”，尺寸与 “Применить” 一致
              'inline-flex items-center rounded-full bg-rose-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer'
        }
      >
        {loading
          ? '...'
          : isBlocked
          ? 'Разблокировать'
          : 'Заблокировать'}
      </button>

      {error && (
        <p className="text-[10px] text-rose-600">{error}</p>
      )}
    </div>
  );
}

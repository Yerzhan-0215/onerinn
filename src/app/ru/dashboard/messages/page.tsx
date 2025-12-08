// /src/app/ru/dashboard/messages/page.tsx
'use client';

import { useEffect, useState } from 'react';

type Dialog = {
  id: string;
  peerName?: string | null;
  lastMessageSnippet?: string | null;
  lastMessageAt: string;          // ISO
  unreadCountFor?: number | null;
};

function formatRUDateTime(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('ru-RU');
}

export default function MessagesPage() {
  const [dialogs, setDialogs] = useState<Dialog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);

    fetch('/api/dashboard/messages', { signal: ctrl.signal })
      .then(async (r) => (r.ok ? r.json() : { dialogs: [] })) // API 未实现时也不报错
      .then((d) => setDialogs(Array.isArray(d.dialogs) ? d.dialogs : []))
      .catch((e) => {
        if (e?.name !== 'AbortError') setError(String(e));
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* 左侧：对话列表 */}
      <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm md:col-span-1">
        <div className="mb-2 text-sm font-medium">Диалоги</div>

        {loading && <div className="text-sm text-gray-600">Загрузка…</div>}

        {error && (
          <div className="text-sm text-red-600">Ошибка: {error}</div>
        )}

        {!loading && !error && dialogs.length === 0 && (
          <ul className="space-y-2 text-sm">
            <li className="rounded-lg border border-gray-200 p-3">Диалогов нет</li>
          </ul>
        )}

        {!loading && !error && dialogs.length > 0 && (
          <ul className="space-y-2 text-sm">
            {dialogs.map((d) => (
              <li key={d.id} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{d.peerName ?? 'Пользователь'}</div>
                  {(d.unreadCountFor ?? 0) > 0 && (
                    <span className="rounded-full bg-black px-2 py-0.5 text-xs text-white">
                      {d.unreadCountFor}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-gray-600">
                  {d.lastMessageSnippet ?? '—'}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {formatRUDateTime(d.lastMessageAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 右侧：会话占位 */}
      <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm md:col-span-2">
        <div className="text-sm text-gray-600">
          Выберите диалог, чтобы начать переписку.
        </div>
      </div>
    </div>
  );
}

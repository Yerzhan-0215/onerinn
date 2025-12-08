// /src/app/ru/dashboard/orders/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

type Status = 'new' | 'processing' | 'done';

type Order = {
  id: string;
  number: string | null;
  totalAmount: number | null;
  createdAt: string;     // ISO
  status: string;        // 可能是 NEW/PROCESSING/DONE 或 new/processing/done
  buyerName?: string | null;
};

const STATUS_FILTER_LABEL_RU: Record<Status, string> = {
  new: 'Новые',
  processing: 'В работе',
  done: 'Завершённые',
};

function normalizeStatusRU(s?: string) {
  if (!s) return '—';
  const v = s.toLowerCase();
  if (v === 'new') return 'Новый';
  if (v === 'processing') return 'В работе';
  if (v === 'done') return 'Завершён';
  return s; // 兜底：原样显示
}

export default function OrdersPage() {
  const [status, setStatus] = useState<Status>('new');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(
    () => new URLSearchParams({ status }).toString(),
    [status]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`/api/dashboard/orders?${query}`, { signal: ctrl.signal })
      .then(async (r) => (r.ok ? r.json() : { items: [] })) // API 未实现也不报错
      .then((d) => setItems(Array.isArray(d.items) ? d.items : []))
      .catch((e) => {
        if (e?.name !== 'AbortError') setError(String(e));
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [query]);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Заказы</h1>

      {/* 顶部状态筛选 */}
      <div className="inline-flex rounded-full border border-gray-300 bg-white p-1">
        {(['new', 'processing', 'done'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            aria-pressed={status === s}
            className={`rounded-full px-3 py-1 text-sm ${
              status === s ? 'bg-gray-100 font-semibold' : ''
            }`}
          >
            {STATUS_FILTER_LABEL_RU[s]}
          </button>
        ))}
      </div>

      {/* 列表/空态/加载/错误 */}
      <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
        {loading && <div className="text-sm text-gray-600">Загрузка…</div>}

        {error && (
          <div className="text-sm text-red-600">
            Ошибка: {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
            Нет заказов.
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">№</th>
                  <th className="px-4 py-2 text-left">Покупатель</th>
                  <th className="px-4 py-2 text-right">Сумма</th>
                  <th className="px-4 py-2 text-left">Статус</th>
                  <th className="px-4 py-2 text-left">Создан</th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="px-4 py-2">{o.number ?? o.id.slice(0, 6)}</td>
                    <td className="px-4 py-2">{o.buyerName ?? '—'}</td>
                    <td className="px-4 py-2 text-right">
                      ₸ {o.totalAmount != null ? o.totalAmount.toLocaleString('ru-RU') : '—'}
                    </td>
                    <td className="px-4 py-2">{normalizeStatusRU(o.status)}</td>
                    <td className="px-4 py-2">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString('ru-RU') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

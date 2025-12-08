// src/app/ru/admin/artworks/page.tsx
'use client';

import { useState } from 'react';

type ArtworkStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type ArtworkRow = {
  id: number;
  title: string;
  author: string;
  price: string;
  submittedAt: string;
  status: ArtworkStatus;
};

const INITIAL_ARTWORKS: ArtworkRow[] = [
  {
    id: 101,
    title: 'Пейзаж Алматы',
    author: 'Aruzhan K.',
    price: '120 000 ₸',
    submittedAt: '2024-11-14T10:00:00Z',
    status: 'PENDING',
  },
  {
    id: 102,
    title: 'Городской закат',
    author: 'Nurlan A.',
    price: '85 000 ₸',
    submittedAt: '2024-11-15T13:20:00Z',
    status: 'PENDING',
  },
  {
    id: 103,
    title: 'Абстракция №3',
    author: 'Dana S.',
    price: '65 000 ₸',
    submittedAt: '2024-11-15T16:45:00Z',
    status: 'APPROVED',
  },
];

export default function AdminArtworksPage() {
  const [items, setItems] = useState<ArtworkRow[]>(INITIAL_ARTWORKS);

  const updateStatus = (id: number, status: ArtworkStatus) => {
    setItems((prev) =>
      prev.map((art) => (art.id === id ? { ...art, status } : art)),
    );
  };

  return (
    <div className="space-y-4">
      {/* 标题区 */}
      <section className="rounded-2xl bg-white px-5 py-4 shadow-sm border border-slate-100">
        <h1 className="text-lg font-semibold text-slate-900">
          Произведения (модерация)
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Здесь вы можете просматривать и утверждать новые работы,
          отправленные продавцами / художниками.
        </p>
      </section>

      {/* 列表卡片形式 */}
      <section className="space-y-3">
        {items.map((art) => (
          <div
            key={art.id}
            className="
              flex flex-col gap-3 rounded-2xl border border-slate-200
              bg-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between
            "
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">
                  #{art.id} · {art.title}
                </span>
                <span className="text-xs text-slate-500">
                  Автор: {art.author}
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Цена: <span className="font-medium text-slate-800">{art.price}</span>
              </div>
              <div className="mt-0.5 text-xs text-slate-400">
                Отправлено: {new Date(art.submittedAt).toLocaleString('ru-RU')}
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 md:items-end">
              {/* 状态标签 */}
              <span
                className={
                  art.status === 'APPROVED'
                    ? 'inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700'
                    : art.status === 'REJECTED'
                    ? 'inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700'
                    : 'inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700'
                }
              >
                {art.status === 'PENDING'
                  ? 'На модерации'
                  : art.status === 'APPROVED'
                  ? 'Одобрено'
                  : 'Отклонено'}
              </span>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateStatus(art.id, 'APPROVED')}
                  className="
                    rounded-full border border-emerald-500 px-3 py-1
                    text-xs font-semibold text-emerald-700
                    hover:bg-emerald-50
                  "
                >
                  Одобрить
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(art.id, 'REJECTED')}
                  className="
                    rounded-full border border-rose-500 px-3 py-1
                    text-xs font-semibold text-rose-700
                    hover:bg-rose-50
                  "
                >
                  Отклонить
                </button>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-5 py-10 text-center text-sm text-slate-500">
            Новых работ для модерации пока нет.
          </div>
        )}
      </section>
    </div>
  );
}

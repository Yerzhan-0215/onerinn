// src/components/artworks/ArtworksPageClient.tsx
'use client';

import { useMemo, useState } from 'react';
import SectionHeader from '@/components/layout/SectionHeader';

type Artwork = {
  id: number;
  title: string;
  artist: string;
  priceKzt: number;
  style: string;
  size: string;
  status: 'available' | 'reserved';
};

const ARTWORKS: Artwork[] = [
  {
    id: 1,
    title: 'Горный рассвет',
    artist: 'Алия Ибраева',
    priceKzt: 120000,
    style: 'Живопись',
    size: '60 × 80 см',
    status: 'available',
  },
  {
    id: 2,
    title: 'Абстракция города',
    artist: 'Ернар Сагын',
    priceKzt: 80000,
    style: 'Абстракция',
    size: '50 × 70 см',
    status: 'reserved',
  },
  {
    id: 3,
    title: 'Тишина степи',
    artist: 'Динара К.',
    priceKzt: 95000,
    style: 'Пейзаж',
    size: '70 × 90 см',
    status: 'available',
  },
];

const STYLES = ['Все стили', 'Живопись', 'Абстракция', 'Пейзаж'];

export default function ArtworksPageClient() {
  const [search, setSearch] = useState('');
  const [style, setStyle] = useState('Все стили');

  const filtered = useMemo(() => {
    return ARTWORKS.filter((art) => {
      const matchSearch =
        search.trim().length === 0 ||
        art.title.toLowerCase().includes(search.toLowerCase()) ||
        art.artist.toLowerCase().includes(search.toLowerCase());

      const matchStyle =
        style === 'Все стили' || art.style === style;

      return matchSearch && matchStyle;
    });
  }, [search, style]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <SectionHeader
        title="Произведения"
        subtitle="Выберите произведение искусства для покупки или размещения на платформе Onerinn."
      />

      {/* Фильтры */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию или художнику..."
            className="
              w-full rounded-lg border border-slate-300
              px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            "
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => {
            const active = style === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStyle(s)}
                className={`
                  rounded-full border px-3 py-1 text-xs md:text-sm
                  transition
                  ${
                    active
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                  }
                `}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Список карточек */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((art) => (
          <article
            key={art.id}
            className="
              flex flex-col rounded-xl border border-slate-200 bg-white/90
              shadow-sm overflow-hidden
            "
          >
            {/* Псевдо-картинка */}
            <div className="h-36 bg-gradient-to-br from-sky-300 via-purple-300 to-pink-300" />

            <div className="flex flex-1 flex-col p-3 md:p-4">
              <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-1">
                {art.title}
              </h2>
              <p className="text-xs md:text-sm text-slate-600 mb-1">
                Автор: {art.artist}
              </p>
              <p className="text-xs text-slate-500 mb-2">
                Стиль: {art.style} · {art.size}
              </p>

              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="text-sm md:text-base font-semibold text-blue-700">
                  {art.priceKzt.toLocaleString('ru-RU')} ₸
                </span>
                <span
                  className={`
                    text-xs px-2 py-0.5 rounded-full
                    ${
                      art.status === 'available'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }
                  `}
                >
                  {art.status === 'available' ? 'Доступно' : 'В резерве'}
                </span>
              </div>
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            По вашему запросу пока ничего не найдено.
          </div>
        )}
      </div>
    </div>
  );
}

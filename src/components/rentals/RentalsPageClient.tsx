// src/components/rentals/RentalsPageClient.tsx
'use client';

import { useMemo, useState } from 'react';
import SectionHeader from '@/components/layout/SectionHeader';

type RentalItem = {
  id: number;
  name: string;
  category: string;
  brand: string;
  pricePerDayKzt: number;
  status: 'available' | 'busy';
};

const ITEMS: RentalItem[] = [
  {
    id: 1,
    name: 'Смартфон Samsung Galaxy',
    category: 'Смартфоны',
    brand: 'Samsung',
    pricePerDayKzt: 2500,
    status: 'available',
  },
  {
    id: 2,
    name: 'Ноутбук Apple MacBook Air',
    category: 'Ноутбуки',
    brand: 'Apple',
    pricePerDayKzt: 5500,
    status: 'busy',
  },
  {
    id: 3,
    name: 'Планшет iPad',
    category: 'Планшеты',
    brand: 'Apple',
    pricePerDayKzt: 3000,
    status: 'available',
  },
];

const CATEGORIES = ['Все категории', 'Смартфоны', 'Ноутбуки', 'Планшеты'];

export default function RentalsPageClient() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Все категории');

  const filtered = useMemo(() => {
    return ITEMS.filter((item) => {
      const matchSearch =
        search.trim().length === 0 ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.brand.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        category === 'Все категории' || item.category === category;

      return matchSearch && matchCategory;
    });
  }, [search, category]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <SectionHeader
        title="Аренда"
        subtitle="Выберите устройство для временного пользования. Идеально для проектов, поездок и тестирования."
      />

      {/* Фильтры */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию или бренду..."
            className="
              w-full rounded-lg border border-slate-300
              px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            "
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
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
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Список карточек */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <article
            key={item.id}
            className="
              flex flex-col rounded-xl border border-slate-200 bg-white/90
              shadow-sm overflow-hidden
            "
          >
            {/* Псевдо-картинка */}
            <div className="h-32 bg-gradient-to-br from-slate-200 via-sky-200 to-indigo-300" />

            <div className="flex flex-1 flex-col p-3 md:p-4">
              <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-1">
                {item.name}
              </h2>
              <p className="text-xs md:text-sm text-slate-600 mb-1">
                Категория: {item.category}
              </p>
              <p className="text-xs text-slate-500 mb-2">
                Бренд: {item.brand}
              </p>

              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="text-sm md:text-base font-semibold text-blue-700">
                  {item.pricePerDayKzt.toLocaleString('ru-RU')} ₸ / день
                </span>
                <span
                  className={`
                    text-xs px-2 py-0.5 rounded-full
                    ${
                      item.status === 'available'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }
                  `}
                >
                  {item.status === 'available' ? 'Свободно' : 'Занято'}
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

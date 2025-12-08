// src/app/ru/artworks/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type ArtworkDetail = {
  id: string;
  ownerId: string;
  title: string;
  artist: string | null;
  description: string | null;
  style: string | null;
  size: string | null;

  forSale: boolean;
  salePriceKzt: number | null;
  forRent: boolean;
  rentPerDayKzt: number | null;
  rentPerWeekKzt: number | null;
  rentPerMonthKzt: number | null;

  price: number | null;
  status: string;
  category: string | null;
  condition: string | null;
  quantity: number | null;
  coverUrl: string | null;

  location: string | null;
  district: string | null;

  biz?: string | null;
  specs?: any;
  pricing?: any;
  acquisition?: any;

  createdAt: string;
  updatedAt: string;
};

type DetailApiResponse =
  | { ok: true; item: ArtworkDetail }
  | { ok: false; error: string };

export default function ArtworkDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [item, setItem] = useState<ArtworkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let aborted = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/artworks/${id}`);
        if (res.status === 404) {
          if (!aborted) {
            setError('Произведение не найдено или снято с публикации.');
          }
          return;
        }
        if (!res.ok) {
          throw new Error(`SERVER_${res.status}`);
        }

        const data = (await res.json()) as DetailApiResponse;
        if (!aborted && data.ok) {
          setItem(data.item);
        } else if (!aborted && !data.ok) {
          setError(data.error || 'Ошибка загрузки');
        }
      } catch (e: any) {
        if (!aborted) {
          setError(e?.message || 'Ошибка загрузки');
        }
      } finally {
        if (!aborted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      aborted = true;
    };
  }, [id]);

  const handleBack = () => {
    // 优先返回上一页，否则回到列表
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/ru/artworks');
    }
  };

  const locationLabel = item
    ? [item.location, item.district].filter(Boolean).join(', ')
    : '';

  const createdAtLabel =
    item && item.createdAt
      ? new Date(item.createdAt).toLocaleDateString('ru-RU')
      : null;

  let mainPriceLabel = '';
  if (item) {
    mainPriceLabel =
      item.forSale && item.salePriceKzt != null
        ? `${item.salePriceKzt.toLocaleString('ru-RU')} ₸`
        : item.price != null
        ? `${item.price.toLocaleString('ru-RU')} ₸`
        : item.forRent && item.rentPerDayKzt != null
        ? `${item.rentPerDayKzt.toLocaleString('ru-RU')} ₸ / день`
        : 'Цена по запросу';
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      {/* 顶部返回 + 标题区 */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="text-xs md:text-sm text-blue-600 hover:underline"
        >
          ← Назад к произведениям
        </button>

        <Link
          href="/ru/artworks"
          className="text-xs md:text-sm text-gray-500 hover:underline"
        >
          В каталог
        </Link>
      </div>

      {loading && (
        <p className="text-sm text-gray-500">Загрузка произведения…</p>
      )}

      {error && !loading && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {!loading && !error && item && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* 左侧：大图 / 媒体 */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="h-72 bg-gray-100">
              {item.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                  Нет изображения
                </div>
              )}
            </div>
          </div>

          {/* 右侧：详细信息 */}
          <div className="space-y-4">
            {/* 主标题 + 标签 */}
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-wide text-gray-800 mb-1">
                {item.title}
              </h1>
              {item.artist && (
                <p className="text-sm text-gray-600">
                  Автор: <span className="font-medium">{item.artist}</span>
                </p>
              )}
              {locationLabel && (
                <p className="text-xs text-gray-500 mt-1">
                  {locationLabel}
                </p>
              )}

              {/* 标签区 */}
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {item.forSale && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 border border-emerald-200">
                    Для продажи
                  </span>
                )}
                {item.forRent && (
                  <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 font-medium text-sky-700 border border-sky-200">
                    Для аренды
                  </span>
                )}
                {item.status && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700 border border-slate-200">
                    Статус: {item.status}
                  </span>
                )}
              </div>
            </div>

            {/* 价格信息 */}
            <section className="rounded-lg border border-gray-200 bg-white p-3 space-y-2">
              <h2 className="text-sm font-semibold text-gray-800">
                Цена и аренда
              </h2>

              <div className="flex items-baseline justify-between">
                <span className="text-xs text-gray-500">
                  Основная цена:
                </span>
                <span className="text-lg font-semibold text-blue-700">
                  {mainPriceLabel}
                </span>
              </div>

              {item.forRent && (
                <div className="space-y-1 text-xs text-gray-700">
                  {item.rentPerDayKzt != null && (
                    <div className="flex justify-between">
                      <span>Аренда (день):</span>
                      <span className="font-medium">
                        {item.rentPerDayKzt.toLocaleString('ru-RU')} ₸
                      </span>
                    </div>
                  )}
                  {item.rentPerWeekKzt != null && (
                    <div className="flex justify-between">
                      <span>Аренда (неделя):</span>
                      <span className="font-medium">
                        {item.rentPerWeekKzt.toLocaleString('ru-RU')} ₸
                      </span>
                    </div>
                  )}
                  {item.rentPerMonthKzt != null && (
                    <div className="flex justify-between">
                      <span>Аренда (месяц):</span>
                      <span className="font-medium">
                        {item.rentPerMonthKzt.toLocaleString('ru-RU')} ₸
                      </span>
                    </div>
                  )}
                </div>
              )}

              {item.quantity != null && (
                <p className="text-[11px] text-gray-500">
                  Количество в наличии: {item.quantity}
                </p>
              )}
            </section>

            {/* Описание */}
            {item.description && (
              <section className="rounded-lg border border-gray-200 bg-white p-3">
                <h2 className="text-sm font-semibold text-gray-800 mb-1">
                  Описание
                </h2>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {item.description}
                </p>
              </section>
            )}

            {/* Характеристики */}
            <section className="rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 space-y-1">
              <h2 className="text-sm font-semibold text-gray-800 mb-1">
                Характеристики
              </h2>
              <p>
                <span className="text-gray-500">Стиль:</span>{' '}
                {item.style || '—'}
              </p>
              <p>
                <span className="text-gray-500">Размер:</span>{' '}
                {item.size || '—'}
              </p>
              <p>
                <span className="text-gray-500">Категория:</span>{' '}
                {item.category || '—'}
              </p>
              <p>
                <span className="text-gray-500">Состояние:</span>{' '}
                {item.condition || '—'}
              </p>
              {createdAtLabel && (
                <p>
                  <span className="text-gray-500">Добавлено:</span>{' '}
                  {createdAtLabel}
                </p>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

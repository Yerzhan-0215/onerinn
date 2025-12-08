// src/app/ru/rentals/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

// ✅ 新增：出租方（卖家）类型（不影响原有逻辑）
type RentalOwner = {
  id: string;
  username?: string | null;
  avatarUrl?: string | null;
  contactPhone?: string | null;
  contactWhatsApp?: string | null;
  contactTelegram?: string | null;
  contactNote?: string | null;
  showName?: boolean | null;
};

type RentalItem = {
  id: string;
  ownerId: string;
  title: string;
  category: string | null;
  brand: string | null;
  modelName: string | null;

  description: string | null;
  condition: string | null;

  rentPerDayKzt: number | null;
  rentPerWeekKzt: number | null;
  rentPerMonthKzt: number | null;
  depositKzt: number | null;

  coverUrl: string | null;
  location: string | null;
  district: string | null;

  status: string;
  createdAt: string;
  updatedAt: string;

  // ✅ 新增：可选的 owner，不会影响旧数据
  owner?: RentalOwner | null;
};

type ApiResponse = {
  ok: boolean;
  items: RentalItem[];
};

// 和原来一样的类别过滤
const CATEGORIES = ['Все категории', 'Смартфоны', 'Ноутбуки', 'Планшеты'];

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <header className="mb-6">
      {/* 标题：稍小、加轻微字母间距、颜色略深 */}
      <h1 className="text-base md:text-lg font-semibold text-gray-800 tracking-[0.02em] mb-1">
        {title}
      </h1>
      {subtitle && (
        // 说明文字：颜色略浅
        <p className="text-sm md:text-base text-gray-500">
          {subtitle}
        </p>
      )}
    </header>
  );
}

export default function RentalsPage() {
  // 后端数据
  const [items, setItems] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 原来的搜索 & 类别过滤
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Все категории');

  // 新增：城市搜索
  const [cityInput, setCityInput] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('');

  // =========== 从 /api/rentals/list 加载数据（支持 cityFilter） ===========
  useEffect(() => {
    let aborted = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set('limit', '48');
        if (cityFilter) {
          params.set('city', cityFilter);
        }

        const res = await fetch(`/api/rentals/list?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`SERVER_${res.status}`);
        }

        const data = (await res.json()) as ApiResponse;
        if (!aborted) {
          setItems(Array.isArray(data.items) ? data.items : []);
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
  }, [cityFilter]);

  // 提交城市搜索
  function handleCitySubmit(e: React.FormEvent) {
    e.preventDefault();
    setCityFilter(cityInput.trim());
  }

  function resetCityFilter() {
    setCityInput('');
    setCityFilter('');
  }

  // =========== 保留原有逻辑：按名称/品牌搜索 + 按类别过滤 ===========
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items.filter((item) => {
      const name = item.title || '';
      const brand = item.brand || '';
      const model = item.modelName || '';

      const matchSearch =
        q.length === 0 ||
        name.toLowerCase().includes(q) ||
        brand.toLowerCase().includes(q) ||
        model.toLowerCase().includes(q);

      const matchCategory =
        category === 'Все категории' ||
        (item.category || '') === category;

      return matchSearch && matchCategory;
    });
  }, [items, search, category]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <SectionHeader
        title="Аренда"
        subtitle="Здесь отображаются электронные устройства, доступные для аренды."
      />

      {/* ======= 顶部过滤区域：搜索 + 城市 + 类别 ======= */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        {/* 左侧：名称/品牌搜索 + 城市搜索 */}
        <div className="flex-1 space-y-2">
          {/* 原来的搜索框：按名称 / 品牌 */}
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

          {/* 新增：城市搜索 */}
          <form
            onSubmit={handleCitySubmit}
            className="flex flex-wrap items-center gap-2"
          >
            <input
              type="text"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Город (напр.: Алматы, Астана)"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:bg-gray-900"
            >
              Найти
            </button>
            {cityFilter && (
              <button
                type="button"
                onClick={resetCityFilter}
                className="text-xs text-gray-500 hover:underline"
              >
                Сбросить
              </button>
            )}
          </form>

          {cityFilter && (
            <p className="text-xs text-gray-600">
              Показаны объявления в городе:{' '}
              <span className="font-medium">{cityFilter}</span>
            </p>
          )}
        </div>

        {/* 右侧：类别过滤（保留原样） */}
        <div className="flex flex-wrap gap-2 md:justify-end">
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

      {/* 状态提示 */}
      {loading && (
        <div className="mb-4 text-sm text-gray-500">Загрузка…</div>
      )}
      {error && (
        <div className="mb-4 text-sm text-red-600">{error}</div>
      )}

      {/* ======= 卡片列表 ======= */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!loading && !error && filtered.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            По вашему запросу пока ничего не найдено.
          </div>
        )}

        {filtered.map((item) => {
          // 价格显示逻辑：优先日租，然后周、月
          let priceLabel = 'Цена по запросу';
          if (item.rentPerDayKzt != null) {
            priceLabel = `${item.rentPerDayKzt.toLocaleString('ru-RU')} ₸ / день`;
          } else if (item.rentPerWeekKzt != null) {
            priceLabel = `${item.rentPerWeekKzt.toLocaleString(
              'ru-RU',
            )} ₸ / неделя`;
          } else if (item.rentPerMonthKzt != null) {
            priceLabel = `${item.rentPerMonthKzt.toLocaleString(
              'ru-RU',
            )} ₸ / месяц`;
          }

          const depositLabel =
            item.depositKzt != null
              ? `Залог: ${item.depositKzt.toLocaleString('ru-RU')} ₸`
              : null;

          const locationLabel = [item.location, item.district]
            .filter(Boolean)
            .join(', '); // Алматы, Бостандыкский район

          const subtitleParts = [
            item.brand,
            item.modelName,
            item.category ? `(${item.category})` : null,
          ].filter(Boolean);

          const isAvailable =
            item.status === 'AVAILABLE' || item.status === 'available';

          // ✅ 新增：卖家姓名展示逻辑（完全不影响其他逻辑）
          const owner = item.owner ?? null;
          const canShowOwnerName = !!(owner && owner.showName && owner.username);

          return (
            <Link
              key={item.id}
              href={`/ru/rentals/${item.id}`}
              className="block"
            >
              <article
                className="
                  flex flex-col rounded-xl border border-slate-200 bg-white/90
                  shadow-sm overflow-hidden
                "
              >
                {/* 顶部图片区域：如果有封面就展示，没有就用原来的渐变色占位 */}
                <div className="h-32 bg-gradient-to-br from-slate-200 via-sky-200 to-indigo-300">
                  {item.coverUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="flex flex-1 flex-col p-3 md:p-4">
                  <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-1 line-clamp-2">
                    {item.title || 'Без названия'}
                  </h2>

                  {subtitleParts.length > 0 && (
                    <p className="text-xs md:text-sm text-slate-600 mb-1">
                      {subtitleParts.join(' • ')}
                    </p>
                  )}

                  {/* ✅ 新增：仅在卖家勾选 showName 且有 username 时显示 */}
                  {canShowOwnerName && (
                    <p className="text-[11px] text-slate-500">
                      Продавец:{' '}
                      <span className="font-medium">{owner!.username}</span>
                    </p>
                  )}

                  {locationLabel && (
                    <p className="text-xs text-slate-500">
                      {locationLabel}
                    </p>
                  )}

                  {item.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-sm md:text-base font-semibold text-blue-700">
                      {priceLabel}
                    </span>
                    <span
                      className={`
                        text-xs px-2 py-0.5 rounded-full border
                        ${
                          isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }
                      `}
                    >
                      {isAvailable ? 'Свободно' : 'Занято'}
                    </span>
                  </div>

                  {depositLabel && (
                    <div className="mt-1 text-[11px] text-gray-600">
                      {depositLabel}
                    </div>
                  )}
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

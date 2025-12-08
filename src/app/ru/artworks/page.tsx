// src/app/ru/artworks/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

// 🟦 新增：作品所有者（卖家）信息类型
type ArtworkOwner = {
  id: string;
  username?: string | null;
  avatarUrl?: string | null;
  contactPhone?: string | null;
  contactWhatsApp?: string | null;
  contactTelegram?: string | null;
  contactNote?: string | null;
  // 由卖家在 /profile/edit 中决定是否展示姓名/用户名
  showName?: boolean | null;
};

// 与 /api/artworks/list 返回的数据结构一致
type ArtworkItem = {
  id: string;
  ownerId: string;
  title: string;
  artist: string | null;
  description: string | null;
  style: string | null;
  size: string | null;

  // 出售 / 租赁字段
  forSale: boolean;
  salePriceKzt: number | null;
  forRent: boolean;
  rentPerDayKzt: number | null;
  rentPerWeekKzt: number | null;
  rentPerMonthKzt: number | null;

  // 旧字段
  price: number | null;
  status: string;
  category: string | null;
  condition: string | null;
  quantity: number | null;
  coverUrl: string | null;

  // ★ 新增显示字段
  location: string | null;
  district: string | null;

  createdAt: string;
  updatedAt: string;

  // 🟦 新增：可选 owner，不影响旧数据
  owner?: ArtworkOwner | null;
};

type ApiResponse = {
  ok: boolean;
  items: ArtworkItem[];
};

// 与你之前一样的风格列表
const STYLES = ['Все стили', 'Живопись', 'Абстракция', 'Пейзаж'] as const;
type StyleFilter = (typeof STYLES)[number];

type SectionHeaderProps = { title: string; subtitle?: string };

function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <header className="mb-6">
      {/* 标题：稍小、加轻微字母间距、颜色更深一点 */}
      <h1 className="text-base md:text-lg font-semibold text-gray-800 tracking-[0.02em] mb-1">
        {title}
      </h1>
      {subtitle && (
        // 说明文字：比标题稍浅一点
        <p className="text-sm md:text-base text-gray-500">
          {subtitle}
        </p>
      )}
    </header>
  );
}

export default function ArtworksPage() {
  // 后端加载的数据
  const [items, setItems] = useState<ArtworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 原来的搜索 / 过滤状态
  const [search, setSearch] = useState('');
  const [style, setStyle] = useState<StyleFilter>('Все стили');
  const [mode, setMode] = useState<'all' | 'sale' | 'rent'>('all');

  // ★ 新增：城市搜索
  const [cityInput, setCityInput] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('');

  // ===============  从 /api/artworks/list 加载数据（支持 mode + city）  ===============
  useEffect(() => {
    let aborted = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set('mode', mode); // all / sale / rent —— 交给后端先过滤一层
        params.set('limit', '48');

        if (cityFilter) {
          params.set('city', cityFilter);
        }

        const res = await fetch(`/api/artworks/list?${params.toString()}`);
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
  }, [mode, cityFilter]);

  // ===============  前端再做：按标题/作者搜索 + 风格过滤  ===============
  const filtered = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return items.filter((art) => {
      // 标题 / 作者 搜索
      const matchSearch =
        !searchText ||
        art.title.toLowerCase().includes(searchText) ||
        (art.artist || '').toLowerCase().includes(searchText);

      // 风格过滤（‘Все стили’ = 不限制）
      const matchStyle =
        style === 'Все стили'
          ? true
          : (art.style || '') === style;

      return matchSearch && matchStyle;
    });
  }, [items, search, style]);

  // 城市搜索提交
  function handleCitySubmit(e: React.FormEvent) {
    e.preventDefault();
    setCityFilter(cityInput.trim());
  }

  function resetCityFilter() {
    setCityInput('');
    setCityFilter('');
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* 顶部大标题（保留你原来的文案） */}
      <SectionHeader
        title="Произведения"
        subtitle="Каталог произведений искусства Onerinn. Часть работ доступна для продажи, часть — для аренды, а некоторые — и для того, и для другого."
      />

      {/* ========== 顶部过滤条：搜索 + 城市 + 风格 + 出售/租赁模式 ========== */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        {/* 左侧：按标题 / 作者搜索 + 城市搜索 */}
        <div className="flex-1 space-y-2">
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

          {/* 城市搜索（放在左侧下面） */}
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
              Показаны произведения в городе:{' '}
              <span className="font-medium">{cityFilter}</span>
            </p>
          )}
        </div>

        {/* 右侧：出售/出租模式 + 风格按钮组 */}
        <div className="flex flex-col gap-2 md:items-end">
          {/* 出售 / 出租模式（保留原来的按钮逻辑） */}
          <div className="inline-flex rounded-full bg-slate-100 p-1">
            {[
              { key: 'all', label: 'Все' },
              { key: 'sale', label: 'Для продажи' },
              { key: 'rent', label: 'Для аренды' },
            ].map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMode(m.key as 'all' | 'sale' | 'rent')}
                className={`
                  px-3 py-1 text-xs md:text-sm rounded-full transition
                  ${
                    mode === m.key
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }
                `}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* 风格过滤按钮组（保留原样） */}
          <div className="flex flex-wrap gap-2 justify-end">
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
      </div>

      {/* 状态提示：加载 / 错误 */}
      {loading && (
        <div className="mb-4 text-sm text-gray-500">Загрузка…</div>
      )}
      {error && (
        <div className="mb-4 text-sm text-red-600">{error}</div>
      )}

      {/* 卡片列表（现在每张卡片变成 Link，可点击跳详情） */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!loading && !error && filtered.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            По вашему запросу пока ничего не найдено.
          </div>
        )}

        {filtered.map((art) => {
          const priceLabel =
            art.forSale && art.salePriceKzt != null
              ? `${art.salePriceKzt.toLocaleString('ru-RU')} ₸`
              : art.price != null
              ? `${art.price.toLocaleString('ru-RU')} ₸`
              : art.forRent && art.rentPerDayKzt != null
              ? `${art.rentPerDayKzt.toLocaleString('ru-RU')} ₸ / день`
              : 'Цена по запросу';

          const locationLabel = [art.location, art.district]
            .filter(Boolean)
            .join(', '); // Алматы, Бостандыкский район

          // 🟦 新增：卖家展示逻辑（与 rentals 保持一致）
          const owner = art.owner ?? null;
          const canShowOwnerName = !!(owner && owner.showName && owner.username);

          return (
            <Link
              key={art.id}
              href={`/ru/artworks/${art.id}`}
              className="block"
            >
              <article
                className="
                  flex flex-col rounded-xl border border-slate-200 bg-white/90
                  shadow-sm overflow-hidden
                "
              >
                {/* 图片区域 */}
                <div className="h-36 bg-gray-100">
                  {art.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={art.coverUrl}
                      alt={art.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                      Нет изображения
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-3 md:p-4">
                  {/* 标题 + 作者 + 城市 + 卖家 */}
                  <div className="mb-2">
                    <h2 className="text-base md:text-lg font-semibold text-slate-900 line-clamp-2">
                      {art.title}
                    </h2>
                    {art.artist && (
                      <p className="text-xs md:text-sm text-slate-600">
                        Автор: {art.artist}
                      </p>
                    )}

                    {/* 🟦 新增：仅在卖家勾选 showName 且设置 username 时展示 */}
                    {canShowOwnerName && (
                      <p className="text-[11px] text-slate-500">
                        Продавец:{' '}
                        <span className="font-medium">
                          {owner!.username}
                        </span>
                      </p>
                    )}

                    {locationLabel && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {locationLabel}
                      </p>
                    )}
                  </div>

                  {/* 风格 / 尺寸 */}
                  <p className="text-xs text-slate-500 mb-2">
                    Стиль: {art.style || '—'}
                    {art.size ? ` · ${art.size}` : ''}
                  </p>

                  {/* 简短描述 */}
                  {art.description && (
                    <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                      {art.description}
                    </p>
                  )}

                  {/* 出售 / 租赁 标签 */}
                  <div className="mb-2 flex flex-wrap gap-2">
                    {art.forSale && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
                        Для продажи
                      </span>
                    )}
                    {art.forRent && (
                      <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 border border-sky-200">
                        Для аренды
                      </span>
                    )}
                  </div>

                  {/* 价格区：出售 + 租赁简要 */}
                  <div className="mt-auto space-y-1 pt-2 border-t border-slate-100">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">
                        Цена / аренда:
                      </span>
                      <span className="text-sm md:text-base font-semibold text-blue-700">
                        {priceLabel}
                      </span>
                    </div>

                    {art.forRent && (
                      <div className="space-y-0.5 text-xs text-slate-600">
                        {art.rentPerDayKzt && (
                          <div className="flex justify между">
                            <span>День:</span>
                            <span className="font-medium">
                              {art.rentPerDayKzt.toLocaleString('ru-RU')} ₸
                            </span>
                          </div>
                        )}
                        {art.rentPerWeekKzt && (
                          <div className="flex justify-between">
                            <span>Неделя:</span>
                            <span className="font-medium">
                              {art.rentPerWeekKzt.toLocaleString('ru-RU')} ₸
                            </span>
                          </div>
                        )}
                        {art.rentPerMonthKzt && (
                          <div className="flex justify-between">
                            <span>Месяц:</span>
                            <span className="font-medium">
                              {art.rentPerMonthKzt.toLocaleString('ru-RU')} ₸
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

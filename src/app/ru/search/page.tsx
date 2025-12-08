// src/app/ru/search/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type ResultType = 'all' | 'rental' | 'artwork';

type SearchResult = {
  id: string;
  title: string | null;
  description?: string | null;
  type: 'rental' | 'artwork';
  coverUrl?: string | null;
  rentPerDayKzt?: number | null;
  rentPerMonthKzt?: number | null;
  location?: string | null;
  // 新增：后端 now 可能返回 biz（'electronic' | 'art' 等）
  biz?: string | null;
};

const TABS: { id: ResultType; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'rental', label: 'Техника в аренду' },
  { id: 'artwork', label: 'Произведения искусства' },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = (searchParams?.get('q') ?? '').trim();

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ResultType>('all');

  useEffect(() => {
    if (!q) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setResults(data.results || []);
      })
      .catch((err) => {
        console.error(err);
        setError('Произошла ошибка при поиске. Попробуйте ещё раз.');
      })
      .finally(() => setLoading(false));
  }, [q]);

  const handleNewSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newQ = String(formData.get('q') || '').trim();
    if (!newQ) return;
    router.push(`/ru/search?q=${encodeURIComponent(newQ)}`);
  };

  const filteredResults = useMemo(() => {
    if (activeTab === 'all') return results;
    return results.filter((r) => r.type === activeTab);
  }, [results, activeTab]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 标题区域 */}
      <header className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
          Результаты поиска
        </h1>
        {q ? (
          <p className="text-sm md:text-base text-gray-500">
            Запрос: <span className="font-medium text-gray-800">«{q}»</span>
          </p>
        ) : (
          <p className="text-sm md:text-base text-gray-500">
            Введите ключевые слова, чтобы найти технику или произведения искусства.
          </p>
        )}
      </header>

      {/* 顶部搜索条（简洁版） */}
      <form
        onSubmit={handleNewSearch}
        className="mb-6 flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm"
      >
        <span className="text-xs uppercase tracking-wide text-gray-400">
          search
        </span>
        <input
          name="q"
          defaultValue={q}
          placeholder="Поиск: электронные устройства или произведения"
          className="flex-1 bg-transparent outline-none text-sm md:text-base"
        />
        <button
          type="submit"
          className="rounded-full px-4 py-1 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
        >
          Искать
        </button>
      </form>

      {/* Tabs：全部 / 租赁 / 艺术品 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              'rounded-full px-4 py-1 text-xs md:text-sm border transition-colors',
              activeTab === tab.id
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 状态提示 */}
      {loading && <p className="text-gray-500">Идёт поиск…</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && !q && (
        <p className="text-gray-500">
          Начните с ввода запроса в поле поиска выше.
        </p>
      )}

      {!loading && !error && q && filteredResults.length === 0 && (
        <p className="text-gray-500">
          По запросу «{q}» ничего не найдено. Попробуйте изменить формулировку.
        </p>
      )}

      {/* 结果列表 */}
      {!loading && !error && filteredResults.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs md:text-sm text-gray-500">
            Найдено: {filteredResults.length} результат(ов)
          </p>

          {filteredResults.map((item) => {
            // 关键修改：优先使用后端返回的 biz 字段决定跳转
            // 如果 biz==='electronic' -> 跳 /ru/electronics/:id
            // 否则 -> 跳 /ru/artworks/:id
            // 回退逻辑：如果没有 biz，则保持原来基于 item.type 的行为（rental -> /ru/rentals, artwork -> /ru/artworks）
            const href = (() => {
              const biz = (item as SearchResult & { biz?: string | null }).biz;
              if (typeof biz === 'string') {
                if (biz.toLowerCase() === 'electronic') return `/ru/electronics/${item.id}`;
                // 其他 biz 值默认当作作品处理（可扩展）
                return `/ru/artworks/${item.id}`;
              }

              // fallback: 保持原有逻辑（rental -> rentals, artwork -> artworks）
              return item.type === 'rental' ? `/ru/rentals/${item.id}` : `/ru/artworks/${item.id}`;
            })();

            const typeLabel =
              item.type === 'rental' ? 'Аренда техники' : 'Произведение искусства';

            return (
              <Link
                key={item.type + item.id}
                href={href}
                className="block rounded-2xl border border-gray-100 bg-white p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4 md:gap-5">
                  {/* 左侧图片 */}
                  {item.coverUrl && (
                    <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.coverUrl}
                        alt={item.title || ''}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  {/* 中间信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                        {typeLabel}
                      </span>
                      {item.location && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">
                          {item.location}
                        </span>
                      )}
                    </div>

                    <h2 className="text-sm md:text-base font-semibold text-gray-900 line-clamp-2">
                      {item.title || 'Без названия'}
                    </h2>

                    {item.description && (
                      <p className="mt-1 text-xs md:text-sm text-gray-500 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* 右侧价格/按钮区域 */}
                  <div className="flex flex-col items-end justify-between gap-2">
                    {item.type === 'rental' && item.rentPerDayKzt && (
                      <div className="text-right">
                        <p className="text-xs text-gray-400">от</p>
                        <p className="text-sm md:text-base font-semibold text-gray-900">
                          {item.rentPerDayKzt} ₸ <span className="text-xs text-gray-500">/ день</span>
                        </p>
                      </div>
                    )}

                    <span className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-xs md:text-sm text-gray-700 hover:border-gray-400">
                      Открыть
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

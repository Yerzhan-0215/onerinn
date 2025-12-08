// src/app/ru/dashboard/listings/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type BizType = 'art' | 'electronic';
type ListingStatus = 'draft' | 'published';
type PricingKind = 'rental' | 'sale' | 'free' | null;
type SellerVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | null;

type ListingItem = {
  id: string;
  title: string;
  status: ListingStatus;
  biz: BizType;
  category: string | null;
  quantity: number | null;
  // 模式 / 交易类型（和新建页面保持一致）
  pricingKind: PricingKind;
  // 日租价（如果是 аренда）
  pricePerDay: number | null;
  // 封面图（可选）
  coverUrl?: string | null;
  // 更新时间
  updatedAt: string | null;
};

type ListingsResponse =
  | { items: ListingItem[] }
  | { listings: ListingItem[] }
  | ListingItem[];

export default function DashboardListingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [sellerVerification, setSellerVerification] =
    useState<SellerVerificationStatus>(null);

  // 简单筛选：所有 / аренда / продажа
  const [dealFilter, setDealFilter] =
    useState<'all' | 'rental' | 'sale'>('all');
  // 艺术 / 电子 / 全部
  const [bizFilter, setBizFilter] =
    useState<'all' | 'art' | 'electronic'>('all');

  // ===== 获取 “我是谁” + 卖家验证状态 =====
  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      try {
        const res = await fetch('/api/me', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        const status: SellerVerificationStatus =
          data?.user?.sellerVerificationStatus ??
          data?.sellerVerificationStatus ??
          null;

        setSellerVerification(status);
      } catch {
        // 静默失败即可，不影响列表显示
      }
    }

    loadMe();

    return () => {
      cancelled = true;
    };
  }, []);

  // ===== 获取 “我的公告列表” =====
  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/dashboard/listings', {
          cache: 'no-store',
        });
        if (!res.ok) {
          throw new Error(`SERVER_${res.status}`);
        }
        const data: ListingsResponse = await res.json();

        if (cancelled) return;

        let items: ListingItem[];
        if (Array.isArray(data)) {
          items = data;
        } else if ('items' in data && Array.isArray(data.items)) {
          items = data.items;
        } else if ('listings' in data && Array.isArray(data.listings)) {
          items = data.listings;
        } else {
          items = [];
        }

        setListings(items);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Не удалось загрузить объявления');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadListings();

    return () => {
      cancelled = true;
    };
  }, []);

  // ===== 根据筛选器过滤列表（前端过滤，不改原数据） =====
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      if (dealFilter === 'rental' && l.pricingKind !== 'rental') return false;
      if (dealFilter === 'sale' && l.pricingKind !== 'sale') return false;

      if (bizFilter === 'art' && l.biz !== 'art') return false;
      if (bizFilter === 'electronic' && l.biz !== 'electronic') return false;

      return true;
    });
  }, [listings, dealFilter, bizFilter]);

  // ===== 工具函数：显示文本 =====
  function formatBiz(biz: BizType) {
    return biz === 'art' ? 'Искусство' : 'Электроника';
  }

  function formatPricingKind(kind: PricingKind) {
    if (kind === 'rental') return 'Аренда';
    if (kind === 'sale') return 'Продажа';
    if (kind === 'free') return 'Бесплатно';
    return '—';
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('ru-RU');
  }

  function formatPrice(price: number | null) {
    if (price == null) return '—';
    return `₸ ${price.toLocaleString('ru-RU')}`;
  }

  const isSellerVerified = sellerVerification === 'APPROVED';

  // ===== 点击 “Опубликовать” 的逻辑 =====
  async function handlePublishClick(listing: ListingItem) {
    // 1) 如果还没通过 верификация → 弹窗提示并跳转验证页面
    if (!isSellerVerified) {
      const go = window.confirm(
        'Чтобы опубликовать объявление, вам нужно пройти верификацию продавца.\n\nПерейти к шагу верификации сейчас?',
      );
      if (go) {
        router.push('/ru/profile/verify');
      }
      return;
    }

    // 2) 已通过验证 → 调用后端把 статус=published
    try {
      const res = await fetch('/api/dashboard/listings/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: listing.id }),
      });

      if (!res.ok) {
        throw new Error(`SERVER_${res.status}`);
      }

      // 刷新列表
      const updated = await res.json().catch(() => null);

      // 如果后端返回最新列表，就用；否则简单重新请求一次
      if (updated && Array.isArray(updated.items)) {
        setListings(updated.items);
      } else {
        const refRes = await fetch('/api/dashboard/listings', {
          cache: 'no-store',
        });
        const data: ListingsResponse = await refRes.json();
        if (Array.isArray(data)) {
          setListings(data);
        } else if ('items' in data && Array.isArray(data.items)) {
          setListings(data.items);
        } else if ('listings' in data && Array.isArray(data.listings)) {
          setListings(data.listings);
        }
      }
    } catch (e) {
      console.error(e);
      window.alert(
        'Не удалось опубликовать объявление. Пожалуйста, попробуйте позже.',
      );
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold mb-1">Мои объявления</h1>
        <p className="text-sm text-gray-500">
          Здесь отображаются все ваши объявления по аренде и продаже.
        </p>
      </div>

      {/* 上方筛选按钮（视觉和原表格版本保持接近） */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterPill
          active={dealFilter === 'all'}
          onClick={() => setDealFilter('all')}
        >
          Все
        </FilterPill>
        <FilterPill
          active={dealFilter === 'rental'}
          onClick={() => setDealFilter('rental')}
        >
          Аренда
        </FilterPill>
        <FilterPill
          active={dealFilter === 'sale'}
          onClick={() => setDealFilter('sale')}
        >
          Продажа
        </FilterPill>

        <span className="mx-3 h-5 w-px bg-gray-200" />

        <FilterPill
          active={bizFilter === 'all'}
          onClick={() => setBizFilter('all')}
        >
          Все категории
        </FilterPill>
        <FilterPill
          active={bizFilter === 'art'}
          onClick={() => setBizFilter('art')}
        >
          Искусство
        </FilterPill>
        <FilterPill
          active={bizFilter === 'electronic'}
          onClick={() => setBizFilter('electronic')}
        >
          Электроника
        </FilterPill>

        <div className="ml-auto flex gap-2">
          <Link
            href="/ru/dashboard/listings/new?type=art"
            className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            + Произведение
          </Link>
          <Link
            href="/ru/dashboard/listings/new?type=electronic"
            className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            + Электроника
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-500">Загружаем объявления…</div>
      ) : filteredListings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-6 text-sm text-gray-500">
          У вас пока нет объявлений по выбранным фильтрам.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredListings.map((l) => (
            <div
              key={l.id}
              className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              {/* 左侧：缩略图 + 详细信息 */}
              <div className="flex gap-3">
                {l.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={l.coverUrl}
                    alt={l.title || 'Фото'}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                    Нет фото
                  </div>
                )}

                {/* ⭐ 标题 + 一行横向信息 */}
                <div className="space-y-1 text-sm">
                  <div className="font-medium">
                    {l.title || 'Без названия'}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span>
                      Объявление · {formatPricingKind(l.pricingKind)} ·{' '}
                      {formatBiz(l.biz)}
                    </span>
                    <span>Категория: {l.category || '—'}</span>
                    <span>Кол-во: {l.quantity ?? 1}</span>
                    <span>Цена/день: {formatPrice(l.pricePerDay)}</span>
                    <span>Обновлено: {formatDate(l.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* 右侧：操作按钮 + 状态/发布按钮 */}
              <div className="flex flex-col items-end gap-2">
                <Link
                  href={`/ru/dashboard/listings/${l.id}/edit?type=${l.biz}`}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  Редактировать
                </Link>

                {l.status === 'published' && isSellerVerified ? (
                  // ✅ 卖家已通过验证 + объявление 已发布 → 绿色 “Опубликовано” 标签
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                    Опубликовано
                  </span>
                ) : (
                  // ❗ 还没发布 或 卖家未通过验证 → “Опубликовать” 按钮
                  <button
                    type="button"
                    onClick={() => handlePublishClick(l)}
                    className="inline-flex items-center rounded-full border border-blue-500 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                  >
                    Опубликовать
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- 小组件：筛选按钮 ---------- */

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full px-3 py-1 text-sm border',
        active
          ? 'border-gray-900 bg-gray-900 text-white'
          : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

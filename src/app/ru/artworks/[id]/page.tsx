// src/app/ru/artworks/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// ✅ 新增：卖家验证状态类型（与 rentals 保持一致）
type SellerVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type ArtworkOwner = {
  id: string;
  username?: string | null;
  name?: string | null; // ⭐ 新增：备用真实姓名，用于“username 优先，没有就 name”
  avatarUrl?: string | null;
  contactPhone?: string | null;
  contactWhatsApp?: string | null;
  contactTelegram?: string | null;
  contactNote?: string | null;
  // ✅ 新增：是否允许向买家展示姓名/用户名（由卖家在 /profile/edit 决定）
  showName?: boolean | null;

  // ✅ 新增：卖家验证状态
  sellerVerificationStatus?: SellerVerificationStatus | null;
};

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

  // ✅ 所有者（卖家）信息（可选），不影响已有字段
  owner?: ArtworkOwner | null;
};

type DetailApiResponse =
  | { ok: true; item: ArtworkDetail }
  | { ok: false; error: string };

// ✅ 当前登录用户（只关心是否登录）
type MeUser = {
  id: string;
  username?: string | null;
  email?: string | null;
};

export default function ArtworkDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [item, setItem] = useState<ArtworkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ 当前登录用户（undefined = 还在加载，null = 未登录）
  const [me, setMe] = useState<MeUser | null | undefined>(undefined);
  const [meLoading, setMeLoading] = useState(true);

  // ✅ “显示联系方式”控制
  const [showContacts, setShowContacts] = useState(false);
  const [loginHint, setLoginHint] = useState(false);

  // ========= 加载作品详情 =========
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

  // ========= 加载当前登录用户（用于判断是否已登录） =========
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch('/api/me', { cache: 'no-store' });
        if (!alive) return;

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          setMe(data?.user ?? null);
        } else {
          setMe(null);
        }
      } catch {
        if (!alive) return;
        setMe(null);
      } finally {
        if (alive) {
          setMeLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

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

  const owner = item?.owner ?? null;
  // ⭐ 调整逻辑：只要卖家允许展示，并且 username 或 name 有一个，就可以显示
  const canShowOwnerName = !!(
    owner &&
    owner.showName &&
    (owner.username || owner.name)
  );

  // ✅ 新增：是否通过验证
  const isVerifiedSeller =
    owner?.sellerVerificationStatus === 'APPROVED';

  const handleShowContactsClick = () => {
    if (meLoading) return; // 还在判断登录状态，先不动
    if (!me) {
      // 未登录：提示先登录
      setLoginHint(true);
      return;
    }
    setShowContacts(true);
    setLoginHint(false);
  };

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
          {/* 左侧：大图 / медиa */}
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

            {/* ✅ 联系卖家：登录后显示联系方式，姓名仅在 showName=true 时显示 */}
            {owner && (
              <section className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="mb-2 text-sm font-semibold">
                  Связаться с владельцем
                </h3>

                {/* ✅ 新增：验证徽章 */}
                {isVerifiedSeller && (
                  <p className="mb-1 text-[11px] text-emerald-700">
                    ✅ Проверенный продавец
                  </p>
                )}

                {/* 只有在卖家选择“显示我的姓名”时才展示用户名/姓名 */}
                {canShowOwnerName && (
                  <p className="mb-1 text-xs text-gray-600">
                    Продавец:{' '}
                    <span className="font-medium">
                      {owner.username || owner.name}
                    </span>
                  </p>
                )}

                {/* “显示联系方式”按钮 */}
                {!showContacts && (
                  <button
                    type="button"
                    onClick={handleShowContactsClick}
                    className="btn btn-primary btn-sm"
                  >
                    Показать контакты
                  </button>
                )}

                {/* 未登录提示 */}
                {loginHint && !showContacts && (
                  <p className="mt-2 text-xs text-red-600">
                    Чтобы увидеть контакты владельца, пожалуйста,&nbsp;
                    <Link
                      href={`/ru/login?callbackUrl=/ru/artworks/${item.id}`}
                      className="text-blue-600 underline"
                    >
                      войдите в систему
                    </Link>
                    .
                  </p>
                )}

                {/* 已登录并点击后显示联系方式 */}
                {showContacts && (
                  <div className="mt-2 space-y-1 text-sm text-gray-700">
                    {owner.contactPhone && (
                      <div>
                        Телефон / WhatsApp:{' '}
                        <a
                          href={`tel:${owner.contactPhone}`}
                          className="text-blue-600 underline"
                        >
                          {owner.contactPhone}
                        </a>
                      </div>
                    )}

                    {owner.contactWhatsApp && (
                      <div>
                        WhatsApp:{' '}
                        <a
                          href={
                            owner.contactWhatsApp.startsWith('http')
                              ? owner.contactWhatsApp
                              : `https://wa.me/${owner.contactWhatsApp.replace(/\D/g, '')}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          Написать в WhatsApp
                        </a>
                      </div>
                    )}

                    {owner.contactTelegram && (
                      <div>
                        Telegram:{' '}
                        <a
                          href={`https://t.me/${owner.contactTelegram.replace('@', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          @{owner.contactTelegram.replace('@', '')}
                        </a>
                      </div>
                    )}

                    {owner.contactNote && (
                      <div className="mt-1 text-xs text-gray-500">
                        {owner.contactNote}
                      </div>
                    )}

                    {!owner.contactPhone &&
                      !owner.contactWhatsApp &&
                      !owner.contactTelegram && (
                        <div className="text-xs text-gray-500 mt-1">
                          Владелец пока не оставил контакты. Попробуйте позже.
                        </div>
                      )}
                  </div>
                )}
              </section>
            )}

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

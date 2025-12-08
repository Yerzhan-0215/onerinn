// src/app/ru/rentals/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// ✅ 新增：卖家验证状态类型（仅前端使用）
type SellerVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type RentalOwner = {
  id: string;
  username?: string | null;
  name?: string | null; // ⭐ 新增：用于优先/备用显示
  avatarUrl?: string | null;
  contactPhone?: string | null;
  contactWhatsApp?: string | null;
  contactTelegram?: string | null;
  contactNote?: string | null;
  showName?: boolean | null;

  // ✅ 新增：卖家验证状态（可选，不影响后端现有返回）
  sellerVerificationStatus?: SellerVerificationStatus | null;
};

type RentalDetail = {
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

  // 将来后端可以返回多图数组（比如 JSON 字段 images: string[]）
  images?: string[] | null;

  location: string | null;
  district: string | null;

  status: string;
  createdAt: string;
  updatedAt: string;

  // ✅ 新增：出租方（卖家）信息
  owner?: RentalOwner | null;
};

type DetailApiResponse =
  | { ok: true; item: RentalDetail }
  | { ok: false; error: string };

type ListApiResponse = {
  ok: boolean;
  items: RentalDetail[];
};

// ✅ 当前登录用户
type MeUser = {
  id: string;
  username?: string | null;
  email?: string | null;
};

export default function RentalDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [item, setItem] = useState<RentalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 推荐商品
  const [similarItems, setSimilarItems] = useState<RentalDetail[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  // 轮播当前索引
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ 当前登录用户 + “显示联系方式”控制
  const [me, setMe] = useState<MeUser | null | undefined>(undefined);
  const [meLoading, setMeLoading] = useState(true);
  const [showContacts, setShowContacts] = useState(false);
  const [loginHint, setLoginHint] = useState(false);

  // ========= 加载详情 =========
  useEffect(() => {
    if (!id) return;

    let aborted = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/rentals/${id}`);
        if (res.status === 404) {
          if (!aborted) {
            setError('Объявление не найдено или снято с публикации.');
          }
          return;
        }
        if (!res.ok) {
          throw new Error(`SERVER_${res.status}`);
        }

        const data = (await res.json()) as DetailApiResponse;

        if (aborted) return;

        if (data.ok) {
          setItem(data.item);
        } else {
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

  // ========= 加载当前用户（判断是否登录） =========
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

  // ========= 加载推荐商品 =========
  useEffect(() => {
    // item 还没加载出来时不请求
    if (!item) return;

    let aborted = false;

    async function loadSimilar(current: RentalDetail) {
      setSimilarLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('limit', '12');

        // 简单推荐：同城 + 同类别 优先
        if (current.location) params.set('city', current.location);
        if (current.category) params.set('category', current.category);

        const res = await fetch(`/api/rentals/list?${params.toString()}`);
        if (!res.ok) return;

        const data = (await res.json()) as ListApiResponse;
        if (aborted) return;

        const filtered = (data.items || [])
          .filter((it) => it.id !== current.id)
          .filter((it) =>
            current.category ? it.category === current.category : true,
          )
          .slice(0, 6);

        setSimilarItems(filtered);
      } catch {
        // 推荐失败不影响详情主功能
      } finally {
        if (!aborted) {
          setSimilarLoading(false);
        }
      }
    }

    loadSimilar(item);

    return () => {
      aborted = true;
    };
  }, [item]);

  // ========= 图片数组：优先多图 images，其次降级为 coverUrl =========
  const images: string[] =
    (item?.images && item.images.length > 0
      ? item.images.filter(Boolean)
      : item?.coverUrl
      ? [item.coverUrl]
      : []) as string[];

  const imageCount = images.length;

  // ========= 自动轮播（简单每 5 秒切一张） =========
  useEffect(() => {
    if (imageCount <= 1) {
      setCurrentIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imageCount);
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, [imageCount]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/ru/rentals');
    }
  };

  // ======== 顶部状态渲染：loading / error / not found ========
  if (loading) {
    return (
      <div className="p-6 mx-auto max-w-6xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="text-xs md:text-sm text-blue-600 hover:underline"
          >
            ← Назад к аренде
          </button>

          <Link
            href="/ru/rentals"
            className="text-xs md:text-sm text-gray-500 hover:underline"
          >
            В каталог аренды
          </Link>
        </div>

        <p className="text-sm text-gray-500">Загрузка объявления…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 mx-auto max-w-6xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="text-xs md:text-sm text-blue-600 hover:underline"
          >
            ← Назад к аренде
          </button>

          <Link
            href="/ru/rentals"
            className="text-xs md:text-sm text-gray-500 hover:underline"
          >
            В каталог аренды
          </Link>
        </div>

        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-6 mx-auto max-w-6xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="text-xs md:text-sm text-blue-600 hover:underline"
          >
            ← Назад к аренде
          </button>

          <Link
            href="/ru/rentals"
            className="text-xs md:text-sm text-gray-500 hover:underline"
          >
            В каталог аренды
          </Link>
        </div>

        <p className="text-sm text-gray-500">Объявление не найдено.</p>
      </div>
    );
  }

  // ======== 下面开始：item 一定非 null，放心使用 ========
  const locationLabel = [item.location, item.district]
    .filter(Boolean)
    .join(', ');

  const createdAtLabel = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('ru-RU')
    : null;

  let mainPriceLabel = 'Цена по запросу';
  if (item.rentPerDayKzt != null) {
    mainPriceLabel = `${item.rentPerDayKzt.toLocaleString('ru-RU')} ₸ / день`;
  } else if (item.rentPerWeekKzt != null) {
    mainPriceLabel = `${item.rentPerWeekKzt.toLocaleString(
      'ru-RU',
    )} ₸ / неделя`;
  } else if (item.rentPerMonthKzt != null) {
    mainPriceLabel = `${item.rentPerMonthKzt.toLocaleString(
      'ru-RU',
    )} ₸ / месяц`;
  }

  const depositLabel =
    item.depositKzt != null
      ? `${item.depositKzt.toLocaleString('ru-RU')} ₸`
      : null;

  const isAvailable =
    item.status === 'AVAILABLE' || item.status === 'available';

  const owner = item.owner ?? null;

  // ⭐ 新增：统一的展示名称逻辑（优先 username，没有就 name）
  const displayName = owner?.username || owner?.name || null;
  const canShowOwnerName = !!(owner && owner.showName && displayName);

  // ✅ 新增：是否通过验证
  const isVerifiedSeller =
    owner?.sellerVerificationStatus === 'APPROVED';

  const handleShowContactsClick = () => {
    if (meLoading) return;
    if (!me) {
      setLoginHint(true);
      return;
    }
    setShowContacts(true);
    setLoginHint(false);
  };

  return (
    <div className="p-6 mx-auto space-y-6 max-w-6xl">
      {/* 顶部返回 + 链接 */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="text-xs md:text-sm text-blue-600 hover:underline"
        >
          ← Назад к аренде
        </button>

        <Link
          href="/ru/rentals"
          className="text-xs md:text-sm text-gray-500 hover:underline"
        >
          В каталог аренды
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 左侧：图片轮播（多图 / 单图 / 无图 三种情况） */}
        <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="relative h-72 bg-gradient-to-br from-slate-200 via-sky-200 to-indigo-300">
            {imageCount > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[currentIndex]}
                alt={item.title}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">
                Нет изображения
              </div>
            )}

            {/* 左右切换按钮（多图时才出现） */}
            {imageCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex((prev) =>
                      prev === 0 ? imageCount - 1 : prev - 1,
                    );
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-2 py-1 text-xs text-white hover:bg-black/60"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex((prev) => (prev + 1) % imageCount);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-2 py-1 text-xs text-white hover:bg-black/60"
                >
                  ›
                </button>
              </>
            )}

            {/* 底部圆点指示器 */}
            {imageCount > 1 && (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    className={`h-2 w-2 rounded-full ${
                      idx === currentIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 底部缩略图条（有多图时） */}
          {imageCount > 1 && (
            <div className="flex gap-2 p-2 overflow-x-auto bg-gray-50 border-t border-gray-200">
              {images.map((src, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-md border ${
                    idx === currentIndex
                      ? 'border-blue-500'
                      : 'border-gray-200'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${item.title} ${idx + 1}`}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 右侧：详细信息 */}
        <div className="space-y-4">
          {/* 主标题区 */}
          <div>
            <h1 className="mb-1 text-xl font-semibold tracking-wide text-gray-800 md:text-2xl">
              {item.title || 'Без названия'}
            </h1>

            <p className="text-sm text-gray-600">
              {[item.brand, item.modelName, item.category]
                .filter(Boolean)
                .join(' • ') || 'Электронное устройство'}
            </p>

            {locationLabel && (
              <p className="mt-1 text-xs text-gray-500">{locationLabel}</p>
            )}

            <div className="flex flex-wrap gap-2 mt-3 text-xs">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 border ${
                  isAvailable
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {isAvailable ? 'Свободно' : 'Занято'}
              </span>

              {item.status && (
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-gray-700 bg-slate-100 border border-slate-200 rounded-full">
                  Статус: {item.status}
                </span>
              )}
            </div>
          </div>

          {/* 价格区块 */}
          <section className="p-3 space-y-2 bg-white border border-gray-200 rounded-lg">
            <h2 className="text-sm font-semibold text-gray-800">
              Условия аренды
            </h2>

            <div className="flex items-baseline justify-between">
              <span className="text-xs text-gray-500">Основная ставка:</span>
              <span className="text-lg font-semibold text-blue-700">
                {mainPriceLabel}
              </span>
            </div>

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

            {depositLabel && (
              <p className="mt-1 text-[11px] text-gray-500">
                Залог:{' '}
                <span className="font-medium">{depositLabel}</span>
              </p>
            )}

            {createdAtLabel && (
              <p className="text-[11px] text-gray-500">
                Объявление добавлено: {createdAtLabel}
              </p>
            )}
          </section>

          {/* ✅ 联系出租方：同样登录后才能看到联系方式，姓名仅在 showName=true 时展示 */}
          {owner && (
            <section className="p-3 bg-white border border-gray-200 rounded-lg">
              <h2 className="mb-2 text-sm font-semibold text-gray-800">
                Связаться с владельцем
              </h2>

              {/* ✅ 新增：验证徽章（独立一行，不影响原有逻辑） */}
              {isVerifiedSeller && (
                <p className="mb-1 text-[11px] text-emerald-700">
                  ✅ Проверенный продавец
                </p>
              )}

              {canShowOwnerName && displayName && (
                <p className="mb-1 text-xs text-gray-600">
                  Продавец:{' '}
                  <span className="font-medium">{displayName}</span>
                </p>
              )}

              {!showContacts && (
                <button
                  type="button"
                  onClick={handleShowContactsClick}
                  className="btn btn-primary btn-sm"
                >
                  Показать контакты
                </button>
              )}

              {loginHint && !showContacts && (
                <p className="mt-2 text-xs text-red-600">
                  Чтобы увидеть контакты владельца, пожалуйста,&nbsp;
                  <Link
                    href={`/ru/login?callbackUrl=/ru/rentals/${item.id}`}
                    className="text-blue-600 underline"
                  >
                    войдите в систему
                  </Link>
                  .
                </p>
              )}

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
                    <p className="mt-1 text-xs text-gray-500">
                      {owner.contactNote}
                    </p>
                  )}

                  {!owner.contactPhone &&
                    !owner.contactWhatsApp &&
                    !owner.contactTelegram && (
                      <p className="mt-1 text-xs text-gray-500">
                        Владелец пока не оставил контакты.
                      </p>
                    )}
                </div>
              )}
            </section>
          )}

          {/* Описание */}
          {item.description && (
            <section className="p-3 bg-white border border-gray-200 rounded-lg">
              <h2 className="mb-1 text-sm font-semibold text-gray-800">
                Описание
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {item.description}
              </p>
            </section>
          )}

          {/* Характеристики */}
          <section className="p-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg space-y-1">
            <h2 className="mb-1 text-sm font-semibold text-gray-800">
              Характеристики
            </h2>
            <p>
              <span className="text-gray-500">Категория:</span>{' '}
              {item.category || '—'}
            </p>
            <p>
              <span className="text-gray-500">Бренд / модель:</span>{' '}
              {[item.brand, item.modelName].filter(Boolean).join(' ') || '—'}
            </p>
            <p>
              <span className="text-gray-500">Состояние:</span>{' '}
              {item.condition || '—'}
            </p>
          </section>
        </div>
      </div>

      {/* ======== Похожие товары ======== */}
      <section className="pt-4 border-t border-slate-100">
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-800">
          Похожие товары
        </h2>

        {similarLoading && (
          <p className="text-xs text-gray-500">Загрузка рекомендаций…</p>
        )}

        {!similarLoading && similarItems.length === 0 && (
          <p className="text-xs text-gray-500">
            Похожие предложения появятся позже.
          </p>
        )}

        {!similarLoading && similarItems.length > 0 && (
          <div className="grid gap-4 mt-2 sm:grid-cols-2 lg:grid-cols-3">
            {similarItems.map((r) => {
              const similarLocation = [r.location, r.district]
                .filter(Boolean)
                .join(', ');

              let similarPrice = 'Цена по запросу';
              if (r.rentPerDayKzt != null) {
                similarPrice = `${r.rentPerDayKzt.toLocaleString(
                  'ru-RU',
                )} ₸ / день`;
              } else if (r.rentPerWeekKzt != null) {
                similarPrice = `${r.rentPerWeekKzt.toLocaleString(
                  'ru-RU',
                )} ₸ / неделя`;
              } else if (r.rentPerMonthKzt != null) {
                similarPrice = `${r.rentPerMonthKzt.toLocaleString(
                  'ru-RU',
                )} ₸ / месяц`;
              }

              return (
                <Link
                  key={r.id}
                  href={`/ru/rentals/${r.id}`}
                  className="block"
                >
                  <article className="flex flex-col overflow-hidden bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div className="h-28 bg-gradient-to-br from-slate-200 via-sky-200 to-indigo-300">
                      {r.coverUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.coverUrl}
                          alt={r.title}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-3">
                      <h3 className="mb-1 text-sm font-semibold text-slate-900 line-clamp-2">
                        {r.title || 'Без названия'}
                      </h3>
                      <p className="mb-1 text-xs text-slate-600 line-clamp-1">
                        {[r.brand, r.modelName, r.category]
                          .filter(Boolean)
                          .join(' • ') || 'Электроника'}
                      </p>
                      {similarLocation && (
                        <p className="text-xs text-slate-500">
                          {similarLocation}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-semibold text-blue-700">
                          {similarPrice}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

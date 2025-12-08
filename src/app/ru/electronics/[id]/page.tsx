// src/app/ru/electronics/[id]/page.tsx
import React from 'react';
import Link from 'next/link';

type ApiResponse = {
  ok: boolean;
  item?: any;
  error?: string;
};

/**
 * 映射 biz -> 返回文本（俄语）
 * 如果你使用 i18n，请替换为翻译函数。
 */
const BACK_LABEL_BY_BIZ_RU: Record<string, string> = {
  art: 'Назад к произведениям',
  electronic: 'Назад к электронике',
};

function getBackInfo(item: any, locale = 'ru') {
  // 更鲁棒地读取 biz（小写 + 去首尾空格）
  const rawBiz = (item?.biz ?? 'art') as string;
  const bizKey = (String(rawBiz).toLowerCase().trim() || 'art') as string;
  const label = BACK_LABEL_BY_BIZ_RU[bizKey] ?? BACK_LABEL_BY_BIZ_RU['art'];

  const prefix = locale ? `/${locale}` : '';
  const href = bizKey === 'electronic' ? `${prefix}/electronics` : `${prefix}/artworks`;

  return { href, label };
}

/**
 * Server Component for /ru/electronics/[id]
 * - Fetches backend API: /api/electronics/:id
 * - Renders basic details and a back-link mapped by item.biz
 *
 * 注意：fetch 使用相对或基于 NEXT_PUBLIC_BASE_PATH 的 URL；在 dev 环境 fetch('/api/...') 通常工作正常（Server Component context）。
 */
export default async function ElectronicsDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

  // 先尝试 /api/electronics/:id
  let res: Response | null = null;
  try {
    res = await fetch(`${base}/api/electronics/${id}`, { cache: 'no-store' });
  } catch (e) {
    res = null;
  }

  let json: ApiResponse | null = null;
  if (res && res.ok) {
    try {
      json = (await res.json()) as ApiResponse;
    } catch {
      json = null;
    }
  }

  // 只有在没有成功从 /api/electronics 拿到数据时，才退回到 /api/artworks/:id （兼容旧数据）
  if ((!json || !json.ok) && (!res || !res.ok)) {
    try {
      const fallback = await fetch(`${base}/api/artworks/${id}`, { cache: 'no-store' });
      if (fallback && fallback.ok) {
        try {
          json = (await fallback.json()) as ApiResponse;
        } catch {
          // keep json as null
        }
      }
    } catch {
      // ignore fallback errors
    }
  }

  const item = json?.item ?? null;

  // 404 / not found
  if (!item) {
    return (
      <div className="p-6">
        <p className="text-lg font-semibold">Объект не найден</p>
        <p className="mt-3 text-sm text-muted-foreground">Невозможно найти электронный товар с данным ID.</p>
        <div className="mt-4">
          <Link href="/ru/electronics" className="text-blue-600 underline">
            Перейти к электронике
          </Link>
        </div>
      </div>
    );
  }

  // 生成返回链接（按照 biz）
  const { href: backHref, label: backLabel } = getBackInfo(item, 'ru');

  // 展示最基本的字段（你可以按项目样式扩展）
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <Link href={backHref} className="text-sm text-gray-600 hover:underline">
          {backLabel}
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-2">{item.title}</h1>

      <div className="flex gap-6 mb-6">
        {/* cover */}
        <div style={{ minWidth: 220 }}>
          {item.coverUrl ? (
            <img
              src={item.coverUrl}
              alt={item.title}
              style={{ width: 220, height: 'auto', objectFit: 'cover', borderRadius: 8 }}
            />
          ) : (
            <div style={{ width: 220, height: 160, borderRadius: 8, background: '#f0f0f0' }} />
          )}
        </div>

        {/* summary */}
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Цена:</strong>{' '}
            {typeof item.price === 'number' ? `${item.price}` : item.price ?? '—'}
          </p>

          <p className="text-sm text-gray-600 mb-2">
            <strong>Категория:</strong> {item.category ?? '—'}
          </p>

          <p className="text-sm text-gray-600 mb-2">
            <strong>Состояние:</strong> {item.condition ?? '—'}
          </p>

          <p className="text-sm text-gray-600 mb-2">
            <strong>Местоположение:</strong> {item.location_city ?? item.location ?? '—'}
          </p>

          <div className="mt-4">
            <strong>Описание</strong>
            <p className="mt-2 text-gray-700">{item.description ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* specs / pricing / acquisition (JSON) */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Характеристики</h2>
        <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
          {JSON.stringify(item.specs ?? {}, null, 2)}
        </pre>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Ценообразование</h2>
        <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
          {JSON.stringify(item.pricing ?? {}, null, 2)}
        </pre>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Способы получения</h2>
        <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
          {JSON.stringify(item.acquisition ?? {}, null, 2)}
        </pre>
      </section>

      {/* media */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Медиа</h2>
        <div className="flex gap-3 flex-wrap">
          {(Array.isArray(item.media) ? item.media : []).map((m: any) => (
            <div key={m.id ?? m.url} className="w-28 h-28 rounded overflow-hidden bg-gray-100">
              <img src={m.url} alt={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </section>

      {/* owner */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Продавец</h2>
        <div>
          <p>
            <strong>{item.owner?.username ?? '—'}</strong>
          </p>
          <p className="text-sm text-gray-600">{item.owner?.contactNote ?? ''}</p>
        </div>
      </section>
    </main>
  );
}

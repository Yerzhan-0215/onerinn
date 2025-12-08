// /src/app/ru/dashboard/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

type BizLine = 'art' | 'electronic';
type Mode = 'rental' | 'sale';

export default function DashboardPage() {
  const [biz, setBiz] = useState<BizLine>('art');
  const [mode, setMode] = useState<Mode>('rental');

  // TODO: 将静态数据替换为你的接口统计
  const kpis = [
    { label: 'Активные объявления', value: 12 },
    { label: 'Заказы в работе', value: 3 },
    { label: 'Сейчас в аренде', value: 2 },
    { label: 'Непрочитанные', value: 5 },
    { label: 'Мои доходы за месяц', value: '₸ 420 000' },
  ];

  return (
    <div className="pb-8">
      {/* 顶部提示与业务/模式切换（整洁对称） */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-gray-600">
          Управляйте объявлениями, заказами и арендами в одном месте.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {/* 业务线：艺术 / 电子 */}
          <div className="inline-flex rounded-full border border-gray-300 bg-white p-1">
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-sm ${biz === 'art' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`}
              onClick={() => setBiz('art')}
            >
              Искусство
            </button>
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-sm ${biz === 'electronic' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`}
              onClick={() => setBiz('electronic')}
            >
              Электроника
            </button>
          </div>

          {/* 模式：租赁 / 销售 */}
          <div className="inline-flex rounded-full border border-gray-300 bg-white p-1">
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-sm ${mode === 'rental' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`}
              onClick={() => setMode('rental')}
            >
              Аренда
            </button>
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-sm ${mode === 'sale' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`}
              onClick={() => setMode('sale')}
            >
              Продажа
            </button>
          </div>
        </div>
      </div>

      {/* KPI 卡片（统一风格，留白对称） */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="text-xs text-gray-600">{k.label}</div>
            <div className="mt-1 text-xl font-semibold">{k.value}</div>
          </div>
        ))}
      </div>

      {/* ✅ Быстрые действия：每个按钮占 1/4 宽度，窄屏自动换行，gap-2 控距 */}
      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm font-medium">Быстрые действия</div>

        {/* grid 实现等宽与响应式换行 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <Link
            href="/ru/dashboard/listings/new?type=art"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-center hover:bg-gray-50"
          >
            Опубликовать произведение
          </Link>

          <Link
            href="/ru/dashboard/listings/new?type=electronic"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-center hover:bg-gray-50"
          >
            Опубликовать электронику
          </Link>

          {mode === 'rental' ? (
            <Link
              href="/ru/dashboard/rentals/new"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-center hover:bg-gray-50"
            >
              Создать аренду
            </Link>
          ) : (
            <Link
              href="/ru/dashboard/orders/new"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-center hover:bg-gray-50"
            >
              Создать заказ
            </Link>
          )}

          <Link
            href="/ru/dashboard/listings/import"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-center hover:bg-gray-50"
          >
            Импорт (CSV)
          </Link>
        </div>
      </div>

      {/* ========= 主体区域：对称布局 ========= */}
      <div className="space-y-5">
        {/* 第一行：三个等宽等高卡片（同一水平线） */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Последние аренды / заказы */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm h-full flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium">
                {mode === 'rental' ? 'Последние аренды' : 'Последние заказы'}
              </div>
              <Link
                href={mode === 'rental' ? '/ru/dashboard/rentals' : '/ru/dashboard/orders'}
                className="text-xs text-blue-600 hover:underline"
              >
                Все
              </Link>
            </div>
            <ul className="space-y-2 text-sm flex-1">
              <li className="rounded-lg border border-gray-200 p-3 flex items-center justify-center text-gray-600">
                Нет записей
              </li>
            </ul>
          </div>

          {/* Календарь недели（中间位置） */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm h-full flex flex-col">
            <div className="mb-2 text-sm font-medium">Календарь недели</div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600 flex-1 flex items-center justify-center">
              Нет событий
            </div>
          </div>

          {/* Мои выплаты（右侧） */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm h-full flex flex-col">
            <div className="mb-2 text-sm font-medium">Мои выплаты</div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm flex-1">
              <div>Баланс: ₸ 0</div>
              <div className="mt-1">Следующая выплата: —</div>
            </div>
          </div>
        </div>

        {/* 第二行：两列对称（Требуют внимания | Последние сообщения） */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Требуют внимания */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm h-full flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium">Требуют внимания</div>
              <Link href="/ru/dashboard/orders" className="text-xs text-blue-600 hover:underline">
                Все
              </Link>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 flex-1 flex items-center justify-center">
              Отлично! Срочных задач нет.
            </div>
          </div>

          {/* Последние сообщения */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm h-full flex flex-col">
            <div className="mb-2 text-sm font-medium">Последние сообщения</div>
            <ul className="space-y-2 text-sm flex-1">
              <li className="rounded-lg border border-gray-200 p-3 flex items-center justify-center text-gray-600">
                Непрочитанных нет
              </li>
            </ul>
          </div>
        </div>
      </div>
      {/* ========= /主体区域 ========= */}
    </div>
  );
}

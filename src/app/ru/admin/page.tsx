// src/app/ru/admin/page.tsx
'use client';

import Link from 'next/link';

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      {/* 顶部欢迎标题 */}
      <section className="rounded-2xl bg-white px-6 py-7 shadow-sm border border-slate-100">
        <h1 className="mb-2 text-center text-2xl font-semibold text-slate-900">
          Добро пожаловать в Onerinn Admin
        </h1>
        <p className="mx-auto max-w-2xl text-center text-sm text-slate-500">
          Здесь вы можете управлять пользователями, произведениями, объявлениями,
          выплатами и другими аспектами платформы Onerinn.
        </p>
      </section>

      {/* 三个功能卡片：做成可点击 */}
      <section className="grid gap-4 md:grid-cols-3">
        {/* Пользователи */}
        <Link
          href="/ru/admin/users"
          className="
            group rounded-2xl border border-slate-200 bg-white px-5 py-4
            shadow-sm transition
            hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5
          "
        >
          <h2 className="mb-1 text-base font-semibold text-slate-900">
            Пользователи
          </h2>
          <p className="text-sm text-slate-500">
            Список зарегистрированных аккаунтов, роли и статусы.
          </p>
        </Link>

        {/* Произведения */}
        <Link
          href="/ru/admin/artworks"
          className="
            group rounded-2xl border border-slate-200 bg-white px-5 py-4
            shadow-sm transition
            hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5
          "
        >
          <h2 className="mb-1 text-base font-semibold text-slate-900">
            Произведения
          </h2>
          <p className="text-sm text-slate-500">
            Проверка и модерация контента, управление объявлениями.
          </p>
        </Link>

        {/* Сброс пароля */}
        <Link
          href="/ru/admin/tools/reset-link"
          className="
            group rounded-2xl border border-slate-200 bg-white px-5 py-4
            shadow-sm transition
            hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5
          "
        >
          <h2 className="mb-1 text-base font-semibold text-slate-900">
            Сброс пароля
          </h2>
          <p className="text-sm text-slate-500">
            Отправить пользователю ссылку на сброс пароля.
          </p>
        </Link>
      </section>
    </div>
  );
}

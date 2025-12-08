// /src/app/ru/dashboard/verification/start/page.tsx
'use client';

import Link from 'next/link';

export default function VerificationStartPage() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h1 className="text-lg md:text-xl font-semibold">Начало верификации</h1>
        <p className="mt-1 text-sm text-gray-600">
          Заполните данные, загрузите документы и привяжите банковский счёт. Вы можете вернуться к шагам позже — прогресс сохранится.
        </p>
      </div>

      {/* 卖家信息 */}
      <section id="seller" className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm font-medium">Данные продавца</div>
        <p className="text-sm text-gray-600">
          Укажите ИИН/БИН, юридический/фактический адрес, контактные данные.
        </p>
        <div className="mt-3">
          <Link
            href="#"
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center rounded-lg border border-gray-900 bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
            aria-disabled
          >
            Открыть форму (в разработке)
          </Link>
        </div>
      </section>

      {/* 证件上传 */}
      <section id="documents" className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm font-medium">Документы</div>
        <p className="text-sm text-gray-600">
          Загрузите сканы паспорта или свидетельства о регистрации (JPEG/PNG/PDF).
        </p>
        <div className="mt-3">
          <Link
            href="#"
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center rounded-lg border border-gray-900 bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
            aria-disabled
          >
            Загрузить (в разработке)
          </Link>
        </div>
      </section>

      {/* 绑定银行账户 */}
      <section id="bank" className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm font-medium">Банковский счёт</div>
        <p className="text-sm text-gray-600">
          Укажите реквизиты (БИК/IBAN) или подключите Kaspi/Halyk 结算账户（按你的接入方案实现）。
        </p>
        <div className="mt-3">
          <Link
            href="#"
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center rounded-lg border border-gray-900 bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
            aria-disabled
          >
            Привязать (в разработке)
          </Link>
        </div>
      </section>

      <div className="flex gap-3">
        <Link
          href="/ru/dashboard/verification"
          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Назад
        </Link>
        <Link
          href="/ru/dashboard/payouts"
          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          К выплатам
        </Link>
      </div>
    </div>
  );
}

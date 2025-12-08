// src/app/ru/dashboard/artworks/new/page.tsx
'use client';

import SellerVerificationGuard from '@/components/SellerVerificationGuard';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type FormState = {
  title: string;
  artist: string;
  style: string;
  size: string;
  description: string;
  basePriceKzt: string;
  forSale: boolean;
  forRent: boolean;
  rentPerDayKzt: string;
  rentPerWeekKzt: string;
  rentPerMonthKzt: string;
};

export default function NewArtworkPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    title: '',
    artist: '',
    style: '',
    size: '',
    description: '',
    basePriceKzt: '',
    forSale: true,
    forRent: false,
    rentPerDayKzt: '',
    rentPerWeekKzt: '',
    rentPerMonthKzt: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleChange = (
    field: keyof FormState,
    value: string | boolean,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const title = form.title.trim();
    if (!title) {
      setErrorMsg('Пожалуйста, введите название произведения.');
      return;
    }

    if (!form.forSale && !form.forRent) {
      setErrorMsg('Отметьте хотя бы один вариант: продажа или аренда.');
      return;
    }

    const basePriceKzt = form.basePriceKzt
      ? Number(form.basePriceKzt)
      : 0;

    if (Number.isNaN(basePriceKzt) || basePriceKzt < 0) {
      setErrorMsg('Некорректная базовая цена.');
      return;
    }

    const payload = {
      title,
      artist: form.artist.trim() || undefined,
      style: form.style.trim() || undefined,
      size: form.size.trim() || undefined,
      description: form.description.trim() || undefined,
      basePriceKzt,
      forSale: form.forSale,
      forRent: form.forRent,
      rentPerDayKzt:
        form.forRent && form.rentPerDayKzt
          ? Number(form.rentPerDayKzt)
          : undefined,
      rentPerWeekKzt:
        form.forRent && form.rentPerWeekKzt
          ? Number(form.rentPerWeekKzt)
          : undefined,
      rentPerMonthKzt:
        form.forRent && form.rentPerMonthKzt
          ? Number(form.rentPerMonthKzt)
          : undefined,
    };

    setSubmitting(true);
    try {
      const res = await fetch('/api/artworks/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        console.error('Create artwork error:', data);
        setErrorMsg('Не удалось сохранить произведение. Попробуйте позже.');
        return;
      }

      setSuccessMsg('Произведение успешно добавлено!');
      // 简单一点：2 秒后跳转到 /ru/artworks
      setTimeout(() => {
        router.push('/ru/artworks');
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg('Произошла ошибка при отправке данных.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SellerVerificationGuard>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
          Добавить произведение искусства
        </h1>
        <p className="text-sm md:text-base text-slate-600 mb-6">
          Заполните информацию о картине. Вы можете указать цену продажи, а также
          условия аренды (например, стоимость за день или за месяц).
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-slate-200 bg-white/90 p-4 md:p-6 shadow-sm"
        >
          {/* Название */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Название произведения <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Например: Горный рассвет"
            />
          </div>

          {/* Автор / стиль / размер */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Автор
              </label>
              <input
                type="text"
                value={form.artist}
                onChange={(e) => handleChange('artist', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Имя художника"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Стиль
              </label>
              <input
                type="text"
                value={form.style}
                onChange={(e) => handleChange('style', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Например: живопись, абстракция..."
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Размер
              </label>
              <input
                type="text"
                value={form.size}
                onChange={(e) => handleChange('size', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Например: 60 × 80 см"
              />
            </div>
          </div>

          {/* Описание */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Краткое описание
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Расскажите немного о произведении, материале, вдохновении..."
            />
          </div>

          {/* Цена продажи / аренда */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Продажа */}
            <div className="space-y-2 rounded-lg border border-slate-200 p-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.forSale}
                  onChange={(e) => handleChange('forSale', e.target.checked)}
                  className="h-4 w-4"
                />
                <span>Продаётся</span>
              </label>
              <div className="space-y-1">
                <span className="block text-xs text-slate-500">
                  Базовая цена (KZT)
                </span>
                <input
                  type="number"
                  min={0}
                  value={form.basePriceKzt}
                  onChange={(e) =>
                    handleChange('basePriceKzt', e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Например: 120000"
                />
              </div>
            </div>

            {/* Аренда */}
            <div className="space-y-2 rounded-lg border border-slate-200 p-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.forRent}
                  onChange={(e) => handleChange('forRent', e.target.checked)}
                  className="h-4 w-4"
                />
                <span>Сдаётся в аренду</span>
              </label>

              <div className="grid gap-2 md:grid-cols-3">
                <div className="space-y-1">
                  <span className="block text-xs text-slate-500">
                    За день (KZT)
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={form.rentPerDayKzt}
                    onChange={(e) =>
                      handleChange('rentPerDayKzt', e.target.value)
                    }
                    disabled={!form.forRent}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
                    placeholder="5000"
                  />
                </div>
                <div className="space-y-1">
                  <span className="block text-xs text-slate-500">
                    За неделю (KZT)
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={form.rentPerWeekKzt}
                    onChange={(e) =>
                      handleChange('rentPerWeekKzt', e.target.value)
                    }
                    disabled={!form.forRent}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
                    placeholder="25000"
                  />
                </div>
                <div className="space-y-1">
                  <span className="block text-xs text-slate-500">
                    За месяц (KZT)
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={form.rentPerMonthKzt}
                    onChange={(e) =>
                      handleChange('rentPerMonthKzt', e.target.value)
                    }
                    disabled={!form.forRent}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
                    placeholder="70000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 错误 / 成功提示 */}
          {errorMsg && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {successMsg}
            </div>
          )}

          {/* 提交按钮 */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? 'Сохраняем...' : 'Сохранить произведение'}
            </button>
          </div>
        </form>
      </div>
    </SellerVerificationGuard>
  );
}

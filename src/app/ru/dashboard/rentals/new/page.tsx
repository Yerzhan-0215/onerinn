// /src/app/ru/dashboard/rentals/new/page.tsx
'use client';

// ✅ 新增：卖家验证拦截器（精准加法）
import SellerVerificationGuard from '@/components/SellerVerificationGuard';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type RentalUnit = 'day' | 'week' | 'month' | 'year';

type ListingOption = {
  id: string;
  title: string | null;
  biz?: 'art' | 'electronic';
  status?: string;
};

export default function NewRentalPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<ListingOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  // form
  const [listingId, setListingId] = useState('');
  const [unit, setUnit] = useState<RentalUnit>('day');
  const [amount, setAmount] = useState<number | ''>('');
  const [deposit, setDeposit] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let aborted = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // 取足够多的已存在 listing 供选择
        const r = await fetch('/api/dashboard/listings?mode=all&biz=all');
        const j = await r.json().catch(() => ({}));
        if (!aborted) {
          const list = Array.isArray(j.items) ? (j.items as ListingOption[]) : [];
          setOptions(list);
        }
      } catch (e: any) {
        if (!aborted) setError(String(e?.message || e));
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    load();
    return () => {
      aborted = true;
    };
  }, []);

  const listingLabel = useMemo(() => {
    const found = options.find((o) => o.id === listingId);
    if (!found) return '';
    const t = found.title || 'Без названия';
    const tag = found.biz === 'electronic' ? 'Электроника' : 'Искусство';
    return `${t} — ${tag}`;
  }, [listingId, options]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // 简单校验
    if (!listingId) {
      alert('Выберите объявление');
      return;
    }
    if (!startDate || !endDate) {
      alert('Укажите даты аренды');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      alert('Дата окончания не может быть раньше даты начала');
      return;
    }
    if (quantity <= 0) {
      alert('Количество должно быть больше 0');
      return;
    }
    if (amount !== '' && amount < 0) {
      alert('Цена не может быть отрицательной');
      return;
    }
    if (deposit !== '' && deposit < 0) {
      alert('Залог не может быть отрицательным');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        listingId,
        rental: {
          unit,
          amount: amount === '' ? null : Number(amount),
          deposit: deposit === '' ? null : Number(deposit),
          quantity,
          startDate,
          endDate,
        },
        customer: {
          name: customerName || null,
          phone: customerPhone || null,
          email: customerEmail || null,
        },
        notes: notes || null,
      };

      const res = await fetch('/api/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) throw new Error('UNAUTHORIZED');
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `SERVER_${res.status}`);
      }

      router.push('/ru/dashboard');
      router.refresh();
    } catch (err: any) {
      alert(err?.message || 'Ошибка сохранения');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    // ✅ 仅新增这一层保护（不改任何原内容）
    <SellerVerificationGuard>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Создать аренду</h1>
          <div className="ml-auto">
            <Link href="/ru/dashboard" className="text-sm text-blue-600 hover:underline">
              ← Назад
            </Link>
          </div>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <form onSubmit={onSubmit} className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
          <Section title="Объект аренды">
            <Field label="Объявление *">
              {loading ? (
                <div className="text-sm text-gray-500">Загрузка…</div>
              ) : (
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
                  value={listingId}
                  onChange={(e) => setListingId(e.target.value)}
                  required
                >
                  <option value="">— выберите —</option>
                  {options.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.title || 'Без названия'}{' '}
                      {o.biz ? (o.biz === 'electronic' ? '• Электроника' : '• Искусство') : ''}
                    </option>
                  ))}
                </select>
              )}
              {listingId && <p className="mt-1 text-xs text-gray-500">{listingLabel}</p>}
            </Field>
          </Section>

          <Section title="Параметры аренды">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Единица">
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as RentalUnit)}
                >
                  <option value="day">День</option>
                  <option value="week">Неделя</option>
                  <option value="month">Месяц</option>
                  <option value="year">Год</option>
                </select>
              </Field>

              <Field label="Цена за единицу (KZT)">
                <input
                  type="number"
                  min={0}
                  step={1}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={amount === '' ? '' : amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="напр., 5000"
                />
              </Field>

              <Field label="Залог (KZT)">
                <input
                  type="number"
                  min={0}
                  step={1}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={deposit === '' ? '' : deposit}
                  onChange={(e) => setDeposit(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="необязательно"
                />
              </Field>

              <Field label="Количество">
                <input
                  type="number"
                  min={1}
                  step={1}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value || 1)))}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
              <Field label="Дата начала *">
                <input
                  type="date"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </Field>

              <Field label="Дата окончания *">
                <input
                  type="date"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </Field>
            </div>
          </Section>

          <Section title="Клиент и примечания (необязательно)">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Имя">
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </Field>

              <Field label="Телефон">
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </Field>
            </div>

            <div className="mt-4">
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                rows={3}
                placeholder="Примечания к аренде, условия получения и т.п."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </Section>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Link href="/ru/dashboard" className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50">
              Отмена
            </Link>
            <button type="submit" disabled={submitting} className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-60">
              {submitting ? 'Сохраняем…' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </SellerVerificationGuard>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-lg border border-gray-200 p-4">
      <h2 className="mb-4 text-base font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium">{label}</div>
      {children}
    </label>
  );
}

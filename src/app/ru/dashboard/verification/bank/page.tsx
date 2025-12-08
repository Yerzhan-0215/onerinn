// /src/app/ru/dashboard/verification/bank/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type AccountType = 'IBAN' | 'CARD';

type BankForm = {
  accountType: AccountType;
  beneficiaryName: string;
  iban: string;
  cardNumber: string;
  bankName: string;
  bic: string;
};

type ApiData = {
  beneficiaryName: string | null;
  accountNumber: string | null;
  bankName: string | null;
  bic: string | null;
  accountType?: AccountType | null;
  iban?: string | null;
  cardNumber?: string | null;
};

export default function BankAccountPage() {
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState<BankForm>({
    accountType: 'IBAN',
    beneficiaryName: '',
    iban: '',
    cardNumber: '',
    bankName: '',
    bic: '',
  });

  const ibanRef = useRef<HTMLInputElement | null>(null);
  const cardRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setAuthError(false);
        const res = await fetch('/api/verification/bank', { method: 'GET' });
        if (res.status === 401) {
          setAuthError(true);
          setLoading(false);
          return;
        }
        const json = await res.json();
        const data: ApiData | null = json?.data ?? null;
        if (data) {
          const t: AccountType =
            data.accountType ?? (data.accountNumber && /^KZ/i.test(data.accountNumber) ? 'IBAN' : 'CARD');

          setForm({
            accountType: t,
            beneficiaryName: data.beneficiaryName ?? '',
            iban: t === 'IBAN' ? (data.iban ?? data.accountNumber ?? '') : '',
            cardNumber: t === 'CARD' ? formatCard((data.cardNumber ?? data.accountNumber ?? '')) : '',
            bankName: data.bankName ?? '',
            bic: data.bic ?? '',
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function onChange(patch: Partial<BankForm>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function onTypeChange(next: AccountType) {
    setMessage(null);
    if (next === 'IBAN') {
      // 切换到 IBAN：清理卡号字段，聚焦 IBAN
      setForm((p) => ({ ...p, accountType: 'IBAN', cardNumber: '' }));
      // 等 state 应用后再聚焦
      setTimeout(() => ibanRef.current?.focus(), 0);
    } else {
      // 切换到 卡号：清理 IBAN/银行/БИК，聚焦卡号
      setForm((p) => ({ ...p, accountType: 'CARD', iban: '', bankName: '', bic: '' }));
      setTimeout(() => cardRef.current?.focus(), 0);
    }
  }

  function formatCard(input: string) {
    return input.replace(/\D+/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }

  async function onSubmit() {
    setMessage(null);
    setSaving(true);
    try {
      if (!form.beneficiaryName.trim()) {
        setMessage('Пожалуйста, укажите имя получателя');
        setSaving(false);
        return;
      }

      const payload =
        form.accountType === 'IBAN'
          ? {
              accountType: 'IBAN' as const,
              beneficiaryName: form.beneficiaryName.trim(),
              iban: form.iban.trim(),
              bankName: form.bankName.trim() || null,
              bic: form.bic.trim() || null,
            }
          : {
              accountType: 'CARD' as const,
              beneficiaryName: form.beneficiaryName.trim(),
              cardNumber: form.cardNumber.replace(/\s+/g, ''),
            };

      const res = await fetch('/api/verification/bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        const firstErr =
          json?.details?.fieldErrors &&
          Object.values(json.details.fieldErrors).flat().find(Boolean);
        setMessage(firstErr || json?.error || 'Не удалось сохранить');
      } else {
        setMessage('Сохранено');
      }
    } catch (e) {
      console.error(e);
      setMessage('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        Загрузка...
      </div>
    );
  }

  if (authError) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-sm">Требуется вход в систему.</div>
        <Link href="/ru/login" className="text-sm text-blue-600 hover:underline">Войти →</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      {/* 标题 */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold">Банковский счёт для выплат</h1>
          <Link href="/ru/dashboard/payouts" className="text-sm text-blue-600 hover:underline">
            К выплатам →
          </Link>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          Укажите реквизиты для получения выплат. Вы можете выбрать IBAN или номер карты.
        </p>
      </div>

      {/* 选择类型 */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-medium">Тип счёта</div>
        <div className="flex gap-3">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="accountType"
              className="h-4 w-4"
              checked={form.accountType === 'IBAN'}
              onChange={() => onTypeChange('IBAN')}
            />
            <span className="text-sm">IBAN (международный формат)</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="accountType"
              className="h-4 w-4"
              checked={form.accountType === 'CARD'}
              onChange={() => onTypeChange('CARD')}
            />
            <span className="text-sm">Номер карты</span>
          </label>
        </div>
      </div>

      {/* 表单 */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Получатель */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">
              Получатель <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Введите имя получателя"
              value={form.beneficiaryName}
              onChange={(e) => onChange({ beneficiaryName: e.target.value })}
            />
          </div>

          {/* IBAN 或 卡号 */}
          {form.accountType === 'IBAN' ? (
            <>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">IBAN</label>
                <input
                  ref={ibanRef}
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="KZ12 3456 7890 1234 5678"
                  value={form.iban}
                  onChange={(e) => onChange({ iban: e.target.value })}
                />
                <p className="mt-1 text-xs text-gray-500">Пример: KZxx xxxx xxxx xxxx xxxx</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Банк (необязательно)</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={form.bankName}
                  onChange={(e) => onChange({ bankName: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">БИК (необязательно)</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={form.bic}
                  onChange={(e) => onChange({ bic: e.target.value })}
                />
              </div>
            </>
          ) : (
            <>
              <div className="md:col-span-2">
                <label className="mb-1 block text.sm font-medium">Номер карты</label>
                <input
                  ref={cardRef}
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="1234 5678 9012 3456"
                  value={form.cardNumber}
                  onChange={(e) => onChange({ cardNumber: formatCard(e.target.value) })}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Введите 16-значный номер карты. Банк и БИК указывать не нужно.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 操作区 */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={onSubmit}
          className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
        >
          {saving ? 'Сохранение…' : 'Сохранить'}
        </button>
        <Link
          href="/ru/dashboard/payouts"
          className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm hover:bg-gray-50"
        >
          К выплатам
        </Link>
      </div>

      {message && <div className="text-center text-sm text-gray-700">{message}</div>}
    </div>
  );
}

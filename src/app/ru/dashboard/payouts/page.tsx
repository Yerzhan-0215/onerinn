'use client';

import { useEffect, useRef, useState } from 'react';

type AccountType = 'IBAN' | 'CARD';

type PayoutAccountData = {
  beneficiaryName: string | null;
  accountNumber: string | null;
  bankName: string | null;
  bic: string | null;
};

type HistoryItem = {
  id: string;
  amount: string; // Decimal -> string
  status: string;
  createdAt: string;
};

export default function PayoutsPage() {
  // главный стейт
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  const [balance, setBalance] = useState<string>('0');
  const [account, setAccount] = useState<PayoutAccountData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // modal: способ вывода
  const [showAccountModal, setShowAccountModal] = useState(false);

  // modal: запросить выплату
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // ---------------------------
  // 1) форма редактирования payoutAccount (同一逻辑: IBAN / CARD)
  // ---------------------------

  const [accSaving, setAccSaving] = useState(false);
  const [accMsg, setAccMsg] = useState<string | null>(null);

  // 这些是可编辑表单字段
  const [accType, setAccType] = useState<AccountType>('IBAN');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [iban, setIban] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [bic, setBic] = useState('');

  const ibanRef = useRef<HTMLInputElement | null>(null);
  const cardRef = useRef<HTMLInputElement | null>(null);

  function formatCard(input: string) {
    return input
      .replace(/\D+/g, '')
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, '$1 ')
      .trim();
  }

  function switchAccountType(next: AccountType) {
    setAccMsg(null);
    setAccType(next);
    if (next === 'IBAN') {
      // очищаем карту
      setCardNumber('');
      setTimeout(() => ibanRef.current?.focus(), 0);
    } else {
      // очищаем iban/bank/bic
      setIban('');
      setBankName('');
      setBic('');
      setTimeout(() => cardRef.current?.focus(), 0);
    }
  }

  async function saveAccount() {
    setAccMsg(null);
    setAccSaving(true);
    try {
      if (!beneficiaryName.trim()) {
        setAccMsg('Пожалуйста, укажите имя получателя');
        setAccSaving(false);
        return;
      }

      const payload =
        accType === 'IBAN'
          ? {
              accountType: 'IBAN' as const,
              beneficiaryName: beneficiaryName.trim(),
              iban: iban.trim(),
              bankName: bankName.trim() || null,
              bic: bic.trim() || null,
            }
          : {
              accountType: 'CARD' as const,
              beneficiaryName: beneficiaryName.trim(),
              cardNumber: cardNumber.replace(/\s+/g, ''),
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
          Object.values(json.details.fieldErrors)
            .flat()
            .find(Boolean);
        setAccMsg(firstErr || json?.error || 'Не удалось сохранить');
      } else {
        setAccMsg('Сохранено');
        // 刷新主信息 (balance/account/history)
        await loadAll();
        setShowAccountModal(false);
      }
    } catch (err) {
      console.error(err);
      setAccMsg('Ошибка сохранения');
    } finally {
      setAccSaving(false);
    }
  }

  // ---------------------------
  // 2) форма "Запросить выплату"
  // ---------------------------

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSaving, setWithdrawSaving] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<string | null>(null);

  async function submitWithdraw() {
    setWithdrawMsg(null);
    setWithdrawSaving(true);
    try {
      if (!withdrawAmount.trim()) {
        setWithdrawMsg('Укажите сумму');
        setWithdrawSaving(false);
        return;
      }

      // POST /api/payouts
      const res = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: withdrawAmount }),
      });
      const json = await res.json();

      if (!res.ok) {
        const firstErr =
          json?.details?.fieldErrors &&
          Object.values(json.details.fieldErrors)
            .flat()
            .find(Boolean);
        setWithdrawMsg(
          firstErr || json?.error || 'Не удалось отправить запрос'
        );
      } else {
        setWithdrawMsg('Запрос отправлен. Статус: PENDING');
        // 刷新主数据
        await loadAll();
        setShowWithdrawModal(false);
      }
    } catch (err) {
      console.error(err);
      setWithdrawMsg('Ошибка при запросе выплаты');
    } finally {
      setWithdrawSaving(false);
    }
  }

  // ---------------------------
  // 3) 载入主数据
  // ---------------------------

  async function loadAll() {
    try {
      setLoading(true);
      setAuthError(false);

      const res = await fetch('/api/payouts', { method: 'GET' });
      if (res.status === 401) {
        setAuthError(true);
        setLoading(false);
        return;
      }

      const json = await res.json();
      setBalance(json.balance ?? '0');
      setAccount(json.account ?? null);
      setHistory(json.history ?? []);

      // 同步 account -> form (方便用户点"Добавить способ вывода"时已经有旧值)
      if (json.account) {
        const rawNum = json.account.accountNumber || '';
        const guessType: AccountType = /^KZ/i.test(rawNum) ? 'IBAN' : 'CARD';

        setAccType(guessType);
        setBeneficiaryName(json.account.beneficiaryName ?? '');
        setIban(guessType === 'IBAN' ? rawNum : '');
        setCardNumber(
          guessType === 'CARD' ? formatCard(rawNum) : ''
        );
        setBankName(json.account.bankName ?? '');
        setBic(json.account.bic ?? '');
      } else {
        // 没有账户，初始化成 IBAN 空表单
        setAccType('IBAN');
        setBeneficiaryName('');
        setIban('');
        setCardNumber('');
        setBankName('');
        setBic('');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  // ---------------------------
  // 4) UI
  // ---------------------------

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        Загрузка...
      </div>
    );
  }

  if (authError) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-sm mb-2">Требуется вход в систему.</div>
        <a
          href="/ru/login"
          className="text-sm text-blue-600 hover:underline"
        >
          Войти →
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-4xl space-y-5">
        {/* Карточка баланса и кнопок */}
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-lg font-semibold mb-2">Выплаты</div>

          <div className="text-sm">
            Баланс:{' '}
            <span className="font-semibold">
              ₸ {balance ?? '0'}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowAccountModal(true)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
            >
              Добавить способ вывода
            </button>

            <button
              type="button"
              onClick={() => setShowWithdrawModal(true)}
              className="rounded-lg border border-gray-900 bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
            >
              Запросить выплату
            </button>
          </div>

          {/* 简要当前 реквизиты */}
          <div className="mt-4 text-xs text-gray-600">
            {account ? (
              <>
                <div>
                  Текущий способ вывода:{' '}
                  <span className="font-medium text-gray-900">
                    {account.beneficiaryName || '—'}
                  </span>
                </div>
                <div className="break-all">
                  {account.accountNumber || '—'}
                </div>
                {account.bankName && (
                  <div>Банк: {account.bankName}</div>
                )}
              </>
            ) : (
              <div>Способ вывода не настроен.</div>
            )}
          </div>
        </section>

        {/* История выплат */}
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-medium mb-2">
            История выплат
          </div>

          {history.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-600">
              Пока пусто.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white text-sm">
              {history.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      ₸ {item.amount}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(item.createdAt).toLocaleString('ru-RU')}
                    </span>
                  </div>
                  <div className="text-xs uppercase tracking-wide">
                    {item.status === 'PENDING' && (
                      <span className="text-yellow-600">
                        Ожидает
                      </span>
                    )}
                    {item.status === 'APPROVED' && (
                      <span className="text-blue-600">
                        Подтверждено
                      </span>
                    )}
                    {item.status === 'PAID' && (
                      <span className="text-green-600">
                        Выплачено
                      </span>
                    )}
                    {item.status === 'REJECTED' && (
                      <span className="text-red-600">
                        Отклонено
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 text-xs text-gray-500">
            Нужна помощь?{' '}
            <a
              href="#"
              className="text-blue-600 hover:underline"
            >
              Смотрите FAQ
            </a>
          </div>
        </section>
      </div>

      {/* ---------------- Modal: способ вывода ---------------- */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium">
                  Способ вывода
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  Укажите IBAN или номер карты. Эти данные используются для переводов в вашу пользу.
                </p>
              </div>
              <button
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => setShowAccountModal(false)}
              >
                ✕
              </button>
            </div>

            {/* Тип счёта */}
            <div className="mt-4 text-xs font-medium text-gray-700">
              Тип счёта
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="accType"
                  className="h-4 w-4"
                  checked={accType === 'IBAN'}
                  onChange={() => switchAccountType('IBAN')}
                />
                <span>IBAN</span>
              </label>

              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="accType"
                  className="h-4 w-4"
                  checked={accType === 'CARD'}
                  onChange={() => switchAccountType('CARD')}
                />
                <span>Номер карты</span>
              </label>
            </div>

            {/* Форма реквизитов */}
            <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              {/* Получатель */}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  Получатель <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Введите имя получателя"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                />
              </div>

              {accType === 'IBAN' ? (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Банк (необязательно)
                    </label>
                    <input
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Halyk / Kaspi …"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      IBAN
                    </label>
                    <input
                      ref={ibanRef}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      placeholder="KZxx xxxx xxxx xxxx xxxx"
                      value={iban}
                      onChange={(e) => setIban(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Пример: KZ12 3456 7890 1234 5678
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      БИК (необязательно)
                    </label>
                    <input
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      placeholder="HLALKZKZ"
                      value={bic}
                      onChange={(e) => setBic(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium">
                      Номер карты
                    </label>
                    <input
                      ref={cardRef}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(formatCard(e.target.value))
                      }
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Введите 16-значный номер карты. Банк и БИК не нужны.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* footer */}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 text-sm">
              {accMsg && (
                <div className="text-gray-700">{accMsg}</div>
              )}

              <button
                onClick={() => setShowAccountModal(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50"
                type="button"
              >
                Отмена
              </button>

              <button
                onClick={saveAccount}
                disabled={accSaving}
                className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white hover:bg-black disabled:opacity-50"
                type="button"
              >
                {accSaving ? 'Сохранение…' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Modal: запросить выплату ---------------- */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 shadow-xl text-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">Запросить выплату</div>
                <p className="mt-1 text-xs text-gray-600">
                  Мы отправим запрос на перевод средств на ваш указанный способ вывода.
                </p>
              </div>
              <button
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => setShowWithdrawModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium">
                Сумма на вывод (₸)
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="Например: 10000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Доступный баланс сейчас: ₸ {balance ?? '0'}
              </p>
            </div>

            {withdrawMsg && (
              <div className="mt-3 text-xs text-gray-700">
                {withdrawMsg}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50"
                type="button"
              >
                Отмена
              </button>

              <button
                onClick={submitWithdraw}
                disabled={withdrawSaving}
                className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white hover:bg-black disabled:opacity-50"
                type="button"
              >
                {withdrawSaving ? 'Отправка…' : 'Отправить запрос'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

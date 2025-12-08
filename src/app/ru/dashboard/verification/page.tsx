// src/app/ru/dashboard/verification/page.tsx
'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';

// ---------------------------
// Types
// ---------------------------

type SellerType = 'INDIVIDUAL' | 'COMPANY';

type SellerForm = {
  sellerType: SellerType;
  iinBin: string;
  // INDIVIDUAL
  fullName?: string | null;
  // COMPANY
  companyName?: string | null;
  legalAddress?: string | null;
  actualAddress?: string | null;

  country?: string | null;
  region?: string | null;
  city?: string | null;
  district?: string | null;

  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
};

type Doc = {
  id: string;
  type: string;
  url: string;
  filename?: string | null;
  uploadedAt?: string;
};

type AccountType = 'IBAN' | 'CARD';

type BankForm = {
  accountType: AccountType;
  beneficiaryName: string;
  iban: string;
  cardNumber: string;
  bankName: string;
  bic: string;
};

type BankApiData = {
  beneficiaryName: string | null;
  accountNumber: string | null;
  bankName: string | null;
  bic: string | null;
  accountType?: AccountType | null;
  iban?: string | null;
  cardNumber?: string | null;
};

// ---------------------------
// Component
// ---------------------------

export default function VerificationPage() {
  // ---------------------------
  // 1. Общий state
  // ---------------------------

  const [loading, setLoading] = useState(true);

  // 卖家数据块
  const [seller, setSeller] = useState<SellerForm>({
    sellerType: 'INDIVIDUAL',
    iinBin: '',
    fullName: '',
    companyName: '',
    legalAddress: '',
    actualAddress: '',
    country: '',
    region: '',
    city: '',
    district: '',
    contactName: '',
    phone: '',
    email: '',
  });
  const [sellerReadonly, setSellerReadonly] = useState(false);
  const [sellerMsg, setSellerMsg] = useState<string | null>(null);
  const [sellerSaving, setSellerSaving] = useState(false);

  // 文档块
  const [docs, setDocs] = useState<Doc[]>([]);
  const [docsReadonly, setDocsReadonly] = useState(false);
  const [docType, setDocType] = useState<string>('passport');
  const [uploading, setUploading] = useState(false);

  // 银行块
  const [bankForm, setBankForm] = useState<BankForm>({
    accountType: 'IBAN',
    beneficiaryName: '',
    iban: '',
    cardNumber: '',
    bankName: '',
    bic: '',
  });
  const [bankMsg, setBankMsg] = useState<string | null>(null);
  const [bankSaving, setBankSaving] = useState(false);

  // 底部“完成”提示
  const [finishMsg, setFinishMsg] = useState<string | null>(null);

  // Refs for focusing when switching IBAN/CARD
  const ibanRef = useRef<HTMLInputElement | null>(null);
  const cardRef = useRef<HTMLInputElement | null>(null);

  const isCompany = seller.sellerType === 'COMPANY';

  // ---------------------------
  // 2. Helpers
  // ---------------------------

  // 切换卖家类型（顶部两个 pill 按钮）
  const pickType = (t: SellerType) => {
    setSeller((p) => ({
      ...p,
      sellerType: t,
    }));
  };

  // 卖家输入
  const onChangeSeller =
    (k: keyof SellerForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSeller((prev) => ({ ...prev, [k]: value }));
    };

  // IBAN/CARD 单选切换
  function onBankTypeChange(next: AccountType) {
    setBankMsg(null);
    if (next === 'IBAN') {
      // 切到 IBAN：清空卡号
      setBankForm((p) => ({
        ...p,
        accountType: 'IBAN',
        cardNumber: '',
      }));
      setTimeout(() => ibanRef.current?.focus(), 0);
    } else {
      // 切到 卡号：清空 IBAN/银行/BIC
      setBankForm((p) => ({
        ...p,
        accountType: 'CARD',
        iban: '',
        bankName: '',
        bic: '',
      }));
      setTimeout(() => cardRef.current?.focus(), 0);
    }
  }

  // 银行字段输入
  function onChangeBank(patch: Partial<BankForm>) {
    setBankForm((prev) => ({ ...prev, ...patch }));
  }

  // 格式化卡号 1234 5678 ...
  function formatCard(input: string) {
    return input
      .replace(/\D+/g, '')
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, '$1 ')
      .trim();
  }

  // 文档刷新
  const refreshDocs = async () => {
    const r = await fetch('/api/verification/documents', { cache: 'no-store' });
    const j = await r.json().catch(() => null);
    setDocs(j?.data ?? []);
  };

  // ---------------------------
  // 3. Load all on mount
  // ---------------------------
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // 拉 1) 卖家信息 2) 银行信息 3) 文档列表
        const [resSeller, resBank] = await Promise.all([
          fetch('/api/verification/seller', { cache: 'no-store' }),
          fetch('/api/verification/bank', { cache: 'no-store' }),
        ]);

        // 卖家
        if (resSeller.ok) {
          const js = await resSeller.json().catch(() => null);
          if (js?.data) {
            setSeller((p) => ({
              ...p,
              ...js.data,
            }));
          }
        }

        // 银行
        if (resBank.ok) {
          const jb = await resBank.json().catch(() => null);
          const data: BankApiData | null = jb?.data ?? null;
          if (data) {
            // 推断类型
            const t: AccountType =
              data.accountType ??
              (data.accountNumber && /^KZ/i.test(data.accountNumber)
                ? 'IBAN'
                : 'CARD');

            setBankForm({
              accountType: t,
              beneficiaryName: data.beneficiaryName ?? '',
              iban: t === 'IBAN' ? (data.iban ?? data.accountNumber ?? '') : '',
              cardNumber:
                t === 'CARD'
                  ? formatCard(data.cardNumber ?? data.accountNumber ?? '')
                  : '',
              bankName: data.bankName ?? '',
              bic: data.bic ?? '',
            });
          }
        }

        // 文档
        await refreshDocs();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 根据当前主体（公司/个体）自动设置默认 docType
  useEffect(() => {
    setDocType(isCompany ? 'registration' : 'passport');
  }, [isCompany]);

  // ---------------------------
  // 4. Save handlers
  // ---------------------------

  // 保存卖家信息
  async function saveSeller() {
    setSellerMsg(null);
    setSellerSaving(true);
    try {
      // 准备 payload
      const payload: SellerForm = { ...seller };

      if (payload.sellerType === 'INDIVIDUAL') {
        // 个体：不传公司专属字段
        delete (payload as any).companyName;
        delete (payload as any).legalAddress;
        delete (payload as any).actualAddress;
      } else {
        // 公司：不传 fullName
        delete (payload as any).fullName;
      }

      const r = await fetch('/api/verification/seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        const j = await r.json().catch(() => null);
        throw new Error(j?.error || 'Ошибка сохранения данных продавца');
      }

      setSellerMsg('Данные продавца сохранены (на модерации)');
      setSellerReadonly(true);
    } catch (err: any) {
      setSellerMsg(err?.message || 'Ошибка сохранения');
    } finally {
      setSellerSaving(false);
    }
  }

  // 上传文档（当前页面已经不提供上传入口，但逻辑保留）
  async function onUploadDoc(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', docType);

      const r = await fetch('/api/verification/documents', {
        method: 'POST',
        body: fd,
      });

      if (!r.ok) {
        const j = await r.json().catch(() => null);
        throw new Error(j?.error || 'Ошибка загрузки документа');
      }

      await refreshDocs();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  // 删除文档（逻辑保留以备后用）
  async function removeDoc(id: string) {
    if (!confirm('Удалить документ?')) return;
    await fetch(`/api/verification/documents/${id}`, { method: 'DELETE' });
    await refreshDocs();
  }

  // 保存银行信息（支持 IBAN / 卡号）
  async function saveBank() {
    setBankMsg(null);
    setBankSaving(true);

    try {
      if (!bankForm.beneficiaryName.trim()) {
        setBankMsg('Пожалуйста, укажите имя получателя');
        setBankSaving(false);
        return;
      }

      const payload =
        bankForm.accountType === 'IBAN'
          ? {
              accountType: 'IBAN' as const,
              beneficiaryName: bankForm.beneficiaryName.trim(),
              iban: bankForm.iban.trim(),
              bankName: bankForm.bankName.trim() || null,
              bic: bankForm.bic.trim() || null,
            }
          : {
              accountType: 'CARD' as const,
              beneficiaryName: bankForm.beneficiaryName.trim(),
              cardNumber: bankForm.cardNumber.replace(/\s+/g, ''),
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
        setBankMsg(firstErr || json?.error || 'Не удалось сохранить');
      } else {
        setBankMsg('Платёжные реквизиты сохранены');
      }
    } catch (err) {
      console.error(err);
      setBankMsg('Ошибка сохранения');
    } finally {
      setBankSaving(false);
    }
  }

  // ---------------------------
  // 5. 文案 Hint + 完成按钮状态
  // ---------------------------

  const hintLine1 = useMemo(
    () =>
      isCompany
        ? 'Укажите БИН, юридический/фактический адрес, контактные данные.'
        : 'Укажите ИИН, контактные данные.',
    [isCompany]
  );

  const hintLine2 = useMemo(
    () =>
      isCompany
        ? 'Загрузите свидетельства о регистрации (JPEG/PNG/PDF).'
        : 'Загрузите сканы Удостоверение личности/паспорта (JPEG/PNG/PDF).',
    [isCompany]
  );

  // 文档状态文本（只用于显示“已/未上传”）
  const docsStatusText = useMemo(() => {
    if (!docs || docs.length === 0) {
      return 'Документы ещё не загружены.';
    }
    if (docs.length === 1) {
      return 'Загружен 1 документ.';
    }
    if (docs.length >= 2 && docs.length <= 4) {
      return `Загружено ${docs.length} документа.`;
    }
    return `Загружено ${docs.length} документов.`;
  }, [docs]);

  // 判断三个步骤是否“基本完成”
  const hasSellerCore = useMemo(
    () =>
      !!seller.iinBin &&
      (!isCompany
        ? !!(seller.fullName && seller.fullName.trim())
        : !!(seller.companyName && seller.companyName.trim())),
    [seller.iinBin, seller.fullName, seller.companyName, isCompany]
  );

  const hasDocs = useMemo(() => docs.length > 0, [docs]);

  const hasBankCore = useMemo(() => {
    const hasBeneficiary = !!bankForm.beneficiaryName.trim();
    if (!hasBeneficiary) return false;
    if (bankForm.accountType === 'IBAN') {
      return !!bankForm.iban.trim();
    }
    return !!bankForm.cardNumber.replace(/\s+/g, '');
  }, [
    bankForm.accountType,
    bankForm.beneficiaryName,
    bankForm.iban,
    bankForm.cardNumber,
  ]);

  const canFinish = hasSellerCore && hasDocs && hasBankCore;

  function onFinishVerification() {
    if (!canFinish) return;
    setFinishMsg(
      'Ваши данные собраны и будут переданы на модерацию командой Onerinn.'
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------------------------
  // 6. Render
  // ---------------------------

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* ===== 顶部引导 + 主体类型 ===== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h1 className="text-lg md:text-xl font-semibold">Начало верификации</h1>
        {/* 说明：这是给想发布/出租/卖东西的用户用的流程 */}
        <p className="mt-1 text-xs text-gray-500">
          Этот раздел предназначен для пользователей, которые хотят размещать
          объявления, сдавать технику в аренду или продавать произведения
          искусства на Onerinn.
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Заполните данные, загрузите документы и привяжите банковский счёт. Вы
          можете вернуться к шагам позже — прогресс сохранится.
        </p>

        <div className="mt-3 inline-flex rounded-full border border-gray-300 bg-white p-1 text-sm">
          <button
            type="button"
            onClick={() => pickType('INDIVIDUAL')}
            className={`rounded-full px-3 py-1 cursor-pointer ${
              !isCompany
                ? 'bg-gray-900 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Верифицировать как частное лицо
          </button>
          <button
            type="button"
            onClick={() => pickType('COMPANY')}
            className={`rounded-full px-3 py-1 cursor-pointer ${
              isCompany
                ? 'bg-gray-900 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Верифицировать как юридическое лицо
          </button>
        </div>
      </div>

      {/* ===== 模块1: 卖家资料 ===== */}
      <section className="rounded-2xl border border-gray-200 bg白 p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">
              Данные продавца/арендодателя
            </div>
            <p className="mt-1 text-xs text-gray-600">{hintLine1}</p>
            <p className="text-xs text-gray-600">{hintLine2}</p>
          </div>

          <button
            type="button"
            onClick={() => setSellerReadonly((v) => !v)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-50 cursor-pointer"
          >
            {sellerReadonly ? 'Редактировать' : 'Просмотр'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* ФИО / Компания */}
          {!isCompany ? (
            <div>
              <label className="mb-1 block text-sm font-medium">ФИО *</label>
              <input
                value={seller.fullName ?? ''}
                onChange={onChangeSeller('fullName')}
                required
                disabled={sellerReadonly}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
              />
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium">
                Название компании *
              </label>
              <input
                value={seller.companyName ?? ''}
                onChange={onChangeSeller('companyName')}
                required
                disabled={sellerReadonly}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
              />
            </div>
          )}

          {/* ИИН / БИН */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              {isCompany ? 'БИН *' : 'ИИН *'}
            </label>
            <input
              value={seller.iinBin ?? ''}
              onChange={onChangeSeller('iinBin')}
              placeholder={isCompany ? 'БИН (12 цифр)' : 'ИИН (12 цифр)'}
              required
              disabled={sellerReadonly}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
            />
          </div>

          {/* Country / City */}
          <div>
            <label className="mb-1 block text-sm font-medium">Страна</label>
            <input
              value={seller.country ?? ''}
              onChange={onChangeSeller('country')}
              disabled={sellerReadonly}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Город</label>
            <input
              value={seller.city ?? ''}
              onChange={onChangeSeller('city')}
              disabled={sellerReadonly}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
            />
          </div>

          {/* Region / District */}
          <div>
            <label className="mb-1 block text-sm font-medium">Регион</label>
            <input
              value={seller.region ?? ''}
              onChange={onChangeSeller('region')}
              disabled={sellerReadonly}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Район / Округ
            </label>
            <input
              value={seller.district ?? ''}
              onChange={onChangeSeller('district')}
              disabled={sellerReadonly}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
            />
          </div>

          {/* Только для компании: юр/факт адрес */}
          {isCompany && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Юридический адрес *
                </label>
                <input
                  value={seller.legalAddress ?? ''}
                  onChange={onChangeSeller('legalAddress')}
                  required
                  disabled={sellerReadonly}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Фактический адрес *
                </label>
                <input
                  value={seller.actualAddress ?? ''}
                  onChange={onChangeSeller('actualAddress')}
                  required
                  disabled={sellerReadonly}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
                />
              </div>
            </>
          )}

          {/* 联系方式 */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Контактное лицо
            </label>
            <input
              value={seller.contactName ?? ''}
              onChange={onChangeSeller('contactName')}
              disabled={sellerReadonly}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Телефон</label>
            <input
              value={seller.phone ?? ''}
              onChange={onChangeSeller('phone')}
              disabled={sellerReadonly}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">E-mail</label>
            <input
              type="email"
              value={seller.email ?? ''}
              onChange={onChangeSeller('email')}
              disabled={sellerReadonly}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
            />
          </div>
        </div>

        {/* Save seller */}
        <div className="mt-4 flex flex-wrap items-center justify-start gap-3">
          <button
            type="button"
            disabled={sellerSaving}
            onClick={saveSeller}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50 cursor-pointer"
          >
            {sellerSaving ? 'Сохранение…' : 'Сохранить данные'}
          </button>

          {sellerMsg && (
            <div className="text-sm text-gray-700">{sellerMsg}</div>
          )}
        </div>
      </section>

      {/* ===== 模块2: Документы ===== */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-sm font-medium md:text-base">
              Документы для верификации продавца / арендодателя
            </div>
            <p className="mt-1 text-xs text-gray-600">
              Этот раздел предназначен для пользователей, которые хотят
              размещать объявления и получать выплаты на Onerinn как продавец
              или арендодатель.
            </p>
            <p className="mt-1 text-xs text-gray-600">
              На этом шаге вы загружаете документы, необходимые для
              верификации аккаунта.
            </p>
            <p className="mt-1 text-xs text-gray-600">{hintLine2}</p>
            <p className="mt-1 text-[11px] text-gray-500">
              Ваши документы хранятся в зашифрованном виде в защищённом
              хранилище Onerinn. Доступ к ним есть только у службы безопасности
              и команды верификации.
            </p>
            <p className="mt-2 text-xs font-medium text-gray-700">
              {docsStatusText}
            </p>
          </div>

          <div className="flex items-start md:items-center">
            <Link
              href="/ru/profile/verify/documents"
              className="inline-flex items-center justify-center rounded-full border border-gray-900 bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black hover:border-black transition-colors cursor-pointer text-center leading-tight min-h-[48px]"
            >
              Перейти к загрузке документов
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 模块3: Банковский счёт для выплат ===== */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">
              Банковский счёт для выплат
            </div>
            <p className="mt-1 text-xs text-gray-600">
              Эти данные используются для переводов в вашу пользу. Вы можете
              указать IBAN или номер карты.
            </p>
          </div>

          <a
            href="/ru/dashboard/payouts"
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-50 cursor-pointer"
          >
            Просмотр
          </a>
        </div>

        {/* 账户类型选择 */}
        <div className="mb-4">
          <div className="mb-2 text-xs font-medium text-gray-700">
            Тип счёта
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="accountType"
                className="h-4 w-4"
                checked={bankForm.accountType === 'IBAN'}
                onChange={() => onBankTypeChange('IBAN')}
              />
              <span>IBAN</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="accountType"
                className="h-4 w-4"
                checked={bankForm.accountType === 'CARD'}
                onChange={() => onBankTypeChange('CARD')}
              />
              <span>Номер карты</span>
            </label>
          </div>
        </div>

        {/* 表单区域 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Получатель */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">
              Получатель <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Введите имя получателя"
              value={bankForm.beneficiaryName}
              onChange={(e) =>
                onChangeBank({ beneficiaryName: e.target.value })
              }
            />
          </div>

          {bankForm.accountType === 'IBAN' ? (
            <>
              {/* Банк (необязательно) */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Банк (необязательно)
                </label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Halyk / Kaspi …"
                  value={bankForm.bankName}
                  onChange={(e) => onChangeBank({ bankName: e.target.value })}
                />
              </div>

              {/* IBAN */}
              <div>
                <label className="mb-1 block text.sm font-medium">IBAN</label>
                <input
                  ref={ibanRef}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="KZxx xxxx xxxx xxxx xxxx"
                  value={bankForm.iban}
                  onChange={(e) => onChangeBank({ iban: e.target.value })}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Пример: KZ12 3456 7890 1234 5678
                </p>
              </div>

              {/* БИК */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  БИК (необязательно)
                </label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="HLALKZKZ"
                  value={bankForm.bic}
                  onChange={(e) => onChangeBank({ bic: e.target.value })}
                />
              </div>
            </>
          ) : (
            <>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  Номер карты
                </label>
                <input
                  ref={cardRef}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="1234 5678 9012 3456"
                  value={bankForm.cardNumber}
                  onChange={(e) =>
                    onChangeBank({ cardNumber: formatCard(e.target.value) })
                  }
                />
                <p className="mt-1 text-xs text-gray-500">
                  Введите 16-значный номер карты. Банк и БИК не нужны.
                </p>
              </div>
            </>
          )}
        </div>

        {/* 保存银行信息 */}
        <div className="mt-6 flex flex-wrap items-center justify-start gap-3">
          <button
            type="button"
            disabled={bankSaving}
            onClick={saveBank}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50 cursor-pointer"
          >
            {bankSaving ? 'Сохранение…' : 'Сохранить реквизиты'}
          </button>

          <Link
            href="/ru/dashboard/payouts"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
          >
            К выплатам
          </Link>

          {bankMsg && <div className="text-sm text-gray-700">{bankMsg}</div>}
        </div>
      </section>

      {/* ===== 底部总状态 + 完成按钮 ===== */}
      <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-medium">Завершить верификацию</div>
            <p className="mt-1 text-xs text-gray-600">
              Пожалуйста, заполните данные продавца, загрузите документы и
              сохраните платёжные реквизиты.
            </p>
            {finishMsg && (
              <p className="mt-1 text-xs text-green-600">{finishMsg}</p>
            )}
          </div>
          <button
            type="button"
            disabled={!canFinish}
            onClick={onFinishVerification}
            className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
              canFinish
                ? 'bg-gray-900 text-white hover:bg-black cursor-pointer'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Завершить верификацию
          </button>
        </div>
      </section>
    </div>
  );
}

// /src/app/ru/dashboard/verification/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type SellerType = 'INDIVIDUAL' | 'COMPANY';

type SellerForm = {
  sellerType: SellerType;
  iinBin: string;
  companyName?: string | null;

  country?: string | null;
  region?: string | null;
  city?: string | null;

  // 个人不采集详细地址；公司采集以下两项
  legalAddress?: string | null;
  actualAddress?: string | null;

  postalCode?: string | null;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
};

type BankForm = {
  bankName?: string | null;
  beneficiaryName?: string | null;
  accountNumber?: string | null;
  bic?: string | null;
};

type Doc = {
  id: string;
  type: string;
  url: string;
  filename?: string | null;
  uploadedAt?: string;
};

export default function VerificationPage() {
  // 顶部「开始验证」里的主体类型开关（影响下方三个模块）
  const [seller, setSeller] = useState<SellerForm>({
    sellerType: 'INDIVIDUAL',
    iinBin: '',
    companyName: '',
    country: '',
    region: '',
    city: '',
    legalAddress: '',
    actualAddress: '',
    postalCode: '',
    contactName: '',
    phone: '',
    email: '',
  });
  const [bank, setBank] = useState<BankForm>({
    bankName: '',
    beneficiaryName: '',
    accountNumber: '',
    bic: '',
  });
  const [docs, setDocs] = useState<Doc[]>([]);

  // 加载状态与消息
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // 每个模块的「Редактировать」开关：默认可编辑；保存成功后可切换为只读
  const [sellerReadonly, setSellerReadonly] = useState(false);
  const [docsReadonly, setDocsReadonly] = useState(false);
  const [bankReadonly, setBankReadonly] = useState(false);

  const isCompany = seller.sellerType === 'COMPANY';

  // ===== 数据加载 =====
  const refreshDocs = async () => {
    const r = await fetch('/api/verification/documents', { cache: 'no-store' });
    const j = await r.json();
    setDocs(j?.data ?? []);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [rs, rb] = await Promise.all([
        fetch('/api/verification/seller', { cache: 'no-store' }),
        fetch('/api/verification/bank', { cache: 'no-store' }),
      ]);
      const js = await rs.json();
      const jb = await rb.json();
      if (js?.data) setSeller((p) => ({ ...p, ...js.data }));
      if (jb?.data) setBank((p) => ({ ...p, ...jb.data }));
      await refreshDocs();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ===== 顶部主体类型选择（不跳页，直接影响下面三个块的提示/字段）=====
  const pickType = (t: SellerType) => setSeller((prev) => ({ ...prev, sellerType: t }));

  // ===== 卖家信息：提交到 /api/verification/seller =====
  const onChangeSeller =
    (k: keyof SellerForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setSeller((prev) => ({ ...prev, [k]: e.target.value }));

  const saveSeller = async () => {
    const payload: SellerForm = { ...seller };
    // 个人不发送 address（我们也没展示采集）
    if (payload.sellerType === 'INDIVIDUAL') {
      delete (payload as any).legalAddress;
      delete (payload as any).actualAddress;
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
  };

  // ===== 证件上传：/api/verification/documents =====
  const [docType, setDocType] = useState('passport');
  const [uploading, setUploading] = useState(false);
  const onUploadDoc = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', docType);
      const r = await fetch('/api/verification/documents', { method: 'POST', body: fd });
      if (!r.ok) {
        const j = await r.json().catch(() => null);
        throw new Error(j?.error || 'Ошибка загрузки документа');
      }
      await refreshDocs();
    } finally {
      setUploading(false);
    }
  };
  const removeDoc = async (id: string) => {
    if (!confirm('Удалить документ?')) return;
    await fetch(`/api/verification/documents/${id}`, { method: 'DELETE' });
    await refreshDocs();
  };

  // ===== 收款账户：/api/verification/bank =====
  const onChangeBank =
    (k: keyof BankForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setBank((prev) => ({ ...prev, [k]: e.target.value }));

  const saveBank = async () => {
    const r = await fetch('/api/verification/bank', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bank),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => null);
      throw new Error(j?.error || 'Ошибка сохранения банковских данных');
    }
  };

  // ===== 底部统一保存按钮：按顺序保存三个模块（允许部分空）=====
  const onSaveAll = async () => {
    setMsg(null);
    setSaving(true);
    try {
      await saveSeller();
      await saveBank();
      setMsg('Сохранено. Статус: на модерации.');
      // 保存后默认进入只读（可再点“Редактировать”）
      setSellerReadonly(true);
      setBankReadonly(true);
      // 文档区始终可上传/删除，不强制只读
    } catch (e: any) {
      setMsg(e?.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="space-y-5">
      {/* 顶部：开始验证 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h1 className="text-lg md:text-xl font-semibold">Начало верификации</h1>
        <p className="mt-1 text-sm text-gray-600">
          Заполните данные, загрузите документы и привяжите банковский счёт. Вы можете вернуться к шагам позже — прогресс сохранится.
        </p>

        {/* 主体类型两个按钮（不跳页） */}
        <div className="mt-3 inline-flex rounded-full border border-gray-300 bg-white p-1">
          <button
            type="button"
            onClick={() => pickType('INDIVIDUAL')}
            className={`rounded-full px-3 py-1 text-sm ${!isCompany ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`}
          >
            Верифицировать как частное лицо
          </button>
          <button
            type="button"
            onClick={() => pickType('COMPANY')}
            className={`rounded-full px-3 py-1 text-sm ${isCompany ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`}
          >
            Верифицировать как юридическое лицо
          </button>
        </div>
      </div>

      {/* 模块 1：卖家/出租方信息 */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Данные продавца/арендодателя</div>
            <p className="mt-1 text-xs text-gray-600">{hintLine1}</p>
            <p className="text-xs text-gray-600">{hintLine2}</p>
          </div>
          <button
            type="button"
            onClick={() => setSellerReadonly((v) => !v)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-50"
          >
            {sellerReadonly ? 'Редактировать' : 'Просмотр'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">{isCompany ? 'БИН *' : 'ИИН *'}</label>
            <input
              value={seller.iinBin ?? ''}
              onChange={onChangeSeller('iinBin')}
              placeholder={isCompany ? 'БИН (12 цифр)' : 'ИИН (12 цифр)'}
              required
              disabled={sellerReadonly}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
            />
          </div>

          {isCompany && (
            <div>
              <label className="mb-1 block text-sm font-medium">Название компании *</label>
              <input
                value={seller.companyName ?? ''}
                onChange={onChangeSeller('companyName')}
                required
                disabled={sellerReadonly}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
              />
            </div>
          )}

          {/* 可选地域信息（非敏感） */}
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
            <label className="mb-1 block text-sm font-medium">Регион</label>
            <input
              value={seller.region ?? ''}
              onChange={onChangeSeller('region')}
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

          {/* 公司才显示 юр/факт 地址；个人不采集详细地址 */}
          {isCompany && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium">Юридический адрес *</label>
                <input
                  value={seller.legalAddress ?? ''}
                  onChange={onChangeSeller('legalAddress')}
                  required
                  disabled={sellerReadonly}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Фактический адрес *</label>
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

          <div>
            <label className="mb-1 block text-sm font-medium">Почтовый индекс</label>
            <input
              value={seller.postalCode ?? ''}
              onChange={onChangeSeller('postalCode')}
              disabled={sellerReadonly}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Контактное лицо</label>
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
      </section>

      {/* 模块 2：证件上传 */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Документы</div>
            <p className="mt-1 text-xs text-gray-600">
              {isCompany
                ? 'Загрузите свидетельства о регистрации (JPEG/PNG/PDF).'
                : 'Загрузите сканы Удостоверение личности/паспорта (JPEG/PNG/PDF).'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDocsReadonly((v) => !v)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-50"
          >
            {docsReadonly ? 'Редактировать' : 'Просмотр'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="mb-1 block text-sm font-medium">Тип документа</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              disabled={docsReadonly}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
            >
              {isCompany ? (
                <>
                  <option value="registration">Свидетельство о регистрации</option>
                  <option value="charter">Устав / Учредительные</option>
                  <option value="representative_id">Документ представителя</option>
                  <option value="other">Другое</option>
                </>
              ) : (
                <>
                  <option value="passport">Паспорт / Удостоверение личности</option>
                  <option value="other">Другое</option>
                </>
              )}
            </select>

            <label className="mt-3 mb-1 block text-sm font-medium">Файл</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              disabled={docsReadonly || uploading}
              onChange={(e) => onUploadDoc(e.target.files?.[0] ?? null)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm disabled:bg-gray-50"
            />
          </div>

          <div className="md:col-span-2">
            <div className="mb-2 text-sm font-medium">Загруженные</div>
            {docs.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
                Пусто
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {docs.map((d) => (
                  <li key={d.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm">
                    <div className="min-w-0">
                      <div className="font-medium">{d.type}</div>
                      <div className="truncate text-gray-600">{d.filename || d.url}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={d.url} target="_blank" className="rounded border border-gray-300 px-3 py-1.5 hover:bg-gray-50">
                        Открыть
                      </a>
                      {!docsReadonly && (
                        <button
                          type="button"
                          onClick={() => removeDoc(d.id)}
                          className="rounded border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* 模块 3：收款账户 */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Банковский счёт для выплат</div>
            <p className="mt-1 text-xs text-gray-600">Эти данные используются для переводов в вашу пользу.</p>
          </div>
          <button
            type="button"
            onClick={() => setBankReadonly((v) => !v)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-50"
          >
            {bankReadonly ? 'Редактировать' : 'Просмотр'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Банк</label>
            <input
              value={bank.bankName ?? ''}
              onChange={onChangeBank('bankName')}
              disabled={bankReadonly}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
              placeholder="Halyk / Kaspi ..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Получатель *</label>
            <input
              value={bank.beneficiaryName ?? ''}
              onChange={onChangeBank('beneficiaryName')}
              disabled={bankReadonly}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
              placeholder="ФИО / Компания"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Счёт / IBAN *</label>
            <input
              value={bank.accountNumber ?? ''}
              onChange={onChangeBank('accountNumber')}
              disabled={bankReadonly}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
              placeholder="KZxx xxxx xxxx xxxx"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">БИК</label>
            <input
              value={bank.bic ?? ''}
              onChange={onChangeBank('bic')}
              disabled={bankReadonly}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
              placeholder="HLALKZKZ"
            />
          </div>
        </div>
      </section>

      {/* 底部：统一保存 + 跳往“К выплатам” */}
      {msg && <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">{msg}</div>}

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onSaveAll}
          disabled={saving}
          className="rounded-lg border border-gray-900 bg-gray-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
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
    </div>
  );
}

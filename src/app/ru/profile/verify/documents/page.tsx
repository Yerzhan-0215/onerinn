// src/app/ru/profile/verify/documents/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type MeUser = {
  id: string;
  username?: string | null;
  email?: string | null;
};

type DocType =
  | 'passport'
  | 'id_card'
  | 'registration'
  | 'address'
  | 'other';

type VerificationDocument = {
  id: string;
  type: DocType;
  url: string;
  filename: string | null;
  uploadedAt: string;
};

const DOC_DEFS: {
  type: DocType;
  label: string;
  description: string;
  forCompany?: boolean;
}[] = [
  {
    type: 'passport',
    label: 'Удостоверение личности / паспорт',
    description: 'Основной документ, подтверждающий личность владельца аккаунта.',
  },
  {
    type: 'id_card',
    label: 'Альтернативный документ личности (если есть)',
    description: 'Например, вид на жительство или другой документ.',
  },
  {
    type: 'registration',
    label: 'Свидетельство о регистрации ТОО / ИП',
    description: 'Обязательно для компаний и ИП-продавцов.',
    forCompany: true,
  },
  {
    type: 'address',
    label: 'Документ, подтверждающий адрес',
    description: 'Например, справка о регистрации, квитанция ЖКХ, договор аренды.',
  },
  {
    type: 'other',
    label: 'Дополнительный документ',
    description: 'Любой документ, который может повысить доверие к продавцу.',
  },
];

export default function ProfileVerifyDocumentsPage() {
  const router = useRouter();

  const [me, setMe] = useState<MeUser | null | undefined>(undefined);
  const [meLoading, setMeLoading] = useState(true);

  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);

  // URL 输入
  const [urlInputs, setUrlInputs] = useState<Record<DocType, string>>({
    passport: '',
    id_card: '',
    registration: '',
    address: '',
    other: '',
  });

  // 文件输入（每种类型一个 File）
  const [fileInputs, setFileInputs] = useState<Record<DocType, File | null>>({
    passport: null,
    id_card: null,
    registration: null,
    address: null,
    other: null,
  });

  const [savingType, setSavingType] = useState<DocType | null>(null);
  const [uploadingType, setUploadingType] = useState<DocType | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 1) 检查登录状态
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch('/api/me', { cache: 'no-store' });
        if (!alive) return;

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const user: MeUser | null = data?.user ?? null;
          setMe(user);

          if (!user) {
            router.replace('/ru/login?callbackUrl=/ru/profile/verify/documents');
            return;
          }
        } else {
          setMe(null);
          router.replace('/ru/login?callbackUrl=/ru/profile/verify/documents');
          return;
        }
      } catch {
        if (!alive) return;
        setMe(null);
        router.replace('/ru/login?callbackUrl=/ru/profile/verify/documents');
        return;
      } finally {
        if (alive) setMeLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [router]);

  // 2) 加载当前用户证件列表
  useEffect(() => {
    if (!me || meLoading) return;

    let alive = true;

    (async () => {
      try {
        setDocsLoading(true);
        setError(null);

        const res = await fetch('/api/profile/verification/documents', {
          cache: 'no-store',
        });

        if (!alive) return;

        if (!res.ok) {
          if (res.status === 401) {
            setError('Необходимо войти в систему, чтобы просматривать документы.');
          } else {
            setError('Не удалось загрузить список документов.');
          }
          return;
        }

        const json = await res.json().catch(() => ({}));
        const docs: VerificationDocument[] = json?.documents ?? [];

        setDocuments(docs);

        // 根据已有记录预填 URL 输入框
        const nextInputs: Record<DocType, string> = {
          passport: '',
          id_card: '',
          registration: '',
          address: '',
          other: '',
        };

        for (const t of Object.keys(nextInputs) as DocType[]) {
          const doc = docs.find((d) => d.type === t);
          if (doc) nextInputs[t] = doc.url;
        }

        setUrlInputs(nextInputs);
      } catch {
        if (!alive) return;
        setError('Не удалось загрузить список документов.');
      } finally {
        if (alive) setDocsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [me, meLoading]);

  // 用 URL 保存
  async function handleSaveUrl(type: DocType) {
    const url = urlInputs[type]?.trim();

    setError(null);
    setSuccess(null);

    if (!url) {
      setError('Пожалуйста, укажите ссылку на документ.');
      return;
    }

    setSavingType(type);

    try {
      const res = await fetch('/api/profile/verification/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          url,
          filename: null,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.ok) {
        const msg =
          json?.error === 'INVALID_TYPE'
            ? 'Неверный тип документа.'
            : json?.error === 'URL_REQUIRED'
            ? 'Пожалуйста, укажите ссылку на документ.'
            : 'Не удалось сохранить документ. Попробуйте позже.';
        setError(msg);
        return;
      }

      const saved: VerificationDocument = json.document;

      setDocuments((prev) => {
        const others = prev.filter((d) => d.type !== type);
        return [saved, ...others];
      });

      setSuccess('Ссылка на документ успешно сохранена.');
    } catch (e) {
      console.error(e);
      setError('Произошла ошибка при сохранении документа.');
    } finally {
      setSavingType(null);
    }
  }

  // 真实文件上传
  async function handleUploadFile(type: DocType) {
    const file = fileInputs[type];

    setError(null);
    setSuccess(null);

    if (!file) {
      setError('Пожалуйста, выберите файл для загрузки.');
      return;
    }

    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);
    formData.append('filename', file.name);

    setUploadingType(type);

    try {
      const res = await fetch('/api/profile/verification/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.ok) {
        const code = json?.error;
        const msg =
          code === 'FILE_REQUIRED'
            ? 'Файл не был получен сервером.'
            : code === 'FILE_TOO_LARGE'
            ? 'Файл слишком большой. Попробуйте уменьшить размер.'
            : code === 'INVALID_TYPE'
            ? 'Неверный тип документа.'
            : code === 'R2_NOT_CONFIGURED'
            ? 'Хранилище R2 пока не настроено. Обратитесь к администратору.'
            : 'Не удалось загрузить файл. Попробуйте позже.';
        setError(msg);
        return;
      }

      const saved: VerificationDocument = json.document;

      // 替换同一 type 的记录
      setDocuments((prev) => {
        const others = prev.filter((d) => d.type !== type);
        return [saved, ...others];
      });

      // 更新 URL 输入框，方便用户看到真实链接
      setUrlInputs((prev) => ({
        ...prev,
        [type]: saved.url,
      }));

      // 上传完成后清空本地 file 引用
      setFileInputs((prev) => ({
        ...prev,
        [type]: null,
      }));

      setSuccess('Файл успешно загружен и сохранён.');
    } catch (e) {
      console.error(e);
      setError('Произошла ошибка при загрузке файла.');
    } finally {
      setUploadingType(null);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      {/* 顶部返回 / 标题区 */}
      <div className="flex items-center justify-between gap-3 mb-2">
        {/* 🔁 改为回到 /ru/dashboard/verification */}
        <Link
          href="/ru/dashboard/verification"
          className="text-xs md:text-sm text-blue-600 hover:underline"
        >
          ← Назад к верификации
        </Link>

        <span className="text-[11px] md:text-xs text-gray-500">
          Загрузка документов для верификации
        </span>
      </div>

      <div className="space-y-2">
        <h1 className="text-lg md:text-xl font-semibold text-gray-800">
          Документы для верификации продавца / арендодателя
        </h1>
        <p className="text-sm text-gray-600">
          На этом шаге вы загружаете документы, необходимые для проверки и
          подтверждения аккаунта продавца / арендодателя. Достаточно одного
          документа, который надёжно подтверждает ваши данные.
        </p>
        <p className="text-sm text-gray-600">
          Ваши документы хранятся в зашифрованном виде в защищённом хранилище
          Onerinn. Доступ к ним есть только у службы безопасности и команды
          верификации.
        </p>
        {/* 可选说明：提示文件上传后已自动保存 */}
        <p className="text-xs text-gray-500">
          Все добавленные ссылки и файлы сохраняются автоматически. После
          загрузки документов вы можете вернуться на страницу верификации,
          чтобы указать банковские реквизиты.
        </p>
      </div>

      {docsLoading && (
        <p className="text-sm text-gray-500">Загрузка списка документов…</p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}

      {/* 卡片列表 */}
      {!docsLoading && (
        <div className="space-y-4">
          {DOC_DEFS.map((def) => {
            const current = documents.find((d) => d.type === def.type);
            const urlValue = urlInputs[def.type];
            const fileValue = fileInputs[def.type];

            return (
              <div
                key={def.type}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-gray-800">
                        {def.label}
                      </h2>
                      {def.forCompany && (
                        <span className="rounded-full bg-indigo-50 px-2 py-[2px] text-[10px] font-medium text-indigo-700">
                          Для компаний
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {def.description}
                    </p>
                  </div>

                  {current ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-[2px] text-[10px] font-medium text-emerald-700">
                      Документ добавлен
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-50 px-2 py-[2px] text-[10px] font-medium text-gray-500">
                      Документ не добавлен
                    </span>
                  )}
                </div>

                {/* URL 方式 */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700">
                    Ссылка на документ (URL)
                  </label>
                  <input
                    type="text"
                    value={urlValue}
                    onChange={(e) =>
                      setUrlInputs((prev) => ({
                        ...prev,
                        [def.type]: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Например: https://example.com/passport-scan.png"
                  />

                  {current && (
                    <p className="text-[11px] text-gray-500">
                      Текущий сохранённый URL:{' '}
                      <a
                        href={current.url}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-blue-600 hover:underline"
                      >
                        {current.url}
                      </a>
                    </p>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSaveUrl(def.type)}
                      disabled={savingType === def.type}
                      className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-xs md:text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {savingType === def.type
                        ? 'Сохранение…'
                        : current
                        ? 'Обновить ссылку'
                        : 'Сохранить ссылку'}
                    </button>
                  </div>
                </div>

                {/* 文件上传方式 */}
                <div className="space-y-2 border-t border-gray-100 pt-3">
                  <label className="block text-xs font-medium text-gray-700">
                    Или загрузите файл (jpg, png, pdf)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setFileInputs((prev) => ({
                        ...prev,
                        [def.type]: file,
                      }));
                    }}
                    className="block w-full text-xs text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white file:hover:bg-blue-700"
                  />
                  {fileValue && (
                    <p className="text-[11px] text-gray-500">
                      Выбран файл:{' '}
                      <span className="font-medium">{fileValue.name}</span>{' '}
                      ({Math.round(fileValue.size / 1024)} КБ)
                    </p>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleUploadFile(def.type)}
                      disabled={uploadingType === def.type}
                      className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-xs md:text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {uploadingType === def.type
                        ? 'Загрузка…'
                        : current
                        ? 'Обновить файл'
                        : 'Загрузить файл'}
                    </button>
                  </div>

                  <p className="text-[11px] text-gray-500">
                    Файлы загружаются в зашифрованном виде в защищённое
                    хранилище Onerinn. Доступ к документам есть только у
                    службы безопасности и команды верификации.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 text-[11px] text-gray-500">
        После добавления основных документов администратор сможет
        просматривать их в панели модерации и принимать решение об
        одобрении или отклонении заявки.
      </div>

      {/* 底部：保存并返回到统一的 верификация 页面 */}
      <div className="mt-6 flex justify-end">
        <Link
          href="/ru/dashboard/verification"
          className="inline-flex items-center justify-center rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black cursor-pointer"
        >
          Сохранить и вернуться к верификации
        </Link>
      </div>
    </div>
  );
}

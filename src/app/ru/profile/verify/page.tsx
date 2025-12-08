// src/app/ru/profile/verify/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 当前登录用户的简要信息（从 /api/me 来）
type MeUser = {
  id: string;
  username?: string | null;
  email?: string | null;
};

// 验证类型：个人 / 公司
type VerificationType = 'PERSON' | 'COMPANY';

// 后端预留的验证状态（后面做 API 和 Admin 页时会用到）
type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// 从后端获取的已有验证信息（预留类型）
type VerificationInfo = {
  type: VerificationType;
  status: VerificationStatus;
  // 个人
  fullName?: string | null;
  iin?: string | null;
  // 公司
  companyName?: string | null;
  bin?: string | null;
  // 通用备注
  comment?: string | null;
} | null;

type SaveResponse =
  | { ok: true; verification: VerificationInfo }
  | { ok: false; error: string };

export default function ProfileVerifyPage() {
  const router = useRouter();

  const [me, setMe] = useState<MeUser | null | undefined>(undefined);
  const [meLoading, setMeLoading] = useState(true);

  // 当前页面表单状态
  const [type, setType] = useState<VerificationType>('PERSON');

  const [fullName, setFullName] = useState(''); // ФИО (для физ. лица)
  const [iin, setIin] = useState(''); // ИИН

  const [companyName, setCompanyName] = useState(''); // Название компании
  const [bin, setBin] = useState(''); // БИН
  const [comment, setComment] = useState(''); // Доп. комментарий

  const [initialVerification, setInitialVerification] =
    useState<VerificationInfo>(null);

  const [status, setStatus] = useState<VerificationStatus | null>(null);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 1) 加载当前登录用户（未登录则跳转到 /ru/login）
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
            // 未登录：跳转到登录页，带回跳地址
            router.replace('/ru/login?callbackUrl=/ru/profile/verify');
            return;
          }
        } else {
          setMe(null);
          router.replace('/ru/login?callbackUrl=/ru/profile/verify');
          return;
        }
      } catch {
        if (!alive) return;
        setMe(null);
        router.replace('/ru/login?callbackUrl=/ru/profile/verify');
        return;
      } finally {
        if (alive) {
          setMeLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [router]);

  // 2) 加载当前用户已有的验证信息（预留：/api/profile/verification）
  useEffect(() => {
    if (!me || meLoading) return;

    let alive = true;

    (async () => {
      try {
        setPageLoading(true);
        setError(null);

        // ⚠️ 这里的接口我们后面会单独实现：
        // GET /api/profile/verification → 返回 { ok, verification }
        const res = await fetch('/api/profile/verification', {
          cache: 'no-store',
        });

        if (!alive) return;

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const ver: VerificationInfo | null = data?.verification ?? null;

          if (ver) {
            setInitialVerification(ver);
            setStatus(ver.status);

            // 根据已存在的记录预填表单
            if (ver.type === 'PERSON') {
              setType('PERSON');
              setFullName(ver.fullName ?? '');
              setIin(ver.iin ?? '');
            } else if (ver.type === 'COMPANY') {
              setType('COMPANY');
              setCompanyName(ver.companyName ?? '');
              setBin(ver.bin ?? '');
            }
            setComment(ver.comment ?? '');
          }
        } else if (res.status === 404) {
          // 没有记录视为首次提交
          setInitialVerification(null);
          setStatus(null);
        } else {
          // 其他错误不影响用户填写表单，只提示一下
          setError('Не удалось загрузить статус верификации.');
        }
      } catch {
        if (!alive) return;
        setError('Не удалось загрузить статус верификации.');
      } finally {
        if (alive) {
          setPageLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [me, meLoading]);

  const isPerson = type === 'PERSON';
  const isCompany = type === 'COMPANY';

  // 提交表单 → POST /api/profile/verification（后面会实现）
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!me) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: any = {
        type,
        comment: comment.trim() || null,
      };

      if (isPerson) {
        payload.fullName = fullName.trim() || null;
        payload.iin = iin.trim() || null;
      } else if (isCompany) {
        payload.companyName = companyName.trim() || null;
        payload.bin = bin.trim() || null;
      }

      const res = await fetch('/api/profile/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => ({}))) as SaveResponse;

      if (!res.ok || !data.ok) {
        throw new Error(
          (data as any)?.error || `SERVER_${res.status}`,
        );
      }

      const ver = data.verification ?? null;
      setInitialVerification(ver);
      setStatus(ver?.status ?? null);

      setSuccess(
        'Заявка на верификацию отправлена. Администратор свяжется с вами при необходимости.',
      );
    } catch (err: any) {
      setError(
        err?.message || 'Не удалось отправить заявку на верификацию.',
      );
    } finally {
      setLoading(false);
    }
  }

  const statusLabel =
    status === 'APPROVED'
      ? 'Ваш аккаунт подтвержден как проверенный продавец.'
      : status === 'PENDING'
      ? 'Ваша заявка находится на рассмотрении.'
      : status === 'REJECTED'
      ? 'Ваша заявка была отклонена. Вы можете отправить данные повторно.'
      : null;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      {/* 顶部返回 / 标题区 */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <Link
          href="/ru/profile"
          className="text-xs md:text-sm text-blue-600 hover:underline"
        >
          ← Назад в профиль
        </Link>

        <span className="text-[11px] md:text-xs text-gray-500">
          Раздел верификации продавца
        </span>
      </div>

      <div className="space-y-2">
        <h1 className="text-lg md:text-xl font-semibold text-gray-800">
          Верификация продавца
        </h1>
        <p className="text-sm text-gray-600">
          Заполните данные, чтобы мы могли подтвердить вас как
          проверенного продавца на Onerinn. Это повышает доверие
          покупателей и может увеличить количество сделок.
        </p>
      </div>

      {/* 状态提示块 */}
      {pageLoading && (
        <p className="text-sm text-gray-500">
          Загрузка статуса верификации…
        </p>
      )}

      {!pageLoading && statusLabel && (
        <div
          className={`rounded-lg border px-3 py-2 text-xs md:text-sm ${
            status === 'APPROVED'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : status === 'PENDING'
              ? 'border-amber-200 bg-amber-50 text-amber-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {status === 'APPROVED' && (
            <span className="mr-1">✅</span>
          )}
          {status === 'PENDING' && (
            <span className="mr-1">⏳</span>
          )}
          {status === 'REJECTED' && (
            <span className="mr-1">⚠️</span>
          )}
          {statusLabel}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-emerald-600">
          {success}
        </p>
      )}

      {/* 主表单区域 */}
      {!pageLoading && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          {/* 选择：个人 / 公司 */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-800">
              Тип продавца
            </h2>
            <p className="text-xs text-gray-500">
              Выберите, как вы планируете продавать на платформе.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setType('PERSON')}
                className={`flex-1 rounded-lg border px-3 py-2 text-left text-sm transition ${
                  isPerson
                    ? 'border-blue-600 bg-blue-50 text-blue-800'
                    : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">👤</span>
                  <div>
                    <div className="font-semibold">
                      Я — частное лицо
                    </div>
                    <div className="text-xs text-gray-500">
                      Продаю от своего имени, как физическое лицо.
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('COMPANY')}
                className={`flex-1 rounded-lg border px-3 py-2 text-left text-sm transition ${
                  isCompany
                    ? 'border-blue-600 bg-blue-50 text-blue-800'
                    : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏢</span>
                  <div>
                    <div className="font-semibold">
                      Я — компания
                    </div>
                    <div className="text-xs text-gray-500">
                      Продаю от имени ТОО / ИП с БИН.
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 根据类型显示不同字段 */}
          {isPerson && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-800">
                Данные частного лица
              </h2>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">
                  ФИО <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Например: Иванов Иван Иванович"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">
                  ИИН
                </label>
                <input
                  type="text"
                  value={iin}
                  onChange={(e) => setIin(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="12 цифр ИИН"
                />
              </div>
            </div>
          )}

          {isCompany && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-800">
                Данные компании
              </h2>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">
                  Название компании <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Например: ТОО «Onerinn KZ»"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">
                  БИН
                </label>
                <input
                  type="text"
                  value={bin}
                  onChange={(e) => setBin(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="12 цифр БИН"
                />
              </div>
            </div>
          )}

          {/* 通用备注 */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">
              Дополнительная информация
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Например: контактные данные бухгалтера или менеджера, удобное время для связи и т.п."
            />
          </div>

          {/* 提交按钮区 */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
            <p className="text-[11px] text-gray-500 max-w-xs">
              После отправки заявки администратор проверит данные и
              обновит статус. При необходимости мы можем связаться с
              вами для уточнения деталей.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-xs md:text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Отправка…' : 'Отправить на проверку'}
            </button>
          </div>
        </form>
      )}

      {/* 预留：链接到下一步“загрузка документов” */}
      <div className="mt-2 text-xs text-gray-500">
        После сохранения основных данных вы сможете перейти к шагу
        загрузки документов:{' '}
        <span className="text-gray-800">
          /ru/profile/verify/documents
        </span>{' '}
        (мы настроим этот шаг следующим этапом).
      </div>
    </div>
  );
}

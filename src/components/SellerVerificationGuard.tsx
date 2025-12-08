// src/components/SellerVerificationGuard.tsx
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type SellerVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type MeResponse =
  | { user: null }
  | {
      user: {
        id: string;
        username?: string | null;
        sellerVerificationStatus?: SellerVerificationStatus | null;
      };
    };

type Props = {
  children: ReactNode;
};

/**
 * 统一的“卖家验证拦截器”
 *
 * 逻辑：
 * - 加载 /api/me，拿到 sellerVerificationStatus
 * - 未登录：提示去登录
 * - status !== 'APPROVED'：提示去 /ru/dashboard/verification 完成验证
 * - status === 'APPROVED'：正常渲染 children（页面原来的内容）
 */
export default function SellerVerificationGuard({ children }: Props) {
  const [status, setStatus] = useState<
    'LOADING' | 'NO_AUTH' | SellerVerificationStatus
  >('LOADING');

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/me', { cache: 'no-store' });

        if (!res.ok) {
          if (!cancelled) setStatus('NO_AUTH');
          return;
        }

        const data: MeResponse = await res.json();

        if (!('user' in data) || !data.user) {
          if (!cancelled) setStatus('NO_AUTH');
          return;
        }

        const sv =
          data.user.sellerVerificationStatus && data.user.sellerVerificationStatus !== null
            ? data.user.sellerVerificationStatus
            : 'PENDING';

        if (!cancelled) setStatus(sv);
      } catch {
        if (!cancelled) setStatus('NO_AUTH');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // 1) 加载中
  if (status === 'LOADING') {
    return (
      <div className="mx-auto mt-10 w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
        Проверяем статус верификации…
      </div>
    );
  }

  // 2) 未登录
  if (status === 'NO_AUTH') {
    return (
      <div className="mx-auto mt-10 w-full max-w-3xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800 shadow-sm">
        <div className="mb-2 text-base font-semibold">
          Требуется вход в аккаунт
        </div>
        <p className="mb-4">
          Чтобы публиковать объявления и проходить верификацию продавца, вам
          нужно войти в аккаунт.
        </p>
        <button
          type="button"
          onClick={() =>
            router.push(
              `/ru/login?callbackUrl=${encodeURIComponent(
                pathname || '/ru/dashboard'
              )}`
            )
          }
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
        >
          Войти
        </button>
      </div>
    );
  }

  // 3) 还没通过审核（PENDING/REJECTED）—— 禁止新建，只给提示 + 跳转按钮
  if (status !== 'APPROVED') {
    const isRejected = status === 'REJECTED';

    return (
      <div className="mx-auto mt-10 w-full max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900 shadow-sm">
        <div className="mb-2 text-base font-semibold">
          {isRejected
            ? 'Верификация отклонена'
            : 'Верификация продавца ещё не завершена'}
        </div>

        <p className="mb-2">
          {isRejected
            ? 'Ваши данные были отклонены модератором. Пожалуйста, обновите информацию и загрузите корректные документы, чтобы снова отправить заявку и размещать объявления.'
            : 'Чтобы разместить новое объявление, сначала завершите верификацию продавца и привяжите платёжные реквизиты.'}
        </p>

        <p className="mb-4 text-xs text-amber-800/80">
          Это помогает защитить покупателей и продавцов на Onerinn и уменьшает
          риск мошенничества.
        </p>

        <button
          type="button"
          onClick={() => router.push('/ru/dashboard/verification')}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
        >
          Перейти к верификации
        </button>
      </div>
    );
  }

  // 4) status === 'APPROVED' -> 放行
  return <>{children}</>;
}

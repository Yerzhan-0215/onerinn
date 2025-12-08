'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const pathname = usePathname() || '';

  // ✅ 自动识别语言前缀
  const lang =
    pathname.startsWith('/ru') ? 'ru' :
    pathname.startsWith('/kk') ? 'kk' :
    pathname.startsWith('/zh') ? 'zh' : 'en';
  const prefix = lang === 'en' ? '' : `/${lang}`;

  const [identity, setIdentity] = useState(''); // e-mail или телефон
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isFormValid = identity.trim();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSent(false);

    if (!isFormValid) return;
    setLoading(true);

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'Ошибка при отправке');
      setSent(true);
    } catch (e: any) {
      setErr(e.message || 'Ошибка при отправке');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full grid place-items-center px-3 py-6 bg-gray-50">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[19rem] rounded-xl border border-gray-200 bg-white p-5 shadow-md shadow-gray-200"
      >
        {!sent ? (
          <>
            <h1 className="mb-3 text-center text-lg font-semibold">
              Восстановление пароля
            </h1>

            <div className="space-y-2.5">
              <p className="text-xs text-gray-600 text-center">
                Введите ваш e-mail или телефон, указанный при регистрации.
              </p>

              <input
                id="identity"
                name="identity"
                type="text"
                placeholder="E-mail или телефон (например +77011234567)"
                className="h-9 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
              />

              {err && (
                <p className="text-xs text-red-600 text-center">{err}</p>
              )}

              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`h-9 w-full rounded-lg text-[13px] text-white transition-colors ${
                  !isFormValid || loading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Отправляем…' : 'Отправить ссылку'}
              </button>

              <p className="text-center text-xs text-gray-500">
                Мы отправим ссылку для восстановления, если такой аккаунт
                существует.
              </p>

              <p className="text-center text-xs text-gray-500">
                <Link
                  href={`${prefix}/login`}
                  className="text-blue-600 hover:underline"
                >
                  Вернуться ко входу
                </Link>
              </p>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-green-600 text-center mb-3">
              ✅ Если такой аккаунт существует, мы отправили ссылку для
              восстановления на вашу почту или телефон.
            </p>

            <button
              type="button"
              onClick={() => router.push(`${prefix}/login`)}
              className="h-9 w-full rounded-lg bg-blue-600 text-[13px] text-white hover:bg-blue-700"
            >
              Войти
            </button>
          </>
        )}
      </form>
    </div>
  );
}

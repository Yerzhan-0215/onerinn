// src/app/ru/reset-password/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import PasswordField from '@/components/PasswordField';

export default function ResetPasswordPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp?.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  // 表单是否可提交
  const isFormValid =
    password.trim().length >= 6 &&
    password2.trim().length >= 6 &&
    password === password2 &&
    !!token;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErr(null);

    if (!token) {
      setErr('Ссылка недействительна. Запросите новую.');
      return;
    }
    if (password !== password2) {
      setErr('Пароли не совпадают');
      return;
    }
    if (password.length < 6) {
      setErr('Минимальная длина пароля — 6 символов');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // 根据后端返回的 code 给出更友好的提示
        switch (data?.code) {
          case 'TOKEN_EXPIRED':
            throw new Error('Ссылка устарела. Пожалуйста, запросите новую.');
          case 'TOKEN_NOT_FOUND':
            throw new Error('Ссылка недействительна или уже использована.');
          case 'PASSWORD_TOO_SHORT':
            throw new Error('Пароль слишком короткий (минимум 6 символов).');
          case 'USER_NOT_FOUND':
            throw new Error('Пользователь не найден.');
          default:
            throw new Error(data?.error ?? 'Не удалось обновить пароль');
        }
      }

      setOk(true);

      // 如果你想 2 秒后自动去登录页，可以放开下面这段：
      // setTimeout(() => {
      //   router.replace('/ru/login');
      // }, 2000);
    } catch (e: any) {
      setErr(e.message || 'Ошибка обновления пароля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full grid place-items-center px-3 py-6 bg-gray-50">
      <div className="w-full max-w-[19rem] rounded-xl border border-gray-200 bg-white p-5 shadow-md shadow-gray-200">
        {!ok ? (
          <form onSubmit={onSubmit} className="space-y-2.5">
            <h1 className="mb-3 text-center text-lg font-semibold">
              Сброс пароля
            </h1>

            {!token && (
              <p className="text-xs text-red-600 text-center mb-2">
                Ссылка недействительна. Попросите отправить её заново на странице{' '}
                <Link href="/ru/forgot-password" className="text-blue-600 underline">
                  восстановления
                </Link>
                .
              </p>
            )}

            <PasswordField
              id="password"
              name="password"
              placeholder="Новый пароль"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-9 text-sm"
              fieldSize="sm"
            />

            <PasswordField
              id="password2"
              name="password2"
              placeholder="Подтвердите новый пароль"
              autoComplete="new-password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="h-9 text-sm"
              fieldSize="sm"
            />

            {err && <p className="text-xs text-red-600 text-center">{err}</p>}

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className={`h-9 w-full rounded-lg text-[13px] text-white transition-colors ${
                loading || !isFormValid
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Обновляем…' : 'Обновить пароль'}
            </button>
          </form>
        ) : (
          <>
            <div className="mb-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-[13px] text-green-700 text-center">
              Пароль успешно обновлён. Пожалуйста, войдите с новым паролем.
            </div>
            <Link
              href="/ru/login"
              className="block h-9 w-full rounded-lg bg-blue-600 text-center leading-9 text-[13px] text-white hover:bg-blue-700"
            >
              Войти
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

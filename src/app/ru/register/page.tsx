'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PasswordField from '@/components/PasswordField';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [identity, setIdentity] = useState(''); // e-mail или +77..
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false); // ✅ 新增状态：注册成功

  const isFormValid =
    username.trim() &&
    identity.trim() &&
    password.trim() &&
    password2.trim() &&
    accepted;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSuccess(false);

    if (password !== password2) {
      setErr('Пароли не совпадают');
      return;
    }

    if (!accepted) {
      setErr('Пожалуйста, подтвердите согласие с условиями сервиса');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, identity, password })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? 'Ошибка регистрации');
      }

      // ✅ 注册成功后的提示与跳转
      setSuccess(true);
      setTimeout(() => {
        router.push('/ru/login');
      }, 2000);
    } catch (e: any) {
      setErr(e.message);
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
        <h1 className="mb-3 text-center text-lg font-semibold">
          Зарегистрироваться
        </h1>

        <div className="space-y-2.5">
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Имя пользователя"
            autoComplete="username"
            className="h-9 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            id="identity"
            name="identity"
            type="text"
            placeholder="E-mail или телефон +77.."
            autoComplete="email"
            className="h-9 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
          />

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

          {/* ✅ 协议勾选 */}
          <label className="flex items-start gap-2 mt-2 text-[11.5px] leading-snug text-gray-600">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-[2px]"
            />
            <span>
              Я принимаю условия{' '}
              <a
                href="/ru/terms"
                className="text-blue-600 underline"
                target="_blank"
                rel="noreferrer"
              >
                Пользовательского соглашения
              </a>
              ,{' '}
              <a
                href="/ru/privacy"
                className="text-blue-600 underline"
                target="_blank"
                rel="noreferrer"
              >
                Политики конфиденциальности
              </a>{' '}
              и{' '}
              <a
                href="/ru/disclaimer"
                className="text-blue-600 underline"
                target="_blank"
                rel="noreferrer"
              >
                Отказа от ответственности
              </a>
              .
            </span>
          </label>

          {/* ✅ 成功提示 */}
          {success && (
            <p className="text-xs text-green-600 text-center">
              ✅ Регистрация прошла успешно! Перенаправление...
            </p>
          )}

          {/* 错误提示 */}
          {err && !success && (
            <p className="text-xs text-red-600 text-center">{err}</p>
          )}

          {/* ✅ 注册按钮动态启用/禁用 */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`h-9 w-full rounded-lg text-[13px] text-white transition-colors ${
              !isFormValid || loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>

          <div className="pt-1">
            <GoogleSignInButton
              loading={loading}
              className="h-9 w-full text-[13px]"
              label="Войти через Gmail"
            />
          </div>

          <p className="text-center text-xs text-gray-500">
            Уже есть аккаунт?{' '}
            <Link href="/ru/login" className="text-blue-600 hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

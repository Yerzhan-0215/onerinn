'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import PasswordField from '@/components/PasswordField';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname() || '';

  // ✅ 语言前缀逻辑保留（你原来这部分非常好）
  const lang =
    pathname.startsWith('/ru') ? 'ru' :
    pathname.startsWith('/kk') ? 'kk' :
    pathname.startsWith('/zh') ? 'zh' : 'en';
  const prefix = lang === 'en' ? '' : `/${lang}`;

  // ✅ 状态
  const [identity, setIdentity] = useState(''); // e-mail / телефон / имя пользователя
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ✅ 增加前端校验逻辑（统一风格）
  const isFormValid = identity.trim() && password.trim();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identity, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          data?.code === 'INVALID_CREDENTIALS'
            ? 'Неверный логин или пароль'
            : data?.code === 'REQUIRED_FIELDS'
            ? 'Заполните логин и пароль'
            : 'Ошибка входа';
        throw new Error(msg);
      }

      // ✅ 登录成功后刷新并跳转到当前语言 dashboard
      router.refresh();
      router.replace(`${prefix}/dashboard`);
    } catch (e: any) {
      setErr(e?.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full grid place-items-center px-3 py-6 bg-gray-50">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[19rem] rounded-xl border border-gray-200 bg-white p-5 shadow-md shadow-gray-200"
        aria-describedby={err ? 'login-error' : undefined}
      >
        <h1 className="mb-3 text-center text-lg font-semibold">Войти</h1>

        <div className="space-y-2.5">
          <input
            id="identity"
            name="identity"
            type="text"
            placeholder="E-mail, телефон или имя пользователя"
            autoComplete="username"
            className="h-9 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
          />

          <PasswordField
            id="password"
            name="password"
            placeholder="Пароль"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-9 text-sm"
            fieldSize="sm"
          />

          {/* ✅ 忘记密码 */}
          <div className="flex justify-end -mt-1">
            <Link
              href={`${prefix}/forgot-password`}
              className="text-[11.5px] text-blue-600 hover:underline"
            >
              Забыли пароль?
            </Link>
          </div>

          {/* 错误提示 */}
          {err && (
            <div id="login-error" className="text-xs text-center text-red-600">
              {err}
            </div>
          )}

          {/* ✅ 登录按钮：输入完整才激活 */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`h-9 w-full rounded-lg text-[13px] text-white transition-colors ${
              !isFormValid || loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Входим...' : 'Войти'}
          </button>

          {/* ✅ Gmail 登录 */}
          <div className="pt-1">
            <GoogleSignInButton
              loading={loading}
              className="h-9 w-full text-[13px]"
              label="Войти через Gmail"
            />
          </div>

          {/* ✅ 去注册 */}
          <p className="text-center text-xs text-gray-500">
            Нет аккаунта?{' '}
            <Link
              href={`${prefix}/register`}
              className="text-blue-600 hover:underline"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

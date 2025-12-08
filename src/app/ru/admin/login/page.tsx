'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Не удалось войти');
      }

      router.push('/ru/admin');
    } catch (err: any) {
      setError(err.message || 'Ошибка входа');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="
        flex 
        min-h-[calc(100dvh-var(--site-header-h)-var(--site-footer-h))]
        items-start justify-center
        pt-10 pb-10 px-4
      "
    >
      <div
        className="
          w-full max-w-xs
          rounded-2xl
          bg-white
          border border-slate-100
          shadow-[0_10px_25px_rgba(15,23,42,0.08)]
          px-4 py-5
        "
      >
        {/* 标题 */}
        <h1 className="mb-1 text-center text-lg font-semibold text-slate-900">
          Вход администратора
        </h1>

        <p className="mb-4 text-center text-[11px] text-slate-400 leading-tight">
          Только для администраторов платформы Onerinn
        </p>

        {error && <p className="mb-3 text-center text-xs text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Логин */}
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-700">
              Логин (email или имя пользователя)
            </label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="
                w-full rounded-lg
                border border-slate-200
                bg-slate-50
                px-2.5 py-1.5
                text-sm outline-none
                focus:border-blue-500 focus:bg-white
                focus:ring-2 focus:ring-blue-200
              "
              autoComplete="username"
              required
            />
          </div>

          {/* Пароль + 小眼睛 */}
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-700">
              Пароль
            </label>

            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                  w-full rounded-lg
                  border border-slate-200
                  bg-slate-50
                  px-2.5 py-1.5
                  text-sm outline-none
                  focus:border-blue-500 focus:bg-white
                  focus:ring-2 focus:ring-blue-200
                "
                autoComplete="current-password"
                required
              />

              {/* 小眼睛按钮 */}
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="
                  absolute inset-y-0 right-2 flex items-center
                  text-slate-400 hover:text-slate-600
                "
              >
                {showPass ? (
                  // 眼睛打开
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       fill="none" 
                       viewBox="0 0 24 24" 
                       strokeWidth="1.8" 
                       stroke="currentColor" 
                       className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" 
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" 
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  // 眼睛关闭
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       fill="none" 
                       viewBox="0 0 24 24" 
                       strokeWidth="1.8" 
                       stroke="currentColor" 
                       className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" 
                          d="M3.98 8.223A10.45 10.45 0 012 12c1.274 4.057 5.065 7 9.542 7 1.74 0 3.41-.42 4.858-1.175M9.25 9.25A3 3 0 0114.75 14.75M6.228 6.228L17.77 17.77M9.878 9.878l.01-.01" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={submitting}
            className="
              mt-1.5 w-full rounded-lg bg-blue-600
              px-4 py-2 text-sm font-semibold text-white
              hover:bg-blue-700 shadow
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {submitting ? 'Входим…' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}

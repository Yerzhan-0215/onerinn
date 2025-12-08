'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import AuthCard from '@/components/AuthCard';
import { useSession } from 'next-auth/react'; // ✅ 新增

export default function RegisterPage() {
  const t = useTranslations('Auth');
  const tErr = useTranslations('Errors.Auth');
  const locale = useLocale();
  const router = useRouter();

  const { status } = useSession(); // ✅ 新增

  const [username, setUsername] = useState('');
  const [identity, setIdentity] = useState(''); // email 或 phone
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // ✅ 已登录则自动跳回对应语言首页
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(`/${locale}`);
    }
  }, [status, router, locale]);

  // 防止重定向前闪烁页面
  if (status === 'authenticated') {
    return null;
  }

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  function validateClient(): string | null {
    if (!username.trim() || !identity.trim() || !password || !password2) {
      return tErr('requiredFields');
    }
    if (password.length < 6) return tErr('passwordTooShort');
    if (password !== password2) return tErr('passwordMismatch');
    return null;
  }

  async function submitRegister() {
    if (submitting) return;
    const v = validateClient();
    if (v) {
      setErr(v);
      return;
    }

    setErr(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          identity,
          email: identity, // 兼容后端两种字段命名
          password
        })
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        const code = data?.code as string | undefined;
        if (code === 'EMAIL_EXISTS') setErr(tErr('emailAlreadyExists'));
        else if (code === 'PHONE_EXISTS') setErr(tErr('phoneAlreadyExists'));
        else if (code === 'PASSWORD_TOO_SHORT') setErr(tErr('passwordTooShort'));
        else if (code === 'USERNAME_EXISTS') setErr(tErr('invalidUsername'));
        else setErr(tErr('unknownError'));
        return;
      }

      router.push(`/${locale}/login`);
    } catch {
      setErr(tErr('unknownError'));
    } finally {
      setSubmitting(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitRegister();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitRegister();
    }
  }

  function onGoogle() {
    window.location.href = '/api/auth/google';
  }

  return (
    <AuthCard>
      <h1 className="mb-4 text-center text-xl font-semibold">{t('signUp')}</h1>

      {err && (
        <div
          className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
          aria-live="assertive"
        >
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <input
          ref={firstInputRef}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          placeholder={t('username')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="username"
          inputMode="text"
          aria-label={t('username')}
          required
        />

        <input
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          placeholder={t('identityPlaceholder')}
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="email"
          inputMode="email"
          aria-label={t('identityPlaceholder')}
          required
        />

        <div className="relative">
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10"
            type={showPw ? 'text' : 'password'}
            placeholder={t('newPassword')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="new-password"
            aria-label={t('newPassword')}
            required
          />
          <button
            type="button"
            aria-label={showPw ? t('hidePassword') : t('showPassword')}
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-black"
          >
            {showPw ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>

        <input
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          type="password"
          placeholder={t('confirmPassword')}
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="new-password"
          aria-label={t('confirmPassword')}
          required
        />

        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {submitting ? t('submitting') : t('signUp')}
        </button>
      </form>

      <GoogleSignInButton onClick={onGoogle} className="mt-2" />

      <div className="mt-3 text-center text-xs text-gray-500">
        {t('haveAccount')}{' '}
        <Link href={`/${locale}/login`} className="text-blue-600 hover:underline">
          {t('signIn')}
        </Link>
      </div>
    </AuthCard>
  );
}

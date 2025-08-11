'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import AuthCard from '@/components/AuthCard';

export default function LoginPage() {
  const t = useTranslations('Auth');
  const tErr = useTranslations('Errors.Auth');
  const locale = useLocale();
  const router = useRouter();

  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function submitLogin() {
    if (loading) return;
    setErr(null);

    if (!identity.trim() || !password) {
      setErr(tErr('requiredFields'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity,
          emailOrPhoneOrUsername: identity, // 兼容旧键名
          password
        })
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        const code = data?.code as string | undefined;
        if (code === 'REQUIRED_FIELDS') setErr(tErr('requiredFields'));
        else if (code === 'INVALID_CREDENTIALS' || res.status === 401) setErr(tErr('invalidCredentials'));
        else setErr(tErr('unknownError'));
        return;
      }

      router.push(`/${locale}`);
      router.refresh();
    } catch {
      setErr(tErr('unknownError'));
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitLogin();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitLogin();
    }
  }

  function onGoogle() {
    window.location.href = '/api/auth/google';
  }

  return (
    <AuthCard>
      <h1 className="mb-4 text-center text-xl font-semibold">{t('signIn')}</h1>

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
          ref={inputRef}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          placeholder={t('identityPlaceholder')}
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="username"
          aria-label={t('identityPlaceholder')}
          required
        />

        <div className="relative">
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10"
            type={showPw ? 'text' : 'password'}
            placeholder={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="current-password"
            aria-label={t('password')}
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

        <div className="mb-1 text-right">
          <Link href={`/${locale}/forgot-password`} className="text-xs text-blue-600 hover:underline">
            {t('forgotPassword')}
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {loading ? t('loggingIn') : t('signIn')}
        </button>
      </form>

      <GoogleSignInButton onClick={onGoogle} className="mt-2" />

      <div className="mt-3 text-center text-xs text-gray-500">
        {t('noAccount')}{' '}
        <Link href={`/${locale}/register`} className="text-blue-600 hover:underline">
          {t('signUp')}
        </Link>
      </div>
    </AuthCard>
  );
}

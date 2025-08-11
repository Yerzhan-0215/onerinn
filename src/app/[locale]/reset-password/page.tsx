'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function ResetPasswordPage() {
  const tAuth = useTranslations('Auth');
  const tErr = useTranslations('Errors.Auth');
  const locale = useLocale();
  const router = useRouter();
  const sp = useSearchParams();

  const [token, setToken] = useState<string | null>(null);
  const [pwd1, setPwd1] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [showPwd1, setShowPwd1] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setToken(sp.get('token'));
  }, [sp]);

  const prefix = locale === 'en' ? '' : `/${locale}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!token) {
      setError(tErr('badToken'));
      return;
    }
    if (!pwd1 || !pwd2) {
      setError(tErr('requiredFields'));
      return;
    }
    if (pwd1 !== pwd2) {
      setError(tErr('passwordMismatch'));
      return;
    }
    if (pwd1.length < 6) {
      setError(tErr('passwordTooShort'));
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: pwd1 })
      });

      if (res.ok) {
        setMessage(tAuth('passwordResetSuccess'));
        setPwd1('');
        setPwd2('');
        setTimeout(() => router.push(`${prefix}/login`), 1500);
      } else {
        const data = await res.json().catch(() => ({} as any));
        const code = data?.code as string | undefined;
        if (code === 'PASSWORD_TOO_SHORT') setError(tErr('passwordTooShort'));
        else if (code === 'EXPIRED') setError(tErr('tokenExpired'));
        else if (code === 'USED') setError(tErr('tokenUsed'));
        else setError(tErr('unknownError'));
      }
    } catch {
      setError(tErr('unknownError'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-3">
      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow w-full max-w-sm text-sm">
        <h1 className="text-center text-lg font-semibold mb-3">{tAuth('resetPassword')}</h1>

        {!token && <div className="mb-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-red-700">{tErr('badToken')}</div>}
        {message && <div className="mb-3 rounded border border-green-300 bg-green-50 px-3 py-2 text-green-700">{message}</div>}
        {error && <div className="mb-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-red-700">{error}</div>}

        <div className="relative mb-2">
          <input
            type={showPwd1 ? 'text' : 'password'}
            placeholder={tAuth('newPassword')}
            className="w-full border border-gray-300 rounded px-3 py-2 pr-10 focus:outline-none focus:ring focus:ring-blue-200 text-sm"
            value={pwd1}
            onChange={(e) => setPwd1(e.target.value)}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPwd1((v) => !v)}
            aria-label={showPwd1 ? tAuth('hidePassword') : tAuth('showPassword')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-black"
          >
            {showPwd1 ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>

        <div className="relative mb-3">
          <input
            type={showPwd2 ? 'text' : 'password'}
            placeholder={tAuth('confirmPassword')}
            className="w-full border border-gray-300 rounded px-3 py-2 pr-10 focus:outline-none focus:ring focus:ring-blue-200 text-sm"
            value={pwd2}
            onChange={(e) => setPwd2(e.target.value)}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPwd2((v) => !v)}
            aria-label={showPwd2 ? tAuth('hidePassword') : tAuth('showPassword')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-black"
          >
            {showPwd2 ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>

        <button type="submit" disabled={submitting || !token} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60 text-sm">
          {submitting ? tAuth('submitting') : tAuth('resetPassword')}
        </button>
      </form>
    </div>
  );
}
